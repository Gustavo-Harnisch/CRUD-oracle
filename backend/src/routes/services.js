const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { hasRole } = require('../utils/authz');
const { firstOutValue } = require('../utils/oracle');

const router = express.Router();

function mapService(row, horarioRows = []) {
  if (!row || row.COD_SERVICIO === undefined || row.COD_SERVICIO === null) return null;
  const horarios = horarioRows
    .filter((h) => h.COD_SERVICIO === row.COD_SERVICIO)
    .map((h) => ({
      id: h.COD_HORARIO,
      inicio: h.HORA_INICIO,
      fin: h.HORA_FIN
    }));

  return {
    id: row.COD_SERVICIO,
    nombre: row.NOMBRE,
    descripcion: row.DESCRIPCION,
    precio: row.PRECIO,
    tipo: row.TIPO,
    estado: row.ESTADO,
    destacado: row.ES_DESTACADO === 'Y',
    orden: row.ORDEN,
    createdAt: row.CREATED_AT,
    updatedAt: row.UPDATED_AT,
    horarios
  };
}

function parseHorarios(horarios = []) {
  const toWholeHour = (val) => {
    if (val === null || val === undefined || val === '') return NaN;
    if (typeof val === 'number') {
      if (!Number.isFinite(val) || !Number.isInteger(val)) {
        throw new AppError('Horarios deben estar en horas completas (sin minutos).', 400);
      }
      return val;
    }
    const str = String(val).trim();
    if (!str) return NaN;
    if (str.includes(':')) {
      const [hh, mm = '0'] = str.split(':');
      const hour = Number(hh);
      const minutes = Number(mm);
      if (Number.isNaN(hour) || Number.isNaN(minutes)) throw new AppError('Horario inválido', 400);
      if (minutes !== 0) throw new AppError('Usa horas completas: los minutos deben ser 00.', 400);
      return hour;
    }
    const num = Number(str);
    if (!Number.isFinite(num)) return NaN;
    if (!Number.isInteger(num)) throw new AppError('Horarios deben ser números enteros.', 400);
    return num;
  };

  const parsed = (Array.isArray(horarios) ? horarios : []).map((h) => {
    const inicio = toWholeHour(h?.inicio ?? h?.horaInicio);
    const fin = toWholeHour(h?.fin ?? h?.horaFin);
    if (Number.isNaN(inicio) || Number.isNaN(fin)) {
      throw new AppError('Horarios incompletos o inválidos.', 400);
    }
    return { inicio, fin };
  });

  parsed.forEach(({ inicio, fin }) => {
    if (inicio < 0 || inicio > 23 || fin < 0 || fin > 23 || fin < inicio) {
      throw new AppError('Horarios inválidos: usa 0-23 y asegúrate de que fin sea >= inicio.', 400);
    }
  });

  return parsed;
}

router.get(
  '/services/categories',
  asyncHandler(async (_req, res) => {
    const loadFromProcedure = async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_CAT_SERVPROD_LISTAR(:cur); END;`,
        { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cur = result.outBinds.cur;
      const rows = (await cur.getRows()) || [];
      await cur.close();
      return (rows || []).map((r) => r.TIPO).filter(Boolean);
    };

    const loadFallback = async (conn) => {
      const result = await conn.execute(
        `
          SELECT TIPO FROM (
            SELECT DISTINCT NVL(TRIM(UPPER(TIPO)), 'SIN_TIPO') AS TIPO FROM JRGY_SERVICIO
            UNION
            SELECT DISTINCT NVL(TRIM(UPPER(TIPO_PRODUCTO)), 'SIN_TIPO') AS TIPO FROM JRGY_PRODUCTO
          )
          ORDER BY TIPO
        `
      );
      const rows = result.rows || [];
      // Depending on driver config rows can be arrays or objects
      return rows.map((r) => r.TIPO ?? r[0]).filter(Boolean);
    };

    const categories = await withConnection(async (conn) => {
      try {
        return await loadFromProcedure(conn);
      } catch (err) {
        // Si el procedimiento no existe o falla, usamos el SQL directo como respaldo.
        const code = err?.errorNum || err?.code;
        const message = (err?.message || '').toUpperCase();
        const missingProc =
          code === 6550 ||
          message.includes('PLS-00201') ||
          message.includes('JRGY_PRO_CAT_SERVPROD_LISTAR') ||
          message.includes('ORA-06550');
        if (!missingProc) {
          console.error('Fallo el proc de categorías, usando fallback SQL', err);
        }
        return await loadFallback(conn);
      }
    });

    res.json(categories);
  })
);

router.get(
  '/services',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    let user = null;
    if (token) {
      try {
        user = await withConnection((conn) => requireUserFromToken(conn, token, false));
      } catch (err) {
        // token inválido: seguimos como público
        user = null;
      }
    }

    const includeInactive = req.query.includeInactive === '1' || req.query.includeInactive === 'true';
    const showInactive = user && hasRole(user, ['ADMIN']) && includeInactive;

    const services = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_SERVICIO_LISTAR(:includeInactive, :cursor); END;`,
        {
          includeInactive: showInactive ? 1 : 0,
          cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );

      const cursor = result.outBinds.cursor;
      const rows = (await cursor.getRows()) || [];
      await cursor.close();
      const validRows = rows.filter(
        (r) => r && r.COD_SERVICIO !== undefined && r.COD_SERVICIO !== null && r.NOMBRE !== undefined
      );
      if (!validRows.length) return [];

      const horRes = await conn.execute(
        `BEGIN JRGY_PRO_SERVICIO_HORARIOS_LISTAR(:cursor); END;`,
        { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cursorHor = horRes.outBinds.cursor;
      const horarioRows = (await cursorHor.getRows()) || [];
      await cursorHor.close();

      return validRows.map((r) => mapService(r, horarioRows)).filter(Boolean);
    });

    res.json(services);
  })
);

router.post(
  '/services',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const data = req.body || {};
    const nombre = (data.nombre || '').trim();
    const descripcion = (data.descripcion || '').trim() || null;
    const precio = Number(data.precio || 0);
    const tipo = (data.tipo || '').trim() || null;
    const estado = (data.estado || 'activo').toLowerCase();
    const destacado = data.destacado ? 'Y' : 'N';
    const orden = Number.isFinite(Number(data.orden)) ? Number(data.orden) : null;
    const horarios = parseHorarios(data.horarios);

    if (!nombre) throw new AppError('Nombre requerido', 400);
    if (precio < 0) throw new AppError('Precio inválido', 400);
    if (!['activo', 'inactivo'].includes(estado)) throw new AppError('Estado inválido', 400);

    await withConnection(async (conn) => {
      const horariosJson = JSON.stringify(horarios);
      let result;
      try {
        result = await conn.execute(
          `BEGIN JRGY_PRO_SERVICIO_CREAR(:nombre, :descripcion, :precio, :tipo, :estado, :destacado, :orden, :horariosJson, :id); END;`,
          {
            nombre,
            descripcion,
            precio,
            tipo,
            estado,
            destacado,
            orden,
            horariosJson,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20081) throw new AppError(err.message, 400);
        throw err;
      }

      const newId = firstOutValue(result.outBinds.id);
      const resGet = await conn.execute(
        `BEGIN JRGY_PRO_SERVICIO_OBTENER(:id, :curServ, :curHor); END;`,
        {
          id: newId,
          curServ: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          curHor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );
      const curServ = resGet.outBinds.curServ;
      const curHor = resGet.outBinds.curHor;
      const servRows = (await curServ.getRows()) || [];
      const horRows = (await curHor.getRows()) || [];
      await curServ.close();
      await curHor.close();

      res.status(201).json(mapService(servRows[0], horRows));
    });
  })
);

router.put(
  '/services/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    const data = req.body || {};
    const nombre = (data.nombre || '').trim();
    const descripcion = (data.descripcion || '').trim() || null;
    const precio = Number(data.precio || 0);
    const tipo = (data.tipo || '').trim() || null;
    const estado = (data.estado || 'activo').toLowerCase();
    const destacado = data.destacado ? 'Y' : 'N';
    const orden = Number.isFinite(Number(data.orden)) ? Number(data.orden) : null;
    const horarios = parseHorarios(data.horarios);

    if (!nombre) throw new AppError('Nombre requerido', 400);
    if (precio < 0) throw new AppError('Precio inválido', 400);
    if (!['activo', 'inactivo'].includes(estado)) throw new AppError('Estado inválido', 400);

    await withConnection(async (conn) => {
      const horariosJson = JSON.stringify(horarios);
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_SERVICIO_ACTUALIZAR(:id, :nombre, :descripcion, :precio, :tipo, :estado, :destacado, :orden, :horariosJson); END;`,
          { id, nombre, descripcion, precio, tipo, estado, destacado, orden, horariosJson },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20081) throw new AppError(err.message, 400);
        if (err.errorNum === 20082) throw new AppError('Servicio no encontrado', 404);
        throw err;
      }

      const resGet = await conn.execute(
        `BEGIN JRGY_PRO_SERVICIO_OBTENER(:id, :curServ, :curHor); END;`,
        {
          id,
          curServ: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          curHor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );
      const curServ = resGet.outBinds.curServ;
      const curHor = resGet.outBinds.curHor;
      const servRows = (await curServ.getRows()) || [];
      const horRows = (await curHor.getRows()) || [];
      await curServ.close();
      await curHor.close();

      res.json(mapService(servRows[0], horRows));
    });
  })
);

router.patch(
  '/services/:id/status',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    const estado = String(req.body?.estado || '').toLowerCase();
    if (!id) throw new AppError('ID inválido', 400);
    if (!['activo', 'inactivo'].includes(estado)) throw new AppError('Estado inválido', 400);

    await withConnection(async (conn) => {
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_SERVICIO_CAMBIAR_ESTADO(:id, :estado); END;`,
          { id, estado },
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

router.delete(
  '/services/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID inválido', 400);

    await withConnection(async (conn) => {
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_SERVICIO_BORRAR(:id); END;`,
          { id },
          { autoCommit: true }
        );
      } catch (err) {
        if (err.errorNum === 20082) throw new AppError('Servicio no encontrado', 404);
        if (err.errorNum === 20098) {
          throw new AppError('No se puede eliminar: servicio con reservas asociadas', 409);
        }
        throw err;
      }
    });

    res.json({ ok: true });
  })
);

module.exports = router;
