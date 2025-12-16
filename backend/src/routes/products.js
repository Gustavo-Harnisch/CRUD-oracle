const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { hasRole } = require('../utils/authz');
const { firstOutValue } = require('../utils/oracle');

const router = express.Router();

const SQL_ALLOWED_TYPES = `
  SELECT DISTINCT NVL(TRIM(UPPER(h.CATEGORIA)), NVL(TRIM(UPPER(h.TIPO)), NULL)) AS TIPO
  FROM JRGY_EMPLEADO_HABILIDAD h
  JOIN JRGY_EMPLEADO e ON e.COD_EMPLEADO = h.COD_EMPLEADO
  WHERE e.COD_USUARIO = :uid
`;

async function fetchAllowedTypes(conn, user) {
  if (!user || hasRole(user, ['ADMIN'])) return null;
  const res = await conn.execute(SQL_ALLOWED_TYPES, { uid: user.id });
  const rows = res.rows || [];
  const tipos = rows
    .map((r) => (r.TIPO !== undefined ? r.TIPO : r[0]))
    .filter(Boolean)
    .map((t) => String(t).trim().toUpperCase());
  return Array.from(new Set(tipos));
}

function mapProduct(row) {
  if (!row || row.COD_PRODUCTO === undefined || row.COD_PRODUCTO === null) return null;
  return {
    id: row.COD_PRODUCTO,
    nombre: row.NOMBRE_PRODUCTO,
    // Preferimos el nombre de tipo de servicio; si no viene, devolvemos el id.
    tipo: row.TIPO_SERVICIO || row.TIPO_PRODUCTO || row.COD_TIPO_SERVICIO,
    precio: row.PRECIO_PRODUCTO,
    cantidad: row.CANTIDAD_PRODUCTO,
    stock: row.STOCK_PRODUCTO,
    umbralAlerta: row.UMBRAL_ALERTA,
    alertaActiva: row.ALERTA_ACTIVA === 1
  };
}

// Normaliza el tipo recibido (id o nombre) a un id válido de JRGY_CAT_TIPO_SERVICIO.
async function resolveTipoId(conn, raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  const maybeNumber = Number(raw);
  // Si viene numérico (o string numérico), úsalo directo.
  if (!Number.isNaN(maybeNumber)) return maybeNumber;

  // Caso nombre: buscar por nombre en mayúsculas.
  const name = String(raw || '').trim().toUpperCase();
  if (!name) return null;
  const res = await conn.execute(
    `SELECT COD_TIPO_SERVICIO FROM JRGY_CAT_TIPO_SERVICIO WHERE UPPER(NOMBRE)=:n`,
    { n: name }
  );
  const found = (res.rows || [])[0]?.COD_TIPO_SERVICIO;
  if (!found) throw new AppError('Categoría de producto/servicio no existe', 422);
  return found;
}

router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    let user = null;
    if (token) {
      try {
        user = await withConnection((conn) => requireUserFromToken(conn, token, false));
      } catch (err) {
        user = null;
      }
    }

    const products = await withConnection(async (conn) => {
      const allowedTypes = await fetchAllowedTypes(conn, user);
      const result = await conn.execute(
        `BEGIN JRGY_PRO_PRODUCTO_LISTAR(:cur); END;`,
        { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cur = result.outBinds.cur;
      const rows = (await cur.getRows()) || [];
      await cur.close();
      const all = rows.map(mapProduct).filter(Boolean);
      if (!allowedTypes) return all;
      return all.filter((p) => allowedTypes.includes(String(p.tipo || '').trim().toUpperCase()));
    });

    res.json(products);
  })
);

router.post(
  '/products',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const data = req.body || {};
    const nombre = (data.nombre || '').trim();
    const tipo = (data.tipo || '').trim();
    const precio = Number(data.precio || 0);
    const cantidad = Number(data.cantidad || 0);
    const stock = Number(data.stock || 0);
    const umbral = data.umbralAlerta === '' || data.umbralAlerta === null ? null : Number(data.umbralAlerta);

    if (!nombre) throw new AppError('Nombre requerido', 400);
    if (precio < 0 || cantidad < 0 || stock < 0 || (umbral !== null && umbral < 0)) throw new AppError('Valores inválidos', 400);

    const product = await withConnection(async (conn) => {
      const tipoId = await resolveTipoId(conn, tipo);
      const result = await conn.execute(
        `BEGIN JRGY_PRO_PRODUCTO_CREAR(:nombre, :tipo, :precio, :cantidad, :stock, :umbral, :id); END;`,
        {
          nombre,
          tipo: tipoId,
          precio,
          cantidad,
          stock,
          umbral,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );

      const newId = firstOutValue(result.outBinds.id);
      const resList = await conn.execute(
        `BEGIN JRGY_PRO_PRODUCTO_LISTAR(:cur); END;`,
        { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cur = resList.outBinds.cur;
      const rows = (await cur.getRows()) || [];
      await cur.close();
      return rows.map(mapProduct).find((p) => p.id === newId) || null;
    });

    res.status(201).json(product);
  })
);

router.put(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    const data = req.body || {};
    const nombre = (data.nombre || '').trim();
    const tipo = (data.tipo || '').trim();
    const precio = Number(data.precio || 0);
    const cantidad = Number(data.cantidad || 0);
    const stock = Number(data.stock || 0);
    const umbral = data.umbralAlerta === '' || data.umbralAlerta === null ? null : Number(data.umbralAlerta);

    if (!nombre) throw new AppError('Nombre requerido', 400);
    if (precio < 0 || cantidad < 0 || stock < 0 || (umbral !== null && umbral < 0)) throw new AppError('Valores inválidos', 400);

    await withConnection(async (conn) => {
      try {
        const tipoId = await resolveTipoId(conn, tipo);
        await conn.execute(
          `BEGIN JRGY_PRO_PRODUCTO_ACTUALIZAR(:id, :nombre, :tipo, :precio, :cantidad, :stock, :umbral); END;`,
          { id, nombre, tipo: tipoId, precio, cantidad, stock, umbral },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20082) throw new AppError('Producto no encontrado', 404);
        throw err;
      }
      const resList = await conn.execute(
        `BEGIN JRGY_PRO_PRODUCTO_LISTAR(:cur); END;`,
        { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cur = resList.outBinds.cur;
      const rows = (await cur.getRows()) || [];
      await cur.close();
      const prod = rows.map(mapProduct).find((p) => p.id === id) || null;
      res.json(prod);
    });
  })
);

router.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    await withConnection(async (conn) => {
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_PRODUCTO_BORRAR(:id); END;`,
          { id },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20104) throw new AppError('No se puede eliminar: tiene pedidos/ventas', 409);
        if (err.errorNum === 20082) throw new AppError('Producto no encontrado', 404);
        throw err;
      }
    });

    res.json({ ok: true });
  })
);

// Asociación servicio-producto
router.get(
  '/services/:id/products',
  asyncHandler(async (req, res) => {
    const servicioId = Number(req.params.id);
    if (!servicioId) throw new AppError('Servicio inválido', 400);

    const items = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_SERVICIO_PRODUCTO_LISTAR(:sid, :cur); END;`,
        { sid: servicioId, cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cur = result.outBinds.cur;
      const rows = (await cur.getRows()) || [];
      await cur.close();
      return rows.map((r) => ({
        servicioId: r.COD_SERVICIO,
        productoId: r.COD_PRODUCTO,
        nombreProducto: r.NOMBRE_PRODUCTO,
        cantidadBase: r.CANTIDAD_BASE,
        precioExtra: r.PRECIO_EXTRA,
        stock: r.STOCK_PRODUCTO,
        umbralAlerta: r.UMBRAL_ALERTA,
        alertaActiva: r.ALERTA_ACTIVA === 1
      }));
    });

    res.json(items);
  })
);

router.put(
  '/services/:id/products',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN'])) throw new AppError('No autorizado', 403);

    const servicioId = Number(req.params.id);
    if (!servicioId) throw new AppError('Servicio inválido', 400);
    const items = Array.isArray(req.body) ? req.body : [];
    const itemsJson = JSON.stringify(
      items.map((it) => ({
        productoId: Number(it.productoId),
        cantidad: Number(it.cantidadBase || it.cantidad || 1),
        precioExtra: it.precioExtra !== undefined ? Number(it.precioExtra) : null
      }))
    );

    await withConnection(async (conn) => {
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_SERVICIO_PRODUCTO_REEMPLAZAR(:sid, :itemsJson); END;`,
          { sid: servicioId, itemsJson },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20082) throw new AppError('Servicio no encontrado', 404);
        throw err;
      }
    });

    res.json({ ok: true });
  })
);

module.exports = router;
