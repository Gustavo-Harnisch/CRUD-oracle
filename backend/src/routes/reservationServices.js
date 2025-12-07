const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { hasRole } = require('../utils/authz');

const EDITABLE_STATES = ['CREADA', 'CONFIRMADA', 'EN_PROCESO'];

const router = express.Router();

function toReservation(row) {
  return {
    id: row.COD_RESERVA,
    userId: row.COD_USUARIO,
    habitacionId: row.COD_HABITACION,
    fechaInicio: row.FECHA_INICIO,
    fechaFin: row.FECHA_FIN,
    estado: row.ESTADO_RESERVA,
    totalHabitacion: row.TOTAL_HABITACION,
    totalServicios: row.TOTAL_SERVICIOS
  };
}

async function fetchReserva(conn, id) {
  const res = await conn.execute(
    `
      SELECT r.*, e.ESTADO_RESERVA
      FROM JRGY_RESERVA r
      LEFT JOIN JRGY_CAT_ESTADO_RESERVA e ON e.COD_ESTADO_RESERVA = r.COD_ESTADO_RESERVA
      WHERE r.COD_RESERVA = :id
    `,
    { id }
  );
  return (res.rows || [])[0] || null;
}

async function ensureReservationAccess(conn, user, reservaId) {
  const reserva = await fetchReserva(conn, reservaId);
  if (!reserva) throw new AppError('Reserva no encontrada', 404);
  const isOwner = reserva.COD_USUARIO === user.id;
  const isStaff = hasRole(user, ['ADMIN', 'EMPLOYEE']);
  if (!isOwner && !isStaff) throw new AppError('No autorizado', 403);
  return reserva;
}

function ensureEditable(reserva) {
  const estadoNom = (reserva.ESTADO_RESERVA || '').toUpperCase();
  if (!EDITABLE_STATES.includes(estadoNom)) {
    throw new AppError('La reserva no permite agregar o editar servicios en su estado actual', 409);
  }
}

async function fetchService(conn, id) {
  const res = await conn.execute(
    `
      SELECT COD_SERVICIO, NOMBRE, PRECIO, ESTADO
      FROM JRGY_SERVICIO
      WHERE COD_SERVICIO = :id
    `,
    { id }
  );
  const row = (res.rows || [])[0];
  if (!row) throw new AppError('Servicio no encontrado', 404);
  if ((row.ESTADO || '').toLowerCase() !== 'activo') {
    throw new AppError('Servicio inactivo', 400);
  }
  return row;
}

async function fetchHorarios(conn, serviceId) {
  const res = await conn.execute(
    `
      SELECT HORA_INICIO, HORA_FIN
      FROM JRGY_SERVICIO_HORARIO
      WHERE COD_SERVICIO = :sid
    `,
    { sid: serviceId }
  );
  return res.rows || [];
}

function validateFechaHora(reserva, fechaServicio, hora, horarios) {
  if (!(fechaServicio instanceof Date) || Number.isNaN(fechaServicio.getTime())) {
    throw new AppError('Fecha de servicio inválida', 400);
  }
  const start = new Date(reserva.FECHA_INICIO);
  const end = new Date(reserva.FECHA_FIN);
  if (fechaServicio < start || fechaServicio > end) {
    throw new AppError('La fecha del servicio debe estar dentro del rango de la reserva', 409);
  }

  if (!Number.isFinite(hora) || hora < 0 || hora > 23) {
    throw new AppError('Hora inválida, use 0-23', 400);
  }

  if (Array.isArray(horarios) && horarios.length > 0) {
    const matches = horarios.some((h) => hora >= h.HORA_INICIO && hora <= h.HORA_FIN);
    if (!matches) {
      throw new AppError('La hora seleccionada no está en el rango permitido para el servicio', 400);
    }
  }
}

async function updateReservationTotals(conn, reservaId) {
  const sumRes = await conn.execute(
    `
      SELECT NVL(SUM(TOTAL), 0) AS TOTAL_SERVICIOS
      FROM JRGY_RESERVA_SERVICIO
      WHERE COD_RESERVA = :id
        AND LOWER(ESTADO) <> 'cancelado'
    `,
    { id: reservaId }
  );
  const totalServicios =
    (sumRes.rows && sumRes.rows[0] && (sumRes.rows[0].TOTAL_SERVICIOS ?? sumRes.rows[0].total_servicios)) || 0;

  await conn.execute(
    `
      UPDATE JRGY_RESERVA
      SET TOTAL_SERVICIOS = :ts,
          TOTAL = NVL(TOTAL_HABITACION, 0) + :ts,
          UPDATED_AT = SYSDATE
      WHERE COD_RESERVA = :id
    `,
    { ts: totalServicios, id: reservaId },
    { autoCommit: false }
  );
}

function toItemDTO(row) {
  return {
    id: row.COD_RESERVA_SERVICIO,
    reservaId: row.COD_RESERVA,
    servicioId: row.COD_SERVICIO,
    servicioNombre: row.NOMBRE,
    tipo: row.TIPO,
    fecha: row.FECHA_SERVICIO,
    hora: row.HORA,
    cantidad: row.CANTIDAD,
    precioUnit: row.PRECIO_UNIT,
    total: row.TOTAL,
    nota: row.NOTA,
    estado: row.ESTADO,
    createdAt: row.CREATED_AT,
    updatedAt: row.UPDATED_AT
  };
}

router.get(
  '/reservations/:id/services',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    const reservaId = Number(req.params.id);
    if (!reservaId) throw new AppError('ID inválido', 400);

    const items = await withConnection(async (conn) => {
      await ensureReservationAccess(conn, user, reservaId);
      const result = await conn.execute(
        `BEGIN JRGY_PRO_RESERVA_SERVICIO_LISTAR(:id, :cursor); END;`,
        { id: reservaId, cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cursor = result.outBinds.cursor;
      const rows = await cursor.getRows();
      await cursor.close();
      return rows || [];
    });

    res.json(items.map(toItemDTO));
  })
);

router.post(
  '/reservations/:id/services',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    const reservaId = Number(req.params.id);
    if (!reservaId) throw new AppError('ID inválido', 400);

    const data = req.body || {};
    const serviceId = Number(data.serviceId || data.servicioId);
    const cantidad = Number(data.cantidad || 1);
    const hora = Number(data.hora ?? data.hour);
    const fechaServicio = new Date(data.fechaServicio || data.fecha);
    const nota = (data.nota || data.comentario || '').trim() || null;

    if (!serviceId) throw new AppError('Servicio requerido', 400);
    if (!Number.isFinite(cantidad) || cantidad <= 0) throw new AppError('Cantidad inválida', 400);

    await withConnection(async (conn) => {
      const reserva = await ensureReservationAccess(conn, user, reservaId);
      ensureEditable(reserva);

      const service = await fetchService(conn, serviceId);
      const horarios = await fetchHorarios(conn, serviceId);
      validateFechaHora(reserva, fechaServicio, hora, horarios);

      try {
        const result = await conn.execute(
          `BEGIN JRGY_PRO_RESERVA_SERVICIO_ADD(:resId, :servId, :fserv, :hora, :cantidad, :nota, :id); END;`,
          {
            resId: reservaId,
            servId: serviceId,
            fserv: fechaServicio,
            hora,
            cantidad,
            nota,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          },
          { autoCommit: true }
        );

        const newId = result.outBinds.id[0];
        const row = await conn.execute(
          `
            SELECT
              rs.COD_RESERVA_SERVICIO,
              rs.COD_RESERVA,
              rs.COD_SERVICIO,
              s.NOMBRE,
              s.TIPO,
              rs.FECHA_SERVICIO,
              rs.HORA,
              rs.CANTIDAD,
              rs.PRECIO_UNIT,
              rs.TOTAL,
              rs.NOTA,
              rs.ESTADO,
              rs.CREATED_AT,
              rs.UPDATED_AT
            FROM JRGY_RESERVA_SERVICIO rs
            LEFT JOIN JRGY_SERVICIO s ON s.COD_SERVICIO = rs.COD_SERVICIO
            WHERE rs.COD_RESERVA_SERVICIO = :id
          `,
          { id: newId }
        );

        res.status(201).json(toItemDTO((row.rows || [])[0]));
      } catch (err) {
        if (err.errorNum === 20084) throw new AppError('Servicio inactivo', 400);
        if (err.errorNum === 20085) throw new AppError('La fecha está fuera del rango de la reserva', 409);
        if (err.errorNum === 20086) throw new AppError('Hora inválida', 400);
        if (err.errorNum === 20087) throw new AppError('La hora no está en el horario permitido', 400);
        if (err.errorNum === 20088) throw new AppError('Reserva o servicio no encontrado', 404);
        throw err;
      }
    });
  })
);

router.put(
  '/reservations/:id/services/:itemId',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    const reservaId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    if (!reservaId || !itemId) throw new AppError('ID inválido', 400);

    const data = req.body || {};
    const cantidad = Number(data.cantidad || 1);
    const hora = Number(data.hora ?? data.hour);
    const fechaServicio = data.fechaServicio || data.fecha ? new Date(data.fechaServicio || data.fecha) : null;
    const nota = (data.nota || data.comentario || '').trim() || null;
    const estado = (data.estado || '').trim().toLowerCase();

    if (!Number.isFinite(cantidad) || cantidad <= 0) throw new AppError('Cantidad inválida', 400);
    if (estado && !['pendiente', 'confirmado', 'cancelado'].includes(estado)) {
      throw new AppError('Estado inválido', 400);
    }

    await withConnection(async (conn) => {
      const reserva = await ensureReservationAccess(conn, user, reservaId);
      ensureEditable(reserva);

      const currentRes = await conn.execute(
        `
          SELECT rs.*, s.COD_SERVICIO, s.NOMBRE, s.TIPO, s.PRECIO
          FROM JRGY_RESERVA_SERVICIO rs
          LEFT JOIN JRGY_SERVICIO s ON s.COD_SERVICIO = rs.COD_SERVICIO
          WHERE rs.COD_RESERVA_SERVICIO = :itemId AND rs.COD_RESERVA = :resId
        `,
        { itemId, resId: reservaId }
      );
      const current = (currentRes.rows || [])[0];
      if (!current) throw new AppError('Servicio de reserva no encontrado', 404);

      const horarios = await fetchHorarios(conn, current.COD_SERVICIO);
      const targetFecha = fechaServicio || current.FECHA_SERVICIO;
      const targetHora = Number.isFinite(hora) ? hora : current.HORA;
      validateFechaHora(reserva, targetFecha, targetHora, horarios);

      try {
        await conn.execute(
          `BEGIN JRGY_PRO_RESERVA_SERVICIO_UPD(:itemId, :resId, :fserv, :hora, :cantidad, :nota, :estado); END;`,
          {
            itemId,
            resId: reservaId,
            fserv: targetFecha,
            hora: targetHora,
            cantidad,
            nota,
            estado: estado || null
          },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20085) throw new AppError('La fecha está fuera del rango de la reserva', 409);
        if (err.errorNum === 20086) throw new AppError('Hora inválida', 400);
        if (err.errorNum === 20087) throw new AppError('La hora no está en el horario permitido', 400);
        if (err.errorNum === 20089) throw new AppError('Servicio de reserva no encontrado', 404);
        throw err;
      }

      const row = await conn.execute(
        `
          SELECT
            rs.COD_RESERVA_SERVICIO,
            rs.COD_RESERVA,
            rs.COD_SERVICIO,
            s.NOMBRE,
            s.TIPO,
            rs.FECHA_SERVICIO,
            rs.HORA,
            rs.CANTIDAD,
            rs.PRECIO_UNIT,
            rs.TOTAL,
            rs.NOTA,
            rs.ESTADO,
            rs.CREATED_AT,
            rs.UPDATED_AT
          FROM JRGY_RESERVA_SERVICIO rs
          LEFT JOIN JRGY_SERVICIO s ON s.COD_SERVICIO = rs.COD_SERVICIO
          WHERE rs.COD_RESERVA_SERVICIO = :id
        `,
        { id: itemId }
      );

      res.json(toItemDTO((row.rows || [])[0]));
    });
  })
);

router.delete(
  '/reservations/:id/services/:itemId',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    const reservaId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    if (!reservaId || !itemId) throw new AppError('ID inválido', 400);

    await withConnection(async (conn) => {
      const reserva = await ensureReservationAccess(conn, user, reservaId);
      ensureEditable(reserva);

      try {
        await conn.execute(
          `BEGIN JRGY_PRO_RESERVA_SERVICIO_CANCELAR(:itemId, :resId); END;`,
          { itemId, resId: reservaId },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20089) throw new AppError('Servicio de reserva no encontrado', 404);
        throw err;
      }
    });

    res.json({ ok: true });
  })
);

module.exports = router;
