const express = require('express');
const bcrypt = require('bcryptjs');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const {
  requireNonEmpty,
  validateEmail,
  validatePhone,
  validateRoles,
  normalizeRolesInput,
  validateRut
} = require('../utils/validators');
const { fetchUsersWithRoles, fetchUserWithRoles } = require('../services/userService');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { firstOutValue } = require('../utils/oracle');

const router = express.Router();

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    await withConnection(async (conn) => {
      await requireUserFromToken(conn, extractToken(req), true);
      const result = await conn.execute(
        `BEGIN JRGY_PRO_USUARIO_LISTAR(:cursor); END;`,
        { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cursor = result.outBinds.cursor;
      const rows = await cursor.getRows();
      await cursor.close();
      const users = (rows || []).map((u) => ({
        id: u.COD_USUARIO,
        name: u.NOMBRE_USUARIO,
        apellido1: u.APELLIDO1_USUARIO,
        apellido2: u.APELLIDO2_USUARIO,
        email: u.EMAIL_USUARIO,
        telefono: u.TELEFONO_USUARIO,
        roles: (u.ROLES || '').split(',').filter(Boolean)
      }));
      res.json(users);
    });
  })
);

router.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    await withConnection(async (conn) => {
      await requireUserFromToken(conn, extractToken(req), true);
      const result = await conn.execute(
        `BEGIN JRGY_PRO_USUARIO_GET(:id, :cursor); END;`,
        { id: userId, cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cursor = result.outBinds.cursor;
      const rows = await cursor.getRows(1);
      await cursor.close();
      const user = (rows || [])[0];
      if (!user) throw new AppError('Usuario no encontrado', 404);
      res.json({
        id: user.COD_USUARIO,
        name: user.NOMBRE_USUARIO,
        apellido1: user.APELLIDO1_USUARIO,
        apellido2: user.APELLIDO2_USUARIO,
        email: user.EMAIL_USUARIO,
        telefono: user.TELEFONO_USUARIO,
        roles: (user.ROLES || '').split(',').filter(Boolean)
      });
    });
  })
);

router.post(
  '/users',
  asyncHandler(async (req, res) => {
    const data = req.body || {};
    const codUsuario = data.codUsuario ?? data.rut ?? data.RUT;
    const name = String(data.name || '').trim();
    const apellido1 = String(data.apellido1 || '').trim();
    const apellido2 = String(data.apellido2 || '').trim();
    const telefono = String(data.telefono || '').trim();
    const email = String(data.email || '').trim();
    const password = data.password || '';
    const rolesInput = data.roles ?? data.role ?? [];
    const roles = normalizeRolesInput(rolesInput);
    const roleNames = roles.length ? roles : ['USER'];

    validateRut(codUsuario);
    requireNonEmpty(name, 'nombre');
    requireNonEmpty(apellido1, 'apellido1');
    requireNonEmpty(email, 'correo');
    requireNonEmpty(password, 'contraseña');
    validateEmail(email);
    validatePhone(telefono, { optional: true });
    validateRoles(roleNames);

    const passwordHash = await bcrypt.hash(password, 10);
    const estadoActivo = 1;
    const telefonoDb = telefono || null;

    await withConnection(async (conn) => {
      await requireUserFromToken(conn, extractToken(req), true);
      try {
        const rolesJson = JSON.stringify(roleNames);
        const result = await conn.execute(
          `BEGIN JRGY_PRO_USUARIO_CREAR(:codUsuario, :name, :ap1, :ap2, :tel, :email, :passwordHash, :rolesJson, :id); END;`,
          {
            codUsuario: Number(codUsuario),
            name,
            ap1: apellido1,
            ap2: apellido2 || null,
            tel: telefonoDb,
            email,
            passwordHash,
            rolesJson,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          },
          { autoCommit: true }
        );

        const newId = firstOutValue(result.outBinds.id);
        const user = await fetchUserWithRoles(conn, newId);
        res.status(201).json(user);
      } catch (err) {
        if (err.errorNum === 20092) {
          throw new AppError('Rol solicitado no existe en catálogo.', 422);
        }
        if (err.errorNum === 20011) {
          throw new AppError('El RUT ya está registrado', 409);
        }
        if (err.errorNum === 20093) {
          throw new AppError('El correo ya está registrado', 409);
        }
        throw err;
      }
    });
  })
);

router.put(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    const data = req.body || {};
    const name = String(data.name || '').trim();
    const apellido1 = String(data.apellido1 || '').trim();
    const apellido2 = String(data.apellido2 || '').trim();
    const telefono = String(data.telefono || '').trim();
    const email = String(data.email || '').trim();
    const password = data.password || '';
    const rolesInput = data.roles ?? data.role ?? [];
    const roles = normalizeRolesInput(rolesInput);
    const roleNames = roles.length ? roles : ['USER'];

    requireNonEmpty(name, 'nombre');
    requireNonEmpty(apellido1, 'apellido1');
    requireNonEmpty(email, 'correo');
    validateEmail(email);
    validatePhone(telefono, { optional: true });
    validateRoles(roleNames);

    await withConnection(async (conn) => {
      await requireUserFromToken(conn, extractToken(req), true);
      const params = {
        id: userId,
        name,
        ap1: apellido1,
        ap2: apellido2 || null,
        tel: telefono || null,
        email
      };

      const passwordHash = password ? await bcrypt.hash(password, 10) : null;

      try {
        const rolesJson = JSON.stringify(roleNames);
        await conn.execute(
          `BEGIN JRGY_PRO_USUARIO_ACTUALIZAR(:id, :name, :ap1, :ap2, :tel, :email, :passHash, :rolesJson); END;`,
          { ...params, passHash: passwordHash, rolesJson }
        );
        const user = await fetchUserWithRoles(conn, userId);
        res.json(user);
      } catch (err) {
        if (err.errorNum === 20092) throw new AppError('Rol solicitado no existe en catálogo.', 422);
        if (err.errorNum === 20093) throw new AppError('El correo ya está registrado', 409);
        if (err.errorNum === 20094) throw new AppError('Usuario no encontrado', 404);
        throw err;
      }
    });
  })
);

router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    await withConnection(async (conn) => {
      await requireUserFromToken(conn, extractToken(req), true);
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_USUARIO_ELIMINAR(:id); END;`,
          { id: userId },
          { autoCommit: true }
        );
        res.json({ message: 'Usuario eliminado' });
      } catch (err) {
        if (err.errorNum === 20094) throw new AppError('Usuario no encontrado', 404);
        throw err;
      }
    });
  })
);

module.exports = router;
