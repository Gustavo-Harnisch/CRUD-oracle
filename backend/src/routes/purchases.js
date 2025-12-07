const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { hasRole } = require('../utils/authz');

const router = express.Router();

router.get(
  '/purchases',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const purchases = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_PEDIDO_LISTAR(:cur); END;`,
        { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cur = result.outBinds.cur;
      const rows = (await cur.getRows()) || [];
      await cur.close();
      return rows.map((r) => ({
        id: r.COD_PEDIDO,
        total: r.VALOR_TOTAL,
        fecha: r.FECHA_PEDIDO,
        empleadoId: r.COD_EMPLEADO
      }));
    });

    res.json(purchases);
  })
);

router.get(
  '/purchases/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    const data = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_PEDIDO_OBTENER(:id, :curPed, :curDet); END;`,
        {
          id,
          curPed: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          curDet: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      const curPed = result.outBinds.curPed;
      const curDet = result.outBinds.curDet;
      const pedRows = (await curPed.getRows()) || [];
      const detRows = (await curDet.getRows()) || [];
      await curPed.close();
      await curDet.close();

      return {
        id,
        total: pedRows[0]?.VALOR_TOTAL,
        fecha: pedRows[0]?.FECHA_PEDIDO,
        empleadoId: pedRows[0]?.COD_EMPLEADO,
        detalle: detRows.map((d) => ({
          proveedorId: d.COD_PROVEEDOR,
          productoId: d.COD_PRODUCTO,
          nombreProducto: d.NOMBRE_PRODUCTO,
          cantidad: d.CANTIDAD_PRODUCTO,
          precioCompra: d.PRECIO_COMPRA,
          precioTotal: d.PRECIO_TOTAL
        }))
      };
    });

    res.json(data);
  })
);

router.post(
  '/purchases',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    // Admin compra; empleado puede solicitar registro de compra
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const detalle = Array.isArray(req.body?.detalle) ? req.body.detalle : [];
    if (!detalle.length) throw new AppError('Detalle requerido', 400);
    const detalleJson = JSON.stringify(
      detalle.map((item) => ({
        proveedorId: Number(item.proveedorId),
        productoId: Number(item.productoId),
        nombreProducto: item.nombreProducto || null,
        cantidad: Number(item.cantidad || 0),
        precioCompra: Number(item.precioCompra || 0)
      }))
    );

    const pedido = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_PEDIDO_CREAR(:empId, :detalleJson, :pid); END;`,
        {
          empId: hasRole(user, ['ADMIN', 'EMPLOYEE']) ? user.id || null : null,
          detalleJson,
          pid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );
      const newId = result.outBinds.pid[0];
      return { id: newId };
    });

    res.status(201).json(pedido);
  })
);

module.exports = router;
