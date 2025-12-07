const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { hasRole } = require('../utils/authz');
const { firstOutValue } = require('../utils/oracle');

const router = express.Router();

function mapDepartment(row) {
  if (!row || row.COD_DEPARTAMENTO === undefined) return null;
  return {
    id: row.COD_DEPARTAMENTO,
    nombre: row.NOMBRE,
    jefeEmpleadoId: row.JEFE_EMPLEADO_ID,
    jefeRut: row.JEFE_RUT,
    presupuesto: row.PRESUPUESTO,
    empleadosAsignados: row.EMPLEADOS_ASIGNADOS,
    sueldoTotal: row.SUELDO_TOTAL
  };
}

async function findEmpleadoId(conn, usuarioId) {
  if (!usuarioId) return null;
  const res = await conn.execute(
    `SELECT COD_EMPLEADO FROM JRGY_EMPLEADO WHERE COD_USUARIO = :uid`,
    { uid: usuarioId }
  );
  return (res.rows || [])[0]?.COD_EMPLEADO || null;
}

async function attachSueldoTotals(conn, deps) {
  if (!Array.isArray(deps) || deps.length === 0) return [];
  const result = await conn.execute(
    `
      SELECT COD_DEPARTAMENTO, NVL(SUM(SALARIO), 0) AS SUELDO_TOTAL
      FROM JRGY_EMPLEADO
    GROUP BY COD_DEPARTAMENTO
    `
  );
  const totals = new Map();
  (result.rows || []).forEach((r) => totals.set(r.COD_DEPARTAMENTO, r.SUELDO_TOTAL));
  return deps.map((d) => ({ ...d, sueldoTotal: d.sueldoTotal ?? totals.get(d.id) ?? null }));
}

router.get(
  '/departments',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = token ? await withConnection((conn) => requireUserFromToken(conn, token, false).catch(() => null)) : null;
    const isAllowed = user && hasRole(user, ['ADMIN', 'EMPLOYEE']);
    if (!isAllowed) throw new AppError('No autorizado', 403);

    const departments = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_DEP_LISTAR(:cur); END;`,
        { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cur = result.outBinds.cur;
      const rows = (await cur.getRows()) || [];
      await cur.close();
      const deps = rows.map(mapDepartment).filter(Boolean);
      return attachSueldoTotals(conn, deps);
    });
    res.json(departments);
  })
);

router.get(
  '/departments/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    const dep = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_DEP_OBTENER(:id, :cur); END;`,
        { id, cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cur = result.outBinds.cur;
      const rows = (await cur.getRows()) || [];
      await cur.close();
      const mapped = rows[0] ? mapDepartment({ ...rows[0], EMPLEADOS_ASIGNADOS: null, JEFE_RUT: null }) : null;
      if (!mapped) return null;
      const withTotals = await attachSueldoTotals(conn, [mapped]);
      return withTotals[0] || mapped;
    });
    if (!dep) throw new AppError('Departamento no encontrado', 404);
    res.json(dep);
  })
);

router.post(
  '/departments',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN'])) throw new AppError('No autorizado', 403);

    const { nombre = '', jefeEmpleadoId = null, jefeUsuarioId = null } = req.body || {};
    if (!nombre.trim()) throw new AppError('Nombre requerido', 400);

    const dep = await withConnection(async (conn) => {
      const jefeId = jefeUsuarioId ? await findEmpleadoId(conn, jefeUsuarioId) : jefeEmpleadoId;
      const result = await conn.execute(
        `BEGIN JRGY_PRO_DEP_CREAR(:nombre, :jefe, :presupuesto, :id); END;`,
        {
          nombre: nombre.trim(),
          jefe: jefeId ? Number(jefeId) : null,
          presupuesto: null,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );
      const newId = firstOutValue(result.outBinds.id);
      const resList = await conn.execute(
        `BEGIN JRGY_PRO_DEP_LISTAR(:cur); END;`,
        { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cur = resList.outBinds.cur;
      const rows = (await cur.getRows()) || [];
      await cur.close();
      const deps = rows.map(mapDepartment).filter(Boolean);
      const withTotals = await attachSueldoTotals(conn, deps);
      return withTotals.find((d) => d.id === newId) || null;
    }).catch((err) => {
      if (err.errorNum === 2291) throw new AppError('Jefe/responsable no existe', 422);
      throw err;
    });

    res.status(201).json(dep);
  })
);

router.put(
  '/departments/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);
    const { nombre = '', jefeEmpleadoId = null, jefeUsuarioId = null } = req.body || {};
    if (!nombre.trim()) throw new AppError('Nombre requerido', 400);

    await withConnection(async (conn) => {
      try {
        const jefeId = jefeUsuarioId ? await findEmpleadoId(conn, jefeUsuarioId) : jefeEmpleadoId;
        await conn.execute(
          `BEGIN JRGY_PRO_DEP_ACTUALIZAR(:id, :nombre, :jefe, :presupuesto); END;`,
          {
            id,
            nombre: nombre.trim(),
            jefe: jefeId ? Number(jefeId) : null,
            presupuesto: null
          },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20103) throw new AppError('Departamento no encontrado', 404);
        if (err.errorNum === 2291) throw new AppError('Jefe/responsable no existe', 422);
        throw err;
      }
    });

    res.json({ ok: true });
  })
);

router.delete(
  '/departments/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    await withConnection(async (conn) => {
      try {
        await conn.execute(`BEGIN JRGY_PRO_DEP_BORRAR(:id); END;`, { id }, { autoCommit: true });
      } catch (err) {
        if (err.errorNum === 20103) throw new AppError('Departamento no encontrado', 404);
        throw err;
      }
    });

    res.json({ ok: true });
  })
);

router.put(
  '/departments/:id/employees',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);
    const empIds = Array.isArray(req.body) ? req.body : [];
    const json = JSON.stringify(empIds.map((e) => Number(e)));

    await withConnection(async (conn) => {
      await conn.execute(
        `BEGIN JRGY_PRO_DEP_ASIGNAR_EMPLEADOS(:depId, :empJson); END;`,
        { depId: id, empJson: json },
        { autoCommit: true }
      );
    });

    res.json({ ok: true });
  })
);

module.exports = router;
