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
  normalizeRolesInput
} = require('../utils/validators');
const {
  fetchUsersWithRoles,
  fetchUserWithRoles,
  findRoleIds,
  assignRoles
} = require('../services/userService');
const { extractToken, requireUserFromToken } = require('../services/authService');

const router = express.Router();

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    await withConnection(async (conn) => {
      await requireUserFromToken(conn, extractToken(req), true);
      const users = await fetchUsersWithRoles(conn);
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
      const user = await fetchUserWithRoles(conn, userId);
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }
      res.json(user);
    });
  })
);

router.post(
  '/users',
  asyncHandler(async (req, res) => {
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
    requireNonEmpty(password, 'contraseña');
    validateEmail(email);
    validatePhone(telefono, { optional: true });
    validateRoles(roleNames);

    const passwordHash = await bcrypt.hash(password, 10);
    const estadoActivo = 1;
    const telefonoDb = telefono || null;

    await withConnection(async (conn) => {
      await requireUserFromToken(conn, extractToken(req), true);
      const roleIds = await findRoleIds(conn, roleNames);
      if (!roleIds.length) {
        throw new AppError('Rol solicitado no existe en catálogo. Reintenta más tarde o revisa los roles disponibles.', 422);
      }

      try {
        const result = await conn.execute(
          `
            INSERT INTO JRGY_USUARIO (NOMBRE_USUARIO, APELLIDO1_USUARIO, APELLIDO2_USUARIO, TELEFONO_USUARIO, EMAIL_USUARIO, CONTRASENA_HASH, COD_ESTADO_USUARIO)
            VALUES (:name, :ap1, :ap2, :tel, :email, :passwordHash, :estado)
            RETURNING COD_USUARIO INTO :id
          `,
          {
            name,
            ap1: apellido1,
            ap2: apellido2 || null,
            tel: telefonoDb,
            email,
            passwordHash,
            estado: estadoActivo,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          },
          { autoCommit: false }
        );

        const newId = result.outBinds.id[0];
        await assignRoles(conn, newId, roleIds);
        await conn.commit();

        const user = await fetchUserWithRoles(conn, newId);
        res.status(201).json(user);
      } catch (err) {
        await conn.rollback();
        if (err && err.errorNum === 1) {
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
      const roleIds = await findRoleIds(conn, roleNames);
      if (!roleIds.length) {
        throw new AppError('Rol solicitado no existe en catálogo. Reintenta más tarde o revisa los roles disponibles.', 422);
      }

      const params = {
        id: userId,
        name,
        ap1: apellido1,
        ap2: apellido2 || null,
        tel: telefono || null,
        email
      };

      let setClause =
        'NOMBRE_USUARIO = :name, APELLIDO1_USUARIO = :ap1, APELLIDO2_USUARIO = :ap2, TELEFONO_USUARIO = :tel, EMAIL_USUARIO = :email';
      if (password) {
        params.passwordHash = await bcrypt.hash(password, 10);
        setClause += ', CONTRASENA_HASH = :passwordHash';
      }

      try {
        const result = await conn.execute(
          `UPDATE JRGY_USUARIO SET ${setClause} WHERE COD_USUARIO = :id`,
          params
        );

        if (!result.rowsAffected) {
          throw new AppError('Usuario no encontrado', 404);
        }

        await assignRoles(conn, userId, roleIds, true);
        await conn.commit();

        const user = await fetchUserWithRoles(conn, userId);
        res.json(user);
      } catch (err) {
        await conn.rollback();
        if (err instanceof AppError) {
          throw err;
        }
        if (err && err.errorNum === 1) {
          throw new AppError('El correo ya está registrado', 409);
        }
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
      const result = await conn.execute('DELETE FROM JRGY_USUARIO WHERE COD_USUARIO = :id', {
        id: userId
      });

      if (!result.rowsAffected) {
        throw new AppError('Usuario no encontrado', 404);
      }

      res.json({ message: 'Usuario eliminado' });
    });
  })
);

module.exports = router;
