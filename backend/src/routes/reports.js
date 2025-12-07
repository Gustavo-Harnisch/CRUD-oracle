const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { hasRole } = require('../utils/authz');

const router = express.Router();

const parseDate = (val) => {
  if (!val) return null;
  const dt = new Date(val);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const ensureAuthorized = async (req) => {
  const token = extractToken(req);
  const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
  if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) {
    throw new AppError('No autorizado', 403);
  }
};

const mapCursorRows = async (cursor) => {
  const rows = (await cursor.getRows()) || [];
  await cursor.close();
  return rows.map((row) => {
    const mapped = {};
    Object.entries(row || {}).forEach(([key, value]) => {
      const camel = key
        .toLowerCase()
        .split('_')
        .map((part, idx) => (idx === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
        .join('');
      mapped[camel] = value;
    });
    return mapped;
  });
};

router.get(
  '/reports/ingresos',
  asyncHandler(async (req, res) => {
    await ensureAuthorized(req);
    const desde = parseDate(req.query.desde);
    const hasta = parseDate(req.query.hasta);

    const data = await withConnection(async (conn) => {
      const ingresosReservasRes = await conn.execute(
        `BEGIN JRGY_PRO_REPORTE_INGRESOS_RESERVAS(:desde, :hasta, :cur); END;`,
        {
          desde,
          hasta,
          cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );
      const ingresosVentasRes = await conn.execute(
        `BEGIN JRGY_PRO_REPORTE_INGRESOS_VENTAS(:desde, :hasta, :cur); END;`,
        {
          desde,
          hasta,
          cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      const reservas = await mapCursorRows(ingresosReservasRes.outBinds.cur);
      const ventas = await mapCursorRows(ingresosVentasRes.outBinds.cur);
      return { reservas, ventas };
    });

    res.json(data);
  })
);

router.get(
  '/reports/egresos',
  asyncHandler(async (req, res) => {
    await ensureAuthorized(req);
    const desde = parseDate(req.query.desde);
    const hasta = parseDate(req.query.hasta);

    const egresos = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_REPORTE_EGRESOS_COMPRAS(:desde, :hasta, :cur); END;`,
        {
          desde,
          hasta,
          cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );
      return mapCursorRows(result.outBinds.cur);
    });

    res.json({ compras: egresos });
  })
);

router.get(
  '/reports/balance',
  asyncHandler(async (req, res) => {
    await ensureAuthorized(req);
    const desde = parseDate(req.query.desde);
    const hasta = parseDate(req.query.hasta);

    const balance = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_REPORTE_BALANCE(:desde, :hasta, :cur); END;`,
        {
          desde,
          hasta,
          cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );
      const rows = await mapCursorRows(result.outBinds.cur);
      return rows[0] || {};
    });

    res.json(balance);
  })
);

module.exports = router;
