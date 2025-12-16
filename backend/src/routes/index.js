const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const adminRequestRoutes = require('./adminRequests');
const roleRoutes = require('./roles');
const roomRoutes = require('./rooms');
const experienceRoutes = require('./experiences');
const reservationRoutes = require('./reservations');
const serviceRoutes = require('./services');
const reservationServiceRoutes = require('./reservationServices');
const contactRoutes = require('./contacts');
const productRoutes = require('./products');
const providerRoutes = require('./providers');
const purchaseRoutes = require('./purchases');
const geoRoutes = require('./geo');
const departmentRoutes = require('./departments');
const employeeRoutes = require('./employees');
const reportRoutes = require('./reports');
const { asyncHandler } = require('../utils/errors');
const { withConnection } = require('../db');

const router = express.Router();

router.use(authRoutes);
router.use(userRoutes);
router.use(adminRequestRoutes);
router.use(roleRoutes);
router.use(roomRoutes);
router.use(experienceRoutes);
router.use(reservationRoutes);
router.use(serviceRoutes);
router.use(reservationServiceRoutes);
router.use(contactRoutes);
router.use(productRoutes);
router.use(providerRoutes);
router.use(purchaseRoutes);
router.use(geoRoutes);
router.use(departmentRoutes);
router.use(employeeRoutes);
router.use(reportRoutes);

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
