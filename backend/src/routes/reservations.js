const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { hasRole } = require('../utils/authz');
const { firstOutValue } = require('../utils/oracle');

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
        e.ESTADO_RESERVA,
        u.NOMBRE_USUARIO,
        u.APELLIDO1_USUARIO,
        u.APELLIDO2_USUARIO,
        u.EMAIL_USUARIO
      FROM JRGY_RESERVA r
      LEFT JOIN JRGY_HABITACION h ON h.COD_HABITACION = r.COD_HABITACION
      LEFT JOIN JRGY_CAT_TIPO_HABITACION t ON t.COD_TIPO_HABITACION = h.COD_TIPO_HABITACION
      LEFT JOIN JRGY_CAT_ESTADO_RESERVA e ON e.COD_ESTADO_RESERVA = r.COD_ESTADO_RESERVA
      LEFT JOIN JRGY_USUARIO u ON u.COD_USUARIO = r.COD_USUARIO
      WHERE r.COD_RESERVA = :id
    `,
    { id }
  );
  return (res.rows || [])[0] || null;
}

function toReservationDTO(row) {
  return {
    id: row.COD_RESERVA,
    clienteId: row.COD_USUARIO,
    habitacionId: row.COD_HABITACION,
    numero: row.NRO_HABITACION,
    tipo: row.TIPO_HABITACION,
    estado: row.ESTADO_RESERVA,
    nombre: row.NOMBRE_USUARIO,
    apellido1: row.APELLIDO1_USUARIO,
    apellido2: row.APELLIDO2_USUARIO,
    email: row.EMAIL_USUARIO,
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
        const newId = firstOutValue(result.outBinds.id);
        if (!newId) {
          throw new AppError('No se pudo obtener el ID de la reserva recién creada', 500);
        }
        const row = await fetchReserva(conn, newId);
        res.status(201).json(toReservationDTO(row));
      } catch (err) {
        if (err.errorNum === 20060) throw new AppError('La fecha fin debe ser mayor o igual a la de inicio', 422);
        if (err.errorNum === 20061) throw new AppError('La habitación ya está reservada en ese rango de fechas', 409);
        if (err.errorNum === 20062) throw new AppError('Reserva en curso para esta habitación, intenta de nuevo', 409);
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

router.post(
  '/reservations/:id/cancel',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    await withConnection(async (conn) => {
      const reserva = await fetchReserva(conn, id);
      if (!reserva) throw new AppError('Reserva no encontrada', 404);
      const isOwner = reserva.COD_USUARIO === user.id;
      const isAdmin = hasRole(user, ['ADMIN', 'EMPLOYEE']);
      if (!isOwner && !isAdmin) throw new AppError('No autorizado', 403);

      const estadoActual = (reserva.ESTADO_RESERVA || '').toUpperCase();
      if (estadoActual !== 'CREADA') {
        throw new AppError('Solo puedes cancelar reservas en estado CREADA', 409);
      }

      const estadoCancelada = await fetchEstadoReservaId(conn, 'CANCELADA');

      try {
        await conn.execute(
          `
            UPDATE JRGY_RESERVA
            SET COD_ESTADO_RESERVA = :estado,
                UPDATED_AT = SYSDATE
            WHERE COD_RESERVA = :id
          `,
          { estado: estadoCancelada, id },
          { autoCommit: false }
        );

        await conn.execute(
          `
            INSERT INTO JRGY_EVENTO_RESERVA (COD_RESERVA, TIPO_EVENTO, FECHA_EVENTO, NOTAS, CREATED_BY)
            VALUES (:resId, 'CANCELADA', SYSDATE, :notas, :userId)
          `,
          {
            resId: id,
            notas: 'Reserva cancelada',
            userId: user.id
          },
          { autoCommit: false }
        );

        await conn.commit();
      } catch (err) {
        try {
          await conn.rollback();
        } catch (rollbackErr) {
          console.error('Error rollback cancel reservation', rollbackErr);
        }
        throw err;
      }
    });

    res.json({ ok: true });
  })
);

// Solicitud de check-out por parte del cliente (o admin/empleado).
router.post(
  '/reservations/:id/request-checkout',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    const updated = await withConnection(async (conn) => {
      const reserva = await fetchReserva(conn, id);
      if (!reserva) throw new AppError('Reserva no encontrada', 404);
      const isOwner = reserva.COD_USUARIO === user.id;
      const isAdmin = hasRole(user, ['ADMIN', 'EMPLOYEE']);
      if (!isOwner && !isAdmin) throw new AppError('No autorizado', 403);

      try {
        await conn.execute(
          `BEGIN JRGY_PRO_RESERVA_SOLICITAR_CHECKOUT(:resId, :userId); END;`,
          { resId: id, userId: user.id },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20020) throw new AppError('Reserva no encontrada', 404);
        if (err.errorNum === 20023) throw new AppError('La reserva no permite solicitar check-out', 409);
        if (err.errorNum === 20024) throw new AppError('El check-out ya fue solicitado', 409);
        throw err;
      }

      const row = await fetchReserva(conn, id);
      return toReservationDTO(row);
    });

    res.json(updated);
  })
);

// Check-in: valida datos del usuario en PL/SQL, bloquea la reserva y la pasa a EN PROCESO.
router.patch(
  '/reservations/:id/checkin',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const requester = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(requester, ['EMPLOYEE', 'ADMIN'])) throw new AppError('No autorizado', 403);

    const reservaId = Number(req.params.id);
    if (!reservaId) throw new AppError('ID inválido', 400);

    const nombreInput = String(req.body?.nombre || req.body?.name || '').trim();
    const emailInput = String(req.body?.email || '').trim().toLowerCase();
    const rutInput = String(req.body?.rut || req.body?.codUsuario || '').trim();
    if (!nombreInput || !emailInput || !rutInput) {
      throw new AppError('Nombre, correo y RUT son obligatorios para check-in', 422);
    }
    if (!/^[0-9]{7,8}$/.test(rutInput)) {
      throw new AppError('RUT inválido: use 7-8 dígitos sin DV', 422);
    }
    const rut = Number(rutInput);

    const updated = await withConnection(async (conn) => {
      const reserva = await fetchReserva(conn, reservaId);
      if (!reserva) throw new AppError('Reserva no encontrada', 404);

      const guestRes = await conn.execute(
        `
          SELECT COD_USUARIO, NOMBRE_USUARIO, APELLIDO1_USUARIO, APELLIDO2_USUARIO, EMAIL_USUARIO
          FROM JRGY_USUARIO
          WHERE COD_USUARIO = :id
        `,
        { id: reserva.COD_USUARIO }
      );
      const guest = (guestRes.rows || [])[0];
      if (!guest) throw new AppError('Cliente de la reserva no encontrado', 404);

      const canonicalEmail = String(guest.EMAIL_USUARIO || '').trim().toLowerCase();
      const canonicalName = `${guest.NOMBRE_USUARIO || ''} ${guest.APELLIDO1_USUARIO || ''} ${guest.APELLIDO2_USUARIO || ''}`
        .replace(/\s+/g, ' ')
        .trim();

      if (guest.COD_USUARIO !== rut || canonicalEmail !== emailInput) {
        throw new AppError('Los datos ingresados no coinciden con el titular', 422);
      }

      try {
        await conn.execute(
          `BEGIN JRGY_PRO_RESERVA_CHECKIN(:resId, :rut, :nombre, :email, :userId); END;`,
          { resId: reservaId, rut, nombre: nombreInput, email: emailInput, userId: requester.id },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20020) throw new AppError('Reserva no encontrada', 404);
        if (err.errorNum === 20021) throw new AppError('Cliente de la reserva no encontrado', 404);
        if (err.errorNum === 20022) throw new AppError('Datos ingresados no coinciden con el titular', 422);
        throw err;
      }
      const updatedRow = await fetchReserva(conn, reservaId);
      return toReservationDTO(updatedRow);
    });

    res.json(updated);
  })
);

// Check-out: valida datos del usuario en PL/SQL y pasa la reserva a FINALIZADA.
router.patch(
  '/reservations/:id/checkout',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const requester = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(requester, ['EMPLOYEE', 'ADMIN'])) throw new AppError('No autorizado', 403);

    const reservaId = Number(req.params.id);
    if (!reservaId) throw new AppError('ID inválido', 400);

    const nombreInput = String(req.body?.nombre || req.body?.name || '').trim();
    const emailInput = String(req.body?.email || '').trim().toLowerCase();
    const rutInput = String(req.body?.rut || req.body?.codUsuario || '').trim();
    if (!nombreInput || !emailInput || !rutInput) {
      throw new AppError('Nombre, correo y RUT son obligatorios para check-out', 422);
    }
    if (!/^[0-9]{7,8}$/.test(rutInput)) {
      throw new AppError('RUT inválido: use 7-8 dígitos sin DV', 422);
    }
    const rut = Number(rutInput);

    const updated = await withConnection(async (conn) => {
      const reserva = await fetchReserva(conn, reservaId);
      if (!reserva) throw new AppError('Reserva no encontrada', 404);

      const guestRes = await conn.execute(
        `
          SELECT COD_USUARIO, NOMBRE_USUARIO, APELLIDO1_USUARIO, APELLIDO2_USUARIO, EMAIL_USUARIO
          FROM JRGY_USUARIO
          WHERE COD_USUARIO = :id
        `,
        { id: reserva.COD_USUARIO }
      );
      const guest = (guestRes.rows || [])[0];
      if (!guest) throw new AppError('Cliente de la reserva no encontrado', 404);

      const canonicalEmail = String(guest.EMAIL_USUARIO || '').trim().toLowerCase();
      const canonicalName = `${guest.NOMBRE_USUARIO || ''} ${guest.APELLIDO1_USUARIO || ''} ${guest.APELLIDO2_USUARIO || ''}`
        .replace(/\s+/g, ' ')
        .trim();

      if (guest.COD_USUARIO !== rut || canonicalEmail !== emailInput) {
        throw new AppError('Los datos ingresados no coinciden con el titular', 422);
      }

      try {
        await conn.execute(
          `BEGIN JRGY_PRO_RESERVA_CHECKOUT(:resId, :rut, :nombre, :email, :userId); END;`,
          { resId: reservaId, rut, nombre: nombreInput, email: emailInput, userId: requester.id },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20020) throw new AppError('Reserva no encontrada', 404);
        if (err.errorNum === 20021) throw new AppError('Cliente de la reserva no encontrado', 404);
        if (err.errorNum === 20022) throw new AppError('Datos ingresados no coinciden con el titular', 422);
        throw err;
      }
      const updatedRow = await fetchReserva(conn, reservaId);
      return toReservationDTO(updatedRow);
    });

    res.json(updated);
  })
);

module.exports = router;
