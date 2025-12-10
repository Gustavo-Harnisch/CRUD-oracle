const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { hasRole } = require('../utils/authz');
const { firstOutValue } = require('../utils/oracle');

const router = express.Router();

const SQL_EMPLOYEE_LIST = `
  WITH EMP AS (
    SELECT e.COD_EMPLEADO,
           e.COD_USUARIO,
           u.NOMBRE_USUARIO || ' ' || NVL(u.APELLIDO1_USUARIO, '') || ' ' || NVL(u.APELLIDO2_USUARIO, '') AS NOMBRE_COMPLETO,
           u.EMAIL_USUARIO AS EMAIL,
           e.COD_DEPARTAMENTO,
           NVL(d.NOMBRE_DEPARTAMENTO, 'N/D') AS DEPARTAMENTO,
           e.CARGO,
           e.SALARIO AS SUELDO_BASE,
           e.FECHA_CONTRATACION,
           e.COD_ESTADO_LABORAL,
           el.ESTADO_LABORAL,
           CASE
             WHEN e.CARGO IS NULL OR e.SALARIO IS NULL OR e.COD_DEPARTAMENTO IS NULL OR e.COD_ESTADO_LABORAL IS NULL THEN 1
             ELSE 0
           END AS INCOMPLETO
    FROM JRGY_EMPLEADO e
    LEFT JOIN JRGY_USUARIO u ON u.COD_USUARIO = e.COD_USUARIO
    LEFT JOIN JRGY_CAT_ESTADO_LABORAL el ON el.COD_ESTADO_LABORAL = e.COD_ESTADO_LABORAL
    LEFT JOIN JRGY_DEPARTAMENTO d ON d.COD_DEPARTAMENTO = e.COD_DEPARTAMENTO
  ), EMP_ROLE AS (
    SELECT
      NULL AS COD_EMPLEADO,
      u.COD_USUARIO,
      u.NOMBRE_USUARIO || ' ' || NVL(u.APELLIDO1_USUARIO, '') || ' ' || NVL(u.APELLIDO2_USUARIO, '') AS NOMBRE_COMPLETO,
      u.EMAIL_USUARIO AS EMAIL,
      NULL AS COD_DEPARTAMENTO,
      'NONE' AS DEPARTAMENTO,
      NULL AS CARGO,
      NULL AS SUELDO_BASE,
      NULL AS FECHA_CONTRATACION,
      NULL AS COD_ESTADO_LABORAL,
      NULL AS ESTADO_LABORAL,
      1 AS INCOMPLETO
    FROM JRGY_USUARIO u
    INNER JOIN JRGY_USUARIO_ROL ur ON ur.COD_USUARIO = u.COD_USUARIO
    INNER JOIN JRGY_ROL r ON r.COD_ROL = ur.COD_ROL
    LEFT JOIN JRGY_EMPLEADO e ON e.COD_USUARIO = u.COD_USUARIO
    WHERE UPPER(r.NOMBRE_ROL) = 'EMPLOYEE'
      AND e.COD_EMPLEADO IS NULL
  )
  SELECT *
  FROM (
    SELECT * FROM EMP
    UNION ALL
    SELECT * FROM EMP_ROLE
  )
  ORDER BY COD_EMPLEADO NULLS LAST, COD_USUARIO
`;

const SQL_EMPLOYEE_LIST_NO_SALARY = `
  WITH EMP AS (
    SELECT e.COD_EMPLEADO,
           e.COD_USUARIO,
           u.NOMBRE_USUARIO || ' ' || NVL(u.APELLIDO1_USUARIO, '') || ' ' || NVL(u.APELLIDO2_USUARIO, '') AS NOMBRE_COMPLETO,
           u.EMAIL_USUARIO AS EMAIL,
           e.COD_DEPARTAMENTO,
           NVL(d.NOMBRE_DEPARTAMENTO, 'N/D') AS DEPARTAMENTO,
           e.CARGO,
           NULL AS SUELDO_BASE,
           e.FECHA_CONTRATACION,
           e.COD_ESTADO_LABORAL,
           el.ESTADO_LABORAL,
           CASE
              WHEN e.CARGO IS NULL OR e.COD_DEPARTAMENTO IS NULL OR e.COD_ESTADO_LABORAL IS NULL THEN 1
              ELSE 0
            END AS INCOMPLETO
    FROM JRGY_EMPLEADO e
    LEFT JOIN JRGY_USUARIO u ON u.COD_USUARIO = e.COD_USUARIO
    LEFT JOIN JRGY_CAT_ESTADO_LABORAL el ON el.COD_ESTADO_LABORAL = e.COD_ESTADO_LABORAL
    LEFT JOIN JRGY_DEPARTAMENTO d ON d.COD_DEPARTAMENTO = e.COD_DEPARTAMENTO
  ), EMP_ROLE AS (
    SELECT
      NULL AS COD_EMPLEADO,
      u.COD_USUARIO,
      u.NOMBRE_USUARIO || ' ' || NVL(u.APELLIDO1_USUARIO, '') || ' ' || NVL(u.APELLIDO2_USUARIO, '') AS NOMBRE_COMPLETO,
      u.EMAIL_USUARIO AS EMAIL,
      NULL AS COD_DEPARTAMENTO,
      'N/D' AS DEPARTAMENTO,
      NULL AS CARGO,
      NULL AS SUELDO_BASE,
      NULL AS FECHA_CONTRATACION,
      NULL AS COD_ESTADO_LABORAL,
      NULL AS ESTADO_LABORAL,
      1 AS INCOMPLETO
    FROM JRGY_USUARIO u
    INNER JOIN JRGY_USUARIO_ROL ur ON ur.COD_USUARIO = u.COD_USUARIO
    INNER JOIN JRGY_ROL r ON r.COD_ROL = ur.COD_ROL
    LEFT JOIN JRGY_EMPLEADO e ON e.COD_USUARIO = u.COD_USUARIO
    WHERE UPPER(r.NOMBRE_ROL) = 'EMPLOYEE'
      AND e.COD_EMPLEADO IS NULL
  )
  SELECT *
  FROM (
    SELECT * FROM EMP
    UNION ALL
    SELECT * FROM EMP_ROLE
  )
  ORDER BY COD_EMPLEADO NULLS LAST, COD_USUARIO
`;

function mapEmployee(row) {
  if (!row || row.COD_EMPLEADO === undefined) return null;
  return {
    id: row.COD_EMPLEADO,
    usuarioId: row.COD_USUARIO,
    nombre: row.NOMBRE_COMPLETO,
    email: row.EMAIL,
    departamentoId: row.COD_DEPARTAMENTO,
    departamento: row.DEPARTAMENTO || 'N/D',
    cargo: row.CARGO,
    sueldoBase: row.SUELDO_BASE,
    fechaContratacion: row.FECHA_CONTRATACION,
    estadoLaboralId: row.COD_ESTADO_LABORAL,
    estadoLaboral: row.ESTADO_LABORAL,
    incompleto: row.INCOMPLETO === 1,
    habilidades: row.HABILIDADES || []
  };
}

async function fetchHabilidades(conn, ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) return new Map();
  const placeholders = ids.map((_, i) => `:id${i}`).join(', ');
  const binds = ids.reduce((acc, id, idx) => ({ ...acc, [`id${idx}`]: id }), {});
  const res = await conn.execute(
    `SELECT COD_EMPLEADO, CATEGORIA, TIPO FROM JRGY_EMPLEADO_HABILIDAD WHERE COD_EMPLEADO IN (${placeholders})`,
    binds
  );
  const map = new Map();
  (res.rows || []).forEach((r) => {
    const empId = r.COD_EMPLEADO;
    const list = map.get(empId) || [];
    list.push({ categoria: r.CATEGORIA, tipo: r.TIPO });
    map.set(empId, list);
  });
  return map;
}

router.get(
  '/employees',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN'])) throw new AppError('No autorizado', 403);

    const employees = await withConnection(async (conn) => {
      try {
        const result = await conn.execute(
          `BEGIN JRGY_PRO_EMPLEADO_LISTAR(:cur); END;`,
          { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
        );
        const cur = result.outBinds.cur;
        const rows = (await cur.getRows()) || [];
        await cur.close();
        const list = rows.map(mapEmployee).filter(Boolean);
        const habMap = await fetchHabilidades(conn, list.map((e) => e.id).filter(Boolean));
        return list.map((e) => ({ ...e, habilidades: habMap.get(e.id) || [] }));
      } catch (err) {
        console.warn('Fallo JRGY_PRO_EMPLEADO_LISTAR, usando SELECT directo', err);
        try {
          const fallback = await conn.execute(SQL_EMPLOYEE_LIST);
          const list = (fallback.rows || []).map(mapEmployee).filter(Boolean);
          const habMap = await fetchHabilidades(conn, list.map((e) => e.id).filter(Boolean));
          return list.map((e) => ({ ...e, habilidades: habMap.get(e.id) || [] }));
        } catch (fallbackErr) {
          console.warn('Fallo SELECT con SUELDO_BASE, usando variante sin sueldo', fallbackErr);
          const fallback2 = await conn.execute(SQL_EMPLOYEE_LIST_NO_SALARY);
          const list = (fallback2.rows || []).map(mapEmployee).filter(Boolean);
          const habMap = await fetchHabilidades(conn, list.map((e) => e.id).filter(Boolean));
          return list.map((e) => ({ ...e, habilidades: habMap.get(e.id) || [] }));
        }
      }
    });

    res.json(employees);
  })
);

// Resumen para dashboard de empleado (estadísticas rápidas)
router.get(
  '/employee/dashboard-stats',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const stats = await withConnection(async (conn) => {
      const result = await conn.execute(
        `
          SELECT
            (SELECT COUNT(*) FROM JRGY_RESERVA r WHERE TRUNC(r.FECHA_INICIO) = TRUNC(SYSDATE)) AS CHECKINS_HOY,
            (SELECT COUNT(*) FROM JRGY_RESERVA r WHERE TRUNC(r.FECHA_FIN) = TRUNC(SYSDATE)) AS CHECKOUTS_HOY,
            (
              SELECT COUNT(*)
              FROM JRGY_RESERVA_SERVICIO rs
              WHERE LOWER(NVL(rs.ESTADO, 'pendiente')) NOT IN ('cancelado', 'cancelada', 'finalizado', 'finalizada', 'listo')
            ) AS PETICIONES_ABIERTAS,
            (
              SELECT COUNT(*)
              FROM JRGY_HABITACION h
              LEFT JOIN JRGY_CAT_ESTADO_HABITACION eh ON eh.COD_ESTADO_HABITACION = h.COD_ESTADO_HABITACION
              WHERE UPPER(NVL(eh.ESTADO_HABITACION, '')) IN ('MANTENCION', 'MANTENCIÓN', 'FUERA DE SERVICIO', 'FUERA_SERVICIO', 'OUT OF SERVICE')
            ) AS ROOMS_OOS
          FROM dual
        `
      );
      return (result.rows || [])[0] || {};
    });

    res.json({
      checkinsToday: Number(stats.CHECKINS_HOY) || 0,
      checkoutsToday: Number(stats.CHECKOUTS_HOY) || 0,
      openRequests: Number(stats.PETICIONES_ABIERTAS) || 0,
      roomsOOS: Number(stats.ROOMS_OOS) || 0
    });
  })
);

// Equipo (mismo departamento que el empleado autenticado)
router.get(
  '/employees/team',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const employees = await withConnection(async (conn) => {
      const depRes = await conn.execute(
        `SELECT COD_DEPARTAMENTO FROM JRGY_EMPLEADO WHERE COD_USUARIO = :id`,
        { id: user.id }
      );
      const depId = (depRes.rows || [])[0]?.COD_DEPARTAMENTO;
      if (!depId) return [];

      const result = await conn.execute(
        `
          SELECT e.COD_EMPLEADO,
                 e.COD_USUARIO,
                 u.NOMBRE_USUARIO || ' ' || NVL(u.APELLIDO1_USUARIO, '') || ' ' || NVL(u.APELLIDO2_USUARIO, '') AS NOMBRE_COMPLETO,
                 u.EMAIL_USUARIO AS EMAIL,
                 e.COD_DEPARTAMENTO,
                 NVL(d.NOMBRE_DEPARTAMENTO, 'N/D') AS DEPARTAMENTO,
                 e.CARGO,
                 el.ESTADO_LABORAL
          FROM JRGY_EMPLEADO e
          JOIN JRGY_USUARIO u ON u.COD_USUARIO = e.COD_USUARIO
          LEFT JOIN JRGY_CAT_ESTADO_LABORAL el ON el.COD_ESTADO_LABORAL = e.COD_ESTADO_LABORAL
          LEFT JOIN JRGY_DEPARTAMENTO d ON d.COD_DEPARTAMENTO = e.COD_DEPARTAMENTO
          WHERE e.COD_DEPARTAMENTO = :depId
        `,
        { depId }
      );
      return (result.rows || []).map((r) => ({
        id: r.COD_EMPLEADO,
        usuarioId: r.COD_USUARIO,
        nombre: r.NOMBRE_COMPLETO,
        email: r.EMAIL,
        departamentoId: r.COD_DEPARTAMENTO,
        departamento: r.DEPARTAMENTO,
        cargo: r.CARGO,
        estadoLaboral: r.ESTADO_LABORAL
      }));
    });

    res.json(employees);
  })
);

// Directorio completo (solo empleados) para búsqueda
router.get(
  '/employees/directory',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const employees = await withConnection(async (conn) => {
      const result = await conn.execute(
        `
          SELECT e.COD_EMPLEADO,
                 e.COD_USUARIO,
                 u.NOMBRE_USUARIO || ' ' || NVL(u.APELLIDO1_USUARIO, '') || ' ' || NVL(u.APELLIDO2_USUARIO, '') AS NOMBRE_COMPLETO,
                 u.EMAIL_USUARIO AS EMAIL,
                 e.COD_DEPARTAMENTO,
                 NVL(d.NOMBRE_DEPARTAMENTO, 'N/D') AS DEPARTAMENTO,
                 e.CARGO,
                 el.ESTADO_LABORAL
          FROM JRGY_EMPLEADO e
          JOIN JRGY_USUARIO u ON u.COD_USUARIO = e.COD_USUARIO
          LEFT JOIN JRGY_CAT_ESTADO_LABORAL el ON el.COD_ESTADO_LABORAL = e.COD_ESTADO_LABORAL
          LEFT JOIN JRGY_DEPARTAMENTO d ON d.COD_DEPARTAMENTO = e.COD_DEPARTAMENTO
        `
      );
      return (result.rows || []).map((r) => ({
        id: r.COD_EMPLEADO,
        usuarioId: r.COD_USUARIO,
        nombre: r.NOMBRE_COMPLETO,
        email: r.EMAIL,
        departamentoId: r.COD_DEPARTAMENTO,
        departamento: r.DEPARTAMENTO,
        cargo: r.CARGO,
        estadoLaboral: r.ESTADO_LABORAL
      }));
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
      let newId = null;
      try {
        const resCreate = await conn.execute(
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
        newId = firstOutValue(resCreate.outBinds.id) || null;
      } catch (err) {
        if (err.errorNum === 20052) throw new AppError('Estado laboral no encontrado', 422);
        throw err;
      }

      const habilidades = Array.isArray(data.habilidades) ? data.habilidades : [];
      if (habilidades.length && newId) {
        const json = JSON.stringify(habilidades);
        await conn.execute(`BEGIN JRGY_PRO_EMP_HAB_REEMPLAZAR(:id, :json); END;`, { id: newId, json }, { autoCommit: true });
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

      const habilidades = Array.isArray(data.habilidades) ? data.habilidades : [];
      const json = JSON.stringify(habilidades);
      await conn.execute(`BEGIN JRGY_PRO_EMP_HAB_REEMPLAZAR(:id, :json); END;`, { id, json }, { autoCommit: true });
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
