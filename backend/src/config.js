const dotenv = require('dotenv');

dotenv.config();

const adminRolesEnv = process.env.ADMIN_ROLES || 'ADMIN,ADMINISTRADOR';

const config = {
  port: Number(process.env.PORT || 3000),
  appKey: process.env.APP_KEY || 'change-me-secret',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  tokenTtlHours: Number(process.env.TOKEN_TTL_HOURS || 24),
  adminRoles: adminRolesEnv
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r.length > 0),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || '1521',
    service: process.env.DB_SERVICE || 'XEPDB1',
    user: process.env.DB_USER || 'UCM',
    password: process.env.DB_PASSWORD || 'ucm',
    charset: process.env.DB_CHARSET || 'AL32UTF8'
  }
};

module.exports = config;
