const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { firstOutValue } = require('../utils/oracle');

const router = express.Router();

const SQL_LIST_ROOM_TYPES = `
  SELECT
    COD_TIPO_HABITACION AS ID,
    TIPO_HABITACION AS TIPO
  FROM JRGY_CAT_TIPO_HABITACION
  ORDER BY TIPO_HABITACION
`;

const SQL_FIND_ROOM_TYPE = `
  SELECT
    COD_TIPO_HABITACION AS ID,
    TIPO_HABITACION AS TIPO
  FROM JRGY_CAT_TIPO_HABITACION
  WHERE UPPER(TIPO_HABITACION) = :nombre
`;

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

function mapRoomType(row) {
  if (!row || row.ID === undefined || row.ID === null) return null;
  return {
    id: row.ID,
    nombre: row.TIPO,
    tipo: row.TIPO
  };
}

async function listRoomTypes(conn) {
  try {
    const result = await conn.execute(
      `BEGIN JRGY_PRO_TIPO_HAB_LISTAR(:cur); END;`,
      { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const cursor = result.outBinds.cur;
    const rows = (await cursor.getRows()) || [];
    await cursor.close();
    return rows.map(mapRoomType).filter(Boolean);
  } catch (err) {
    console.warn('Fallo JRGY_PRO_TIPO_HAB_LISTAR, se usa SELECT directo', err);
    const fallback = await conn.execute(SQL_LIST_ROOM_TYPES);
    const rows = fallback.rows || [];
    return rows.map(mapRoomType).filter(Boolean);
  }
}

async function findOrCreateRoomType(conn, nombre) {
  let newId;
  try {
    const result = await conn.execute(
      `BEGIN JRGY_PRO_TIPO_HAB_CREAR(:nombre, :id); END;`,
      {
        nombre,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );
    newId = firstOutValue(result.outBinds.id);
  } catch (err) {
    if (err.errorNum === 20121) throw new AppError('Nombre de tipo requerido', 400);
    if (err.errorNum === 1) throw new AppError('El tipo ya existe', 409);
    console.warn('Fallo JRGY_PRO_TIPO_HAB_CREAR, se intenta fallback directo', err);

    const existing = await conn.execute(SQL_FIND_ROOM_TYPE, { nombre });
    const existingRows = existing.rows || [];
    if (existingRows.length > 0) {
      throw new AppError('El tipo ya existe', 409);
    }

    try {
      const insertRes = await conn.execute(
        `INSERT INTO JRGY_CAT_TIPO_HABITACION (TIPO_HABITACION) VALUES (:nombre) RETURNING COD_TIPO_HABITACION INTO :id`,
        { nombre, id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } },
        { autoCommit: true }
      );
      newId = firstOutValue(insertRes.outBinds.id);
    } catch (innerErr) {
      if (innerErr.errorNum === 1) {
        const dup = await conn.execute(SQL_FIND_ROOM_TYPE, { nombre });
        const dupRows = dup.rows || [];
        if (dupRows.length > 0) {
          throw new AppError('El tipo ya existe', 409);
        }
      }
      throw innerErr;
    }
  }

  const tipos = await listRoomTypes(conn);
  return tipos.find((t) => t.id === newId || t.tipo === nombre || t.nombre === nombre) || {
    id: newId,
    nombre,
    tipo: nombre
  };
}

router.get(
  '/rooms/types',
  asyncHandler(async (_req, res) => {
    const tipos = await withConnection(async (conn) => {
      return listRoomTypes(conn);
    });

    res.json(tipos);
  })
);

router.post(
  '/rooms/types',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    await withConnection((conn) => requireUserFromToken(conn, token, true));

    const nombre = String(req.body?.nombre || req.body?.tipo || '')
      .trim()
      .toUpperCase();

    if (!nombre) throw new AppError('Tipo requerido', 400);

    const tipo = await withConnection(async (conn) => {
      return findOrCreateRoomType(conn, nombre);
    });

    res.status(201).json(tipo);
  })
);

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
    const tipo = (data.tipo || '').trim().toUpperCase();
    const estado = (data.estado || 'ACTIVO').trim().toUpperCase();

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

      const newId = firstOutValue(result.outBinds.id);
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
    const tipo = (data.tipo || '').trim().toUpperCase();
    const estado = (data.estado || 'ACTIVO').trim().toUpperCase();

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
    const estado = (req.body?.estado || '').trim().toUpperCase();
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
