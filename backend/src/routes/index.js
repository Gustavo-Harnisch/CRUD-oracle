const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const adminRequestRoutes = require('./adminRequests');
const roleRoutes = require('./roles');
const { asyncHandler } = require('../utils/errors');
const { withConnection } = require('../db');

const router = express.Router();

router.use(authRoutes);
router.use(userRoutes);
router.use(adminRequestRoutes);
router.use(roleRoutes);

router.get('/ping', (req, res) => {
  res.json({ ok: true });
});

router.get(
  '/test_oracle',
  asyncHandler(async (req, res) => {
    await withConnection(async (conn) => {
      const result = await conn.execute('SELECT SYSTIMESTAMP AS NOW FROM dual');
      const now = (result.rows || [])[0]?.NOW;
      res.json({ ok: true, now });
    });
  })
);

router.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

module.exports = router;
