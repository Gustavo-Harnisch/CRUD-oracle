const express = require('express');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { requireNonEmpty } = require('../utils/validators');
const { extractToken, requireUserFromToken } = require('../services/authService');

const router = express.Router();

router.get(
  '/roles',
  asyncHandler(async (req, res) => {
    await withConnection(async (conn) => {
      await requireUserFromToken(conn, extractToken(req), true);
      const result = await conn.execute(
        'SELECT COD_ROL, NOMBRE_ROL FROM JRGY_ROL ORDER BY COD_ROL'
      );
      res.json(result.rows || []);
    });
  })
);

router.post(
  '/roles',
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || '').trim();
    requireNonEmpty(name, 'nombre rol');

    await withConnection(async (conn) => {
      await requireUserFromToken(conn, extractToken(req), true);
      await conn.execute('INSERT INTO JRGY_ROL (NOMBRE_ROL) VALUES (:name)', { name });
      await conn.commit();
      res.status(201).json({ message: 'Rol creado' });
    });
  })
);

router.delete(
  '/roles/:id',
  asyncHandler(async (req, res) => {
    const roleId = Number(req.params.id);
    await withConnection(async (conn) => {
      await requireUserFromToken(conn, extractToken(req), true);
      const result = await conn.execute('DELETE FROM JRGY_ROL WHERE COD_ROL = :id', {
        id: roleId
      });
      if (!result.rowsAffected) {
        throw new AppError('Rol no encontrado', 404);
      }
      await conn.commit();
      res.json({ message: 'Rol eliminado' });
    });
  })
);

module.exports = router;
