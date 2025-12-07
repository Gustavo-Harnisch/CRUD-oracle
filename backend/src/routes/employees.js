const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { hasRole } = require('../utils/authz');

const router = express.Router();

function mapEmployee(row) {
  if (!row || row.COD_EMPLEADO === undefined) return null;
  return {
    id: row.COD_EMPLEADO,
    usuarioId: row.COD_USUARIO,
    nombre: row.NOMBRE_COMPLETO,
    email: row.EMAIL,
    departamentoId: row.COD_DEPARTAMENTO,
    departamento: row.DEPARTAMENTO || 'NONE',
    cargo: row.CARGO,
    sueldoBase: row.SUELDO_BASE,
    fechaContratacion: row.FECHA_CONTRATACION,
    estadoLaboralId: row.COD_ESTADO_LABORAL
  };
}

router.get(
  '/employees',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN'])) throw new AppError('No autorizado', 403);

    const employees = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_EMPLEADO_LISTAR(:cur); END;`,
        { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cur = result.outBinds.cur;
      const rows = (await cur.getRows()) || [];
      await cur.close();
      return rows.map(mapEmployee).filter(Boolean);
    });

    res.json(employees);
  })
);

router.post(
  '/employees',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN'])) throw new AppError('No autorizado', 403);

    const data = req.body || {};
    const usuarioId = Number(data.usuarioId);
    const cargo = (data.cargo || '').trim();
    const sueldoBase = data.sueldoBase === null || data.sueldoBase === undefined ? null : Number(data.sueldoBase);
    const fechaContrato = data.fechaContratacion ? new Date(data.fechaContratacion) : new Date();
    const depId = data.departamentoId ? Number(data.departamentoId) : null;
    const estado = (data.estadoLaboral || 'ACTIVO').toUpperCase();

    if (!usuarioId) throw new AppError('usuarioId requerido', 400);
    if (!cargo) throw new AppError('Cargo requerido', 400);

    await withConnection(async (conn) => {
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_EMPLEADO_CREAR(:uid, :cargo, :sueldo, :fecha, :depId, :estado, :id); END;`,
          {
            uid: usuarioId,
            cargo,
            sueldo: sueldoBase,
            fecha: fechaContrato,
            depId,
            estado,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20052) throw new AppError('Estado laboral no encontrado', 422);
        throw err;
      }
    });

    res.status(201).json({ ok: true });
  })
);

router.put(
  '/employees/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    const data = req.body || {};
    const cargo = (data.cargo || '').trim();
    const sueldoBase = data.sueldoBase === null || data.sueldoBase === undefined ? null : Number(data.sueldoBase);
    const fechaContrato = data.fechaContratacion ? new Date(data.fechaContratacion) : new Date();
    const depId = data.departamentoId ? Number(data.departamentoId) : null;
    const estado = (data.estadoLaboral || 'ACTIVO').toUpperCase();

    if (!cargo) throw new AppError('Cargo requerido', 400);

    await withConnection(async (conn) => {
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_EMPLEADO_ACTUALIZAR(:id, :cargo, :sueldo, :fecha, :depId, :estado); END;`,
          {
            id,
            cargo,
            sueldo: sueldoBase,
            fecha: fechaContrato,
            depId,
            estado
          },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20103) throw new AppError('Empleado no encontrado', 404);
        if (err.errorNum === 20052) throw new AppError('Estado laboral no encontrado', 422);
        throw err;
      }
    });

    res.json({ ok: true });
  })
);

router.delete(
  '/employees/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    await withConnection(async (conn) => {
      try {
        await conn.execute(`BEGIN JRGY_PRO_EMPLEADO_BORRAR(:id); END;`, { id }, { autoCommit: true });
      } catch (err) {
        if (err.errorNum === 20103) throw new AppError('Empleado no encontrado', 404);
        throw err;
      }
    });

    res.json({ ok: true });
  })
);

module.exports = router;
