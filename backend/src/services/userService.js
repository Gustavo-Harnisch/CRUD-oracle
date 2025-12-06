const { AppError } = require('../utils/errors');
const config = require('../config');

function normalizeRoleNames(roleNames) {
  const normalized = roleNames.map((r) => String(r || '').trim().toUpperCase()).filter(Boolean);
  return Array.from(new Set(normalized));
}

function buildNamedPlaceholders(prefix, items) {
  const binds = {};
  const placeholders = items
    .map((_, idx) => {
      const key = `${prefix}${idx}`;
      binds[key] = items[idx];
      return `:${key}`;
    })
    .join(', ');
  return { placeholders, binds };
}

async function fetchUserRoles(conn, userId) {
  const res = await conn.execute(
    `
      SELECT r.NOMBRE_ROL
      FROM JRGY_USUARIO_ROL ur
      INNER JOIN JRGY_ROL r ON r.COD_ROL = ur.COD_ROL
      WHERE ur.COD_USUARIO = :userId
    `,
    { userId }
  );

  return (res.rows || []).map((row) => row.NOMBRE_ROL);
}

async function fetchUserWithRoles(conn, userId) {
  const res = await conn.execute(
    `
      SELECT COD_USUARIO, NOMBRE_USUARIO, APELLIDO1_USUARIO, APELLIDO2_USUARIO, EMAIL_USUARIO, TELEFONO_USUARIO
      FROM JRGY_USUARIO
      WHERE COD_USUARIO = :id
    `,
    { id: userId }
  );

  const user = (res.rows || [])[0];
  if (!user) {
    return null;
  }

  const roles = await fetchUserRoles(conn, userId);

  return {
    id: user.COD_USUARIO,
    name: user.NOMBRE_USUARIO,
    apellido1: user.APELLIDO1_USUARIO,
    apellido2: user.APELLIDO2_USUARIO,
    email: user.EMAIL_USUARIO,
    telefono: user.TELEFONO_USUARIO,
    roles
  };
}

async function fetchUsersWithRoles(conn) {
  const res = await conn.execute(
    `
      SELECT COD_USUARIO, NOMBRE_USUARIO, APELLIDO1_USUARIO, APELLIDO2_USUARIO, EMAIL_USUARIO, TELEFONO_USUARIO
      FROM JRGY_USUARIO
      ORDER BY COD_USUARIO ASC
    `
  );

  const users = res.rows || [];
  if (users.length === 0) {
    return [];
  }

  const ids = users.map((u) => u.COD_USUARIO);
  const rolesMap = await fetchRolesMap(conn, ids);

  return users.map((u) => ({
    id: u.COD_USUARIO,
    name: u.NOMBRE_USUARIO,
    apellido1: u.APELLIDO1_USUARIO,
    apellido2: u.APELLIDO2_USUARIO,
    email: u.EMAIL_USUARIO,
    telefono: u.TELEFONO_USUARIO,
    roles: rolesMap[u.COD_USUARIO] || []
  }));
}

async function fetchRolesMap(conn, userIds) {
  if (!userIds.length) {
    return {};
  }
  const { placeholders, binds } = buildNamedPlaceholders('id', userIds);
  const res = await conn.execute(
    `
      SELECT ur.COD_USUARIO, r.NOMBRE_ROL
      FROM JRGY_USUARIO_ROL ur
      INNER JOIN JRGY_ROL r ON r.COD_ROL = ur.COD_ROL
      WHERE ur.COD_USUARIO IN (${placeholders})
    `,
    binds
  );

  return (res.rows || []).reduce((acc, row) => {
    const userId = row.COD_USUARIO;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(row.NOMBRE_ROL);
    return acc;
  }, {});
}

async function findRoleIds(conn, roleNames) {
  if (!roleNames.length) {
    return [];
  }

  const normalized = normalizeRoleNames(roleNames);
  const { placeholders, binds } = buildNamedPlaceholders('r', normalized);

  const res = await conn.execute(
    `SELECT COD_ROL, NOMBRE_ROL FROM JRGY_ROL WHERE UPPER(NOMBRE_ROL) IN (${placeholders})`,
    binds
  );

  return (res.rows || []).map((row) => row.COD_ROL);
}

async function assignRoles(conn, userId, roleIds, replace = false) {
  if (!roleIds.length) {
    return;
  }

  if (replace) {
    await conn.execute('DELETE FROM JRGY_USUARIO_ROL WHERE COD_USUARIO = :id', { id: userId });
  }

  for (const roleId of roleIds) {
    await conn.execute(
      'INSERT INTO JRGY_USUARIO_ROL (COD_USUARIO, COD_ROL) VALUES (:userId, :roleId)',
      { userId, roleId }
    );
  }
}

function ensureExists(entity, message) {
  if (!entity) {
    throw new AppError(message, 404);
  }
}

async function ensureBaseRoles(conn) {
  const baseRoles = normalizeRoleNames([
    'USER',
    'EMPLOYEE',
    ...(config.adminRoles || [])
  ]);

  if (!baseRoles.length) {
    return;
  }

  const { placeholders, binds } = buildNamedPlaceholders('r', baseRoles);
  const existing = await conn.execute(
    `SELECT UPPER(NOMBRE_ROL) AS NAME FROM JRGY_ROL WHERE UPPER(NOMBRE_ROL) IN (${placeholders})`,
    binds
  );
  const existingNames = new Set((existing.rows || []).map((row) => row.NAME));
  const missing = baseRoles.filter((role) => !existingNames.has(role));

  for (const role of missing) {
    await conn.execute('INSERT INTO JRGY_ROL (NOMBRE_ROL) VALUES (:role)', { role });
  }

  if (missing.length) {
    await conn.commit();
  }
}

module.exports = {
  assignRoles,
  fetchRolesMap,
  fetchUserRoles,
  fetchUserWithRoles,
  fetchUsersWithRoles,
  findRoleIds,
  normalizeRoleNames,
  ensureExists,
  ensureBaseRoles
};
