const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { extractToken, requireUserFromToken } = require('../services/authService');

const router = express.Router();

function mapRoom(row) {
  if (!row || row.ID === undefined) return null;
  return {
    id: row.ID,
    numero: row.NUMERO,
    capacidad: row.CAPACIDAD,
    precioBase: row.PRECIO_BASE,
    tipo: row.TIPO,
    estado: row.ESTADO
  };
}

router.get(
  '/rooms',
  asyncHandler(async (_req, res) => {
    const rooms = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_HABITACION_LISTAR(:cursor); END;`,
        { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cursor = result.outBinds.cursor;
      const rows = (await cursor.getRows()) || [];
      await cursor.close();
      return rows.map(mapRoom).filter(Boolean);
    });

    res.json(rooms);
  })
);

router.post(
  '/rooms',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    await withConnection((conn) => requireUserFromToken(conn, token, true));

    const data = req.body || {};
    const numero = Number(data.numero);
    const capacidad = Number(data.capacidad || 1);
    const precioBase = Number(data.precioBase || 0);
    const tipo = (data.tipo || '').trim();
    const estado = (data.estado || 'ACTIVO').trim();

    if (!numero) throw new AppError('Número de habitación requerido', 400);
    if (precioBase < 0) throw new AppError('Precio inválido', 400);
    if (!tipo) throw new AppError('Tipo requerido', 400);

    const room = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_HAB_CREAR(:numero, :capacidad, :precio, :tipo, :estado, :id); END;`,
        {
          numero,
          capacidad,
          precio: precioBase,
          tipo,
          estado,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );

      const newId = result.outBinds.id[0];
      const resGet = await conn.execute(
        `BEGIN JRGY_PRO_HAB_OBTENER(:id, :cur); END;`,
        { id: newId, cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cur = resGet.outBinds.cur;
      const rows = (await cur.getRows()) || [];
      await cur.close();
      return mapRoom(rows[0]);
    });

    res.status(201).json(room);
  })
);

router.put(
  '/rooms/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    await withConnection((conn) => requireUserFromToken(conn, token, true));

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    const data = req.body || {};
    const numero = Number(data.numero);
    const capacidad = Number(data.capacidad || 1);
    const precioBase = Number(data.precioBase || 0);
    const tipo = (data.tipo || '').trim();
    const estado = (data.estado || 'ACTIVO').trim();

    if (!numero) throw new AppError('Número de habitación requerido', 400);
    if (precioBase < 0) throw new AppError('Precio inválido', 400);
    if (!tipo) throw new AppError('Tipo requerido', 400);

    await withConnection(async (conn) => {
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_HAB_ACTUALIZAR(:id, :numero, :capacidad, :precio, :tipo, :estado); END;`,
          { id, numero, capacidad, precio: precioBase, tipo, estado },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20100) throw new AppError('Número de habitación ya existe', 409);
        if (err.errorNum === 20102) throw new AppError('Tipo o estado de habitación no encontrado', 422);
        if (err.errorNum === 20103) throw new AppError('Habitación no encontrada', 404);
        throw err;
      }

      const resGet = await conn.execute(
        `BEGIN JRGY_PRO_HAB_OBTENER(:id, :cur); END;`,
        { id, cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cur = resGet.outBinds.cur;
      const rows = (await cur.getRows()) || [];
      await cur.close();

      res.json(mapRoom(rows[0]));
    });
  })
);

router.patch(
  '/rooms/:id/status',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    await withConnection((conn) => requireUserFromToken(conn, token, true));

    const id = Number(req.params.id);
    const estado = (req.body?.estado || '').trim();
    if (!id) throw new AppError('ID inválido', 400);
    if (!estado) throw new AppError('Estado requerido', 400);

    await withConnection(async (conn) => {
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_HAB_CAMBIAR_ESTADO(:id, :estado); END;`,
          { id, estado },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20102) throw new AppError('Estado de habitación no encontrado', 422);
        if (err.errorNum === 20103) throw new AppError('Habitación no encontrada', 404);
        throw err;
      }
    });

    res.json({ ok: true });
  })
);

router.delete(
  '/rooms/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    await withConnection((conn) => requireUserFromToken(conn, token, true));

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    await withConnection(async (conn) => {
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_HAB_BORRAR(:id); END;`,
          { id },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20104) {
          throw new AppError('No se puede eliminar: habitación tiene reservas asociadas', 409);
        }
        if (err.errorNum === 20103) throw new AppError('Habitación no encontrada', 404);
        throw err;
      }
    });

    res.json({ ok: true });
  })
);

module.exports = router;
