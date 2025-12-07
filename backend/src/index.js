const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const { initPool, closePool, withConnection } = require('./db');
const { errorMiddleware } = require('./utils/errors');
const { ensureBaseRoles } = require('./services/userService');

async function bootstrap() {
  await initPool();
  await withConnection((conn) => ensureBaseRoles(conn));

  const app = express();

  const explicitOrigins = (config.corsOrigin || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const localFallbackOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173'
  ];
  const allowedOrigins = explicitOrigins.length ? explicitOrigins : localFallbackOrigins;

  const isLocalNetwork = (origin = '') =>
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
    /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01]))/.test(origin);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true); // peticiones sin header Origin (por ejemplo, curl)
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (isLocalNetwork(origin)) return callback(null, true);
        return callback(new Error(`CORS bloqueado para origen: ${origin}`));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    })
  );

  app.use(express.json());

  // Respuesta clara para JSON inválido.
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ message: 'JSON inválido en el cuerpo de la solicitud' });
    }
    return next(err);
  });

  app.use('/api', routes);
  app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
  });
  app.use(errorMiddleware);

  const server = app.listen(config.port, () => {
    console.log(`API Node escuchando en http://localhost:${config.port}/api`);
  });

  const shutdown = async () => {
    console.log('Cerrando servidor...');
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('No se pudo iniciar el servidor', err);
  process.exit(1);
});
