const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { hasRole } = require('../utils/authz');

const router = express.Router();

function mapProvider(row) {
  if (!row || row.COD_PROVEEDOR === undefined || row.COD_PROVEEDOR === null) return null;
  return {
    id: row.COD_PROVEEDOR,
    nombre: row.NOMBRE_PROVEEDOR,
    direccion: row.DIRECCION_PROVEEDOR,
    telefono: row.TELEFONO_PROVEEDOR,
    regionId: row.COD_REGION
  };
}

router.get(
  '/providers',
  asyncHandler(async (_req, res) => {
    const providers = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_PROVEEDOR_LISTAR(:cur); END;`,
        { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cur = result.outBinds.cur;
      const rows = (await cur.getRows()) || [];
      await cur.close();
      return rows.map(mapProvider).filter(Boolean);
    });
    res.json(providers);
  })
);

router.post(
  '/providers',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN'])) throw new AppError('No autorizado', 403);

    const { nombre = '', direccion = '', telefono = null, regionId = null } = req.body || {};
    if (!nombre.trim()) throw new AppError('Nombre requerido', 400);

    const provider = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_PROVEEDOR_CREAR(:nombre, :direccion, :telefono, :region, :id); END;`,
        {
          nombre: nombre.trim(),
          direccion: direccion || null,
          telefono: telefono ? Number(telefono) : null,
          region: regionId ? Number(regionId) : null,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );
      const newId = result.outBinds.id[0];
      const resList = await conn.execute(
        `BEGIN JRGY_PRO_PROVEEDOR_LISTAR(:cur); END;`,
        { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cur = resList.outBinds.cur;
      const rows = (await cur.getRows()) || [];
      await cur.close();
      return rows.map(mapProvider).find((p) => p.id === newId) || null;
    });

    res.status(201).json(provider);
  })
);

router.put(
  '/providers/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);
    const { nombre = '', direccion = '', telefono = null, regionId = null } = req.body || {};
    if (!nombre.trim()) throw new AppError('Nombre requerido', 400);

    await withConnection(async (conn) => {
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_PROVEEDOR_ACTUALIZAR(:id, :nombre, :direccion, :telefono, :region); END;`,
          {
            id,
            nombre: nombre.trim(),
            direccion: direccion || null,
            telefono: telefono ? Number(telefono) : null,
            region: regionId ? Number(regionId) : null
          },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20026) throw new AppError('Proveedor no encontrado', 404);
        throw err;
      }
    });

    res.json({ ok: true });
  })
);

router.delete(
  '/providers/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    await withConnection(async (conn) => {
      try {
        await conn.execute(`BEGIN JRGY_PRO_PROVEEDOR_BORRAR(:id); END;`, { id }, { autoCommit: true });
      } catch (err) {
        if (err.errorNum === 20104) throw new AppError('No se puede eliminar: tiene pedidos', 409);
        if (err.errorNum === 20026) throw new AppError('Proveedor no encontrado', 404);
        throw err;
      }
    });

    res.json({ ok: true });
  })
);

module.exports = router;
