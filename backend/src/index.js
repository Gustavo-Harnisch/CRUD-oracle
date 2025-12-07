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

  app.use(
    cors({
      origin: config.corsOrigin,
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
