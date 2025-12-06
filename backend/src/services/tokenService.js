const crypto = require('crypto');
const config = require('../config');

function buildToken() {
  const random = crypto.randomBytes(32).toString('hex');
  return crypto.createHmac('sha256', config.appKey).update(random).digest('hex');
}

async function generateToken(conn, userId) {
  const token = buildToken();
  // Guardamos un objeto Date para que Oracle lo maneje como DATE y evitar ORA-01861
  const expiresAt = new Date(Date.now() + config.tokenTtlHours * 60 * 60 * 1000);

  await conn.execute(
    'INSERT INTO tokens (user_id, token, expires_at) VALUES (:userId, :token, :expiresAt)',
    { userId, token, expiresAt },
    { autoCommit: true }
  );

  return token;
}

async function revokeToken(conn, token) {
  await conn.execute('DELETE FROM tokens WHERE token = :token', { token }, { autoCommit: true });
}

async function revokeAllTokensForUser(conn, userId) {
  await conn.execute('DELETE FROM tokens WHERE user_id = :userId', { userId }, { autoCommit: true });
}

module.exports = {
  generateToken,
  revokeToken,
  revokeAllTokensForUser
};
