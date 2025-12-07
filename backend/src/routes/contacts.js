const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { hasRole } = require('../utils/authz');
const { firstOutValue } = require('../utils/oracle');

const router = express.Router();

function mapContact(row) {
  if (!row || row.COD_CONTACTO === undefined) return null;
  return {
    id: row.COD_CONTACTO,
    nombre: row.NOMBRE,
    email: row.EMAIL,
    telefono: row.TELEFONO,
    asunto: row.ASUNTO,
    mensaje: row.MENSAJE,
    canalRespuesta: row.CANAL_RESPUESTA,
    prioridad: row.PRIORIDAD,
    fechaCreacion: row.FECHA_CREACION,
    fechaRespuesta: row.FECHA_RESPUESTA,
    usuarioId: row.COD_USUARIO,
    empleadoAsignadoId: row.COD_EMPLEADO_ASIGNADO,
    tipo: row.TIPO,
    estado: row.ESTADO,
    usuarioNombre: row.NOMBRE_USUARIO,
    empleadoNombre: row.EMPLEADO_ASIGNADO,
    respuestas: row.RESPUESTAS
  };
}

function mapResponse(row) {
  if (!row || row.COD_RESPUESTA === undefined) return null;
  return {
    id: row.COD_RESPUESTA,
    contactoId: row.COD_CONTACTO,
    empleadoId: row.COD_EMPLEADO,
    mensaje: row.MENSAJE,
    canal: row.CANAL_ENVIADO,
    fecha: row.FECHA_RESPUESTA,
    publica: row.ES_PUBLICA === 'Y',
    empleadoNombre: row.EMPLEADO_NOMBRE
  };
}

function handleContactError(err) {
  if (err && err.errorNum) {
    if (err.errorNum === 20220) throw new AppError('Contacto no encontrado', 404);
    if (err.errorNum === 20221) throw new AppError('Tipo de contacto no encontrado', 422);
    if (err.errorNum === 20222) throw new AppError('Estado de contacto no encontrado', 422);
    if (err.errorNum === 20223) throw new AppError('No autorizado', 403);
    if (err.errorNum === 20225 || err.errorNum === 20226 || err.errorNum === 20227) {
      throw new AppError(err.message, 400);
    }
    if (err.errorNum === 20228) throw new AppError('Usuario no encontrado', 404);
    if (err.errorNum === 20229) throw new AppError(err.message, 400);
    if (err.errorNum === 20230) throw new AppError(err.message, 400);
  }
  throw err;
}

async function resolveEmployeeId(conn, userId) {
  if (!userId) return null;
  const result = await conn.execute(
    `BEGIN JRGY_PRO_EMPLEADO_LISTAR(:cur); END;`,
    { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
  );
  const cursor = result.outBinds.cur;
  const rows = (await cursor.getRows()) || [];
  await cursor.close();
  const match = rows.find((r) => Number(r.COD_USUARIO) === Number(userId));
  return match ? Number(match.COD_EMPLEADO) : null;
}

async function fetchContactWithResponses(conn, id) {
  const res = await conn.execute(
    `BEGIN JRGY_PRO_CONTACTO_OBTENER(:id, :curContact, :curResp); END;`,
    {
      id,
      curContact: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      curResp: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
    }
  );
  const curContact = res.outBinds.curContact;
  const curResp = res.outBinds.curResp;
  const contactRows = (await curContact.getRows()) || [];
  const respRows = (await curResp.getRows()) || [];
  await curContact.close();
  await curResp.close();

  return {
    contacto: mapContact(contactRows[0]),
    respuestas: respRows.map(mapResponse).filter(Boolean)
  };
}

router.post(
  '/contact',
  asyncHandler(async (req, res) => {
    const data = req.body || {};
    const nombre = String(data.nombre || '').trim();
    const email = String(data.email || '').trim();
    const telefono = data.telefono ? String(data.telefono).trim() : null;
    const tipo = String(data.tipo || 'CONSULTA').trim();
    const asunto = data.asunto ? String(data.asunto).trim() : null;
    const mensaje = String(data.mensaje || '').trim();
    const canal = String(data.canalRespuesta || 'EMAIL').trim().toUpperCase();

    if (!nombre) throw new AppError('Nombre requerido', 400);
    if (!email) throw new AppError('Email requerido', 400);
    if (!mensaje) throw new AppError('Mensaje requerido', 400);

    const token = extractToken(req);
    let user = null;
    if (token) {
      try {
        user = await withConnection((conn) => requireUserFromToken(conn, token, false));
      } catch (err) {
        // token invalido: se procesa como publico
        user = null;
      }
    }

    await withConnection(async (conn) => {
      try {
        const result = await conn.execute(
          `BEGIN JRGY_PRO_CONTACTO_CREAR(:userId, :nombre, :email, :tel, :tipo, :asunto, :mensaje, :canal, :id); END;`,
          {
            userId: user?.id || null,
            nombre,
            email,
            tel: telefono,
            tipo,
            asunto,
            mensaje,
            canal,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          },
          { autoCommit: true }
        );
        const newId = firstOutValue(result.outBinds.id);
        const detail = await fetchContactWithResponses(conn, newId);
        res.status(201).json(detail);
      } catch (err) {
        handleContactError(err);
      }
    });
  })
);

router.get(
  '/contact',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    const isAdmin = hasRole(user, ['ADMIN']);
    const isEmployee = hasRole(user, ['EMPLOYEE']);

    const estado = req.query.estado ? String(req.query.estado).trim() : null;
    const tipo = req.query.tipo ? String(req.query.tipo).trim() : null;
    const busqueda = req.query.q ? String(req.query.q).trim() : null;

    const contacts = await withConnection(async (conn) => {
      const empleadoId = isAdmin ? (req.query.empleadoId ? Number(req.query.empleadoId) : null)
        : isEmployee
          ? await resolveEmployeeId(conn, user.id)
          : null;
      const userId = !isAdmin && !isEmployee ? user.id : null;

      try {
        const result = await conn.execute(
          `BEGIN JRGY_PRO_CONTACTO_LISTAR(:esAdmin, :empleadoId, :userId, :estado, :tipo, :busqueda, :cur); END;`,
          {
            esAdmin: isAdmin ? 1 : 0,
            empleadoId,
            userId,
            estado,
            tipo,
            busqueda,
            cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
          }
        );
        const cursor = result.outBinds.cur;
        const rows = (await cursor.getRows()) || [];
        await cursor.close();
        return rows.map(mapContact).filter(Boolean);
      } catch (err) {
        handleContactError(err);
      }
    });

    res.json(contacts);
  })
);

router.get(
  '/contact/:id',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    const isAdmin = hasRole(user, ['ADMIN']);
    const isEmployee = hasRole(user, ['EMPLOYEE']);
    const id = Number(req.params.id);
    if (!id) throw new AppError('ID invalido', 400);

    await withConnection(async (conn) => {
      try {
        const detail = await fetchContactWithResponses(conn, id);
        const contacto = detail.contacto;
        if (!contacto) throw new AppError('Contacto no encontrado', 404);
        const esPropietario =
          contacto.usuarioId === user.id ||
          (contacto.email && user.email && contacto.email.toLowerCase() === String(user.email).toLowerCase());
        if (!isAdmin && !isEmployee && !esPropietario) {
          throw new AppError('No autorizado', 403);
        }
        res.json(detail);
      } catch (err) {
        handleContactError(err);
      }
    });
  })
);

router.post(
  '/contact/:id/assign',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID invalido', 400);
    const requestedEmpleadoId = req.body?.empleadoId ? Number(req.body.empleadoId) : null;

    await withConnection(async (conn) => {
      const empleadoId =
        requestedEmpleadoId ||
        (await resolveEmployeeId(conn, user.id));
      if (!empleadoId) throw new AppError('Empleado no encontrado para asignar', 400);

      try {
        await conn.execute(
          `BEGIN JRGY_PRO_CONTACTO_ASIGNAR(:id, :empleadoId); END;`,
          { id, empleadoId },
          { autoCommit: true }
        );
        res.json({ message: 'Contacto asignado' });
      } catch (err) {
        handleContactError(err);
      }
    });
  })
);

router.patch(
  '/contact/:id/state',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID invalido', 400);
    const estado = String(req.body?.estado || '').trim();
    const notas = req.body?.notas ? String(req.body.notas).trim() : null;
    if (!estado) throw new AppError('Estado requerido', 400);

    await withConnection(async (conn) => {
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_CONTACTO_CAMBIAR_ESTADO(:id, :estado, :notas); END;`,
          { id, estado, notas },
          { autoCommit: true }
        );
        res.json({ message: 'Estado actualizado' });
      } catch (err) {
        handleContactError(err);
      }
    });
  })
);

router.post(
  '/contact/:id/respond',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    if (!hasRole(user, ['ADMIN', 'EMPLOYEE'])) throw new AppError('No autorizado', 403);

    const id = Number(req.params.id);
    if (!id) throw new AppError('ID invalido', 400);
    const mensaje = String(req.body?.mensaje || '').trim();
    const canal = String(req.body?.canal || 'EMAIL').trim();
    const esPublica = req.body?.publica === false ? 'N' : 'Y';

    if (!mensaje) throw new AppError('Mensaje requerido', 400);

    await withConnection(async (conn) => {
      const empleadoId = req.body?.empleadoId ? Number(req.body.empleadoId) : await resolveEmployeeId(conn, user.id);
      if (!empleadoId) throw new AppError('Empleado no encontrado para responder', 400);

      try {
        await conn.execute(
          `BEGIN JRGY_PRO_CONTACTO_RESPONDER(:id, :empleadoId, :mensaje, :canal, :publica); END;`,
          { id, empleadoId, mensaje, canal, publica: esPublica },
          { autoCommit: true }
        );
        const detail = await fetchContactWithResponses(conn, id);
        res.json(detail);
      } catch (err) {
        handleContactError(err);
      }
    });
  })
);

module.exports = router;
