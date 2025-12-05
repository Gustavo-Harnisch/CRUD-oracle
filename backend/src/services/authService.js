const { AppError } = require('../utils/errors');
const config = require('../config');
const { fetchUserRoles } = require('./userService');

function extractToken(req) {
  const auth = req.headers.authorization || '';
  const match = auth.match(/bearer\s+(.+)/i);
  return match ? match[1].trim() : null;
}

async function requireUserFromToken(conn, token, requireAdmin = false) {
  if (!token) {
    throw new AppError('Token faltante', 401);
  }

  const res = await conn.execute(
    `
      SELECT u.COD_USUARIO, u.NOMBRE_USUARIO, u.APELLIDO1_USUARIO, u.APELLIDO2_USUARIO, u.EMAIL_USUARIO, u.TELEFONO_USUARIO, t.EXPIRES_AT
      FROM tokens t
      INNER JOIN JRGY_USUARIO u ON u.COD_USUARIO = t.user_id
      WHERE t.token = :token
    `,
    { token }
  );

  const row = (res.rows || [])[0];
  if (!row) {
    throw new AppError('Token inválido', 401);
  }

  const expires = new Date(row.EXPIRES_AT);
  if (Number.isNaN(expires.getTime()) || expires.getTime() < Date.now()) {
    throw new AppError('Token expirado', 401);
  }

  const roles = await fetchUserRoles(conn, row.COD_USUARIO);
  const user = {
    id: row.COD_USUARIO,
    name: row.NOMBRE_USUARIO,
    apellido1: row.APELLIDO1_USUARIO,
    apellido2: row.APELLIDO2_USUARIO,
    email: row.EMAIL_USUARIO,
    telefono: row.TELEFONO_USUARIO,
    roles
  };

  if (requireAdmin) {
    const adminRoles = (config.adminRoles || ['ADMIN']).map((r) => r.toUpperCase());
    const hasAdmin = roles.some((role) => adminRoles.includes(String(role || '').toUpperCase()));
    if (!hasAdmin) {
      throw new AppError('No autorizado', 403);
    }
  }

  return user;
}

module.exports = {
  extractToken,
  requireUserFromToken
};
