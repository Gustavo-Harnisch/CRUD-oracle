const express = require('express');
const bcrypt = require('bcryptjs');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { generateToken, revokeToken } = require('../services/tokenService');
const {
  requireNonEmpty,
  validateEmail,
  validatePhone,
  normalizeRolesInput,
  validateRoles,
  validateRut
} = require('../utils/validators');
const {
  fetchUserRoles,
  findRoleIds,
  assignRoles,
  fetchUserWithRoles
} = require('../services/userService');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { firstOutValue } = require('../utils/oracle');

const router = express.Router();

router.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || '').trim();
    const password = req.body?.password || '';

    requireNonEmpty(email, 'correo');
    requireNonEmpty(password, 'contraseña');
    validateEmail(email);

    await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_AUTH_LOGIN(:email, :cursor); END;`,
        { email, cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cursor = result.outBinds.cursor;
      const rows = await cursor.getRows(1);
      await cursor.close();
      const user = (rows || [])[0];

      const validPassword =
        user && user.CONTRASENA_HASH && (await bcrypt.compare(password, user.CONTRASENA_HASH));

      if (!validPassword) {
        throw new AppError('Credenciales inválidas', 401);
      }

      const roles = await fetchUserRoles(conn, user.COD_USUARIO);
      const token = await generateToken(conn, user.COD_USUARIO);

      res.json({
        token,
        user: {
          id: user.COD_USUARIO,
          name: user.NOMBRE_USUARIO,
          apellido1: user.APELLIDO1_USUARIO,
          apellido2: user.APELLIDO2_USUARIO,
          email: user.EMAIL_USUARIO,
          telefono: user.TELEFONO_USUARIO,
          roles
        }
      });
    });
  })
);

router.post(
  '/auth/register',
  asyncHandler(async (req, res) => {
    const data = req.body || {};
    const codUsuario = data.codUsuario ?? data.rut ?? data.RUT;
    const name = String(data.name || '').trim();
    const apellido1 = String(data.apellido1 || '').trim();
    const apellido2 = String(data.apellido2 || '').trim();
    const telefono = String(data.telefono || '').trim();
    const email = String(data.email || '').trim();
    const password = data.password || '';
    const roleInput = data.roles ?? data.role ?? [];
    const roles = normalizeRolesInput(roleInput);
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
        const token = await generateToken(conn, newId);
        res.status(201).json({ token, user });
      } catch (err) {
        if (err.errorNum === 20092) throw new AppError('Rol solicitado no existe en catálogo.', 422);
        if (err.errorNum === 20093) throw new AppError('El correo ya está registrado', 409);
        throw err;
      }
    });
  })
);

router.post(
  '/auth/logout',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    if (token) {
      await withConnection((conn) => revokeToken(conn, token));
    }
    res.json({ message: 'Sesión cerrada' });
  })
);

router.get(
  '/auth/me',
  asyncHandler(async (req, res) => {
    const token = extractToken(req);
    const user = await withConnection((conn) => requireUserFromToken(conn, token, false));
    res.json(user);
  })
);

module.exports = router;
