const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { hasRole } = require('../utils/authz');

const router = express.Router();

async function fetchEstadoReservaId(conn, nombre) {
  const res = await conn.execute(
    'SELECT COD_ESTADO_RESERVA FROM JRGY_CAT_ESTADO_RESERVA WHERE UPPER(ESTADO_RESERVA) = UPPER(:nombre)',
    { nombre }
  );
  const row = (res.rows || [])[0];
  if (!row) {
    throw new AppError(`Estado de reserva no encontrado: ${nombre}`, 500);
  }
  return row.COD_ESTADO_RESERVA;
}

async function fetchReserva(conn, id) {
  const res = await conn.execute(
    `
      SELECT
        r.COD_RESERVA,
        r.COD_USUARIO,
        r.COD_HABITACION,
        r.FECHA_INICIO,
        r.FECHA_FIN,
        r.HUESPEDES,
        r.TOTAL_HABITACION,
        r.TOTAL_SERVICIOS,
        r.TOTAL,
        r.COD_ESTADO_RESERVA,
        h.NRO_HABITACION,
        t.TIPO_HABITACION,
        e.ESTADO_RESERVA
      FROM JRGY_RESERVA r
      LEFT JOIN JRGY_HABITACION h ON h.COD_HABITACION = r.COD_HABITACION
      LEFT JOIN JRGY_CAT_TIPO_HABITACION t ON t.COD_TIPO_HABITACION = h.COD_TIPO_HABITACION
      LEFT JOIN JRGY_CAT_ESTADO_RESERVA e ON e.COD_ESTADO_RESERVA = r.COD_ESTADO_RESERVA
      WHERE r.COD_RESERVA = :id
    `,
    { id }
  );
  return (res.rows || [])[0] || null;
}

function toReservationDTO(row) {
  return {
    id: row.COD_RESERVA,
    habitacionId: row.COD_HABITACION,
    numero: row.NRO_HABITACION,
    tipo: row.TIPO_HABITACION,
    estado: row.ESTADO_RESERVA,
    fechaInicio: row.FECHA_INICIO,
    fechaFin: row.FECHA_FIN,
    huespedes: row.HUESPEDES,
    totalHabitacion: row.TOTAL_HABITACION,
    totalServicios: row.TOTAL_SERVICIOS,
    total: row.TOTAL
  };
}

router.get(
  '/reservations',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    const isAdmin = hasRole(user, ['ADMIN', 'EMPLOYEE']);
    const listAll = isAdmin && req.query.all === '1';

    const rows = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_RESERVA_LISTAR(:userId, :isAdmin, :cursor); END;`,
        {
          userId: user.id,
          isAdmin: listAll ? 1 : 0,
          cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );
      const cursor = result.outBinds.cursor;
      const data = await cursor.getRows();
      await cursor.close();
      return data || [];
    });

    res.json(rows.map(toReservationDTO));
  })
);

router.post(
  '/reservations',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));

    const data = req.body || {};
    const habitacionId = Number(data.habitacionId);
    const huespedes = Number(data.huespedes || 1);
    const fechaInicio = new Date(data.fechaInicio);
    const fechaFin = new Date(data.fechaFin);

    if (!habitacionId) throw new AppError('Habitación requerida', 400);
    if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime())) {
      throw new AppError('Fechas inválidas', 400);
    }
    if (fechaFin < fechaInicio) {
      throw new AppError('La fecha fin debe ser mayor o igual a la de inicio', 400);
    }

    await withConnection(async (conn) => {
      try {
        const result = await conn.execute(
          `BEGIN JRGY_PRO_RESERVA_CREAR(:userId, :habId, :fi, :ff, :huespedes, :id); END;`,
          {
            userId: user.id,
            habId: habitacionId,
            fi: fechaInicio,
            ff: fechaFin,
            huespedes,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          },
          { autoCommit: true }
        );
        const newId = result.outBinds.id[0];
        const row = await fetchReserva(conn, newId);
        res.status(201).json(toReservationDTO(row));
      } catch (err) {
        if (err.errorNum === 20090) throw new AppError('La habitación no soporta esa cantidad de huéspedes', 422);
        if (err.errorNum === 20091) throw new AppError('Habitación no encontrada', 404);
        throw err;
      }
    });
  })
);

router.get(
  '/reservations/:id/events',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    const events = await withConnection(async (conn) => {
      const reserva = await fetchReserva(conn, id);
      if (!reserva) throw new AppError('Reserva no encontrada', 404);
      const isOwner = reserva.COD_USUARIO === user.id;
      const isAdmin = hasRole(user, ['ADMIN', 'EMPLOYEE']);
      if (!isOwner && !isAdmin) throw new AppError('No autorizado', 403);

      const result = await conn.execute(
        `
          SELECT
            COD_EVENTO_RESERVA AS ID,
            COD_RESERVA AS RESERVA_ID,
            TIPO_EVENTO,
            FECHA_EVENTO,
            NOTAS,
            CREATED_AT
          FROM JRGY_EVENTO_RESERVA
          WHERE COD_RESERVA = :id
          ORDER BY CREATED_AT DESC
        `,
        { id }
      );
      return result.rows || [];
    });

    res.json(
      events.map((e) => ({
        id: e.ID,
        reservaId: e.RESERVA_ID,
        tipo: e.TIPO_EVENTO,
        fecha: e.FECHA_EVENTO,
        notas: e.NOTAS,
        createdAt: e.CREATED_AT
      }))
    );
  })
);

router.post(
  '/reservations/:id/events',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    const { tipo, notas } = req.body || {};
    if (!tipo) throw new AppError('Tipo de evento requerido', 400);

    await withConnection(async (conn) => {
      const reserva = await fetchReserva(conn, id);
      if (!reserva) throw new AppError('Reserva no encontrada', 404);
      const isOwner = reserva.COD_USUARIO === user.id;
      const isAdmin = hasRole(user, ['ADMIN', 'EMPLOYEE']);
      if (!isOwner && !isAdmin) throw new AppError('No autorizado', 403);

      await conn.execute(
        `
          INSERT INTO JRGY_EVENTO_RESERVA (COD_RESERVA, TIPO_EVENTO, FECHA_EVENTO, NOTAS, CREATED_BY)
          VALUES (:resId, :tipo, SYSDATE, :notas, :userId)
        `,
        {
          resId: id,
          tipo: String(tipo).trim(),
          notas: (notas || '').trim() || null,
          userId: user.id
        },
        { autoCommit: true }
      );
    });

    res.status(201).json({ ok: true });
  })
);

module.exports = router;
