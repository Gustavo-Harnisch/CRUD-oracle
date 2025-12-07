const express = require('express');
const oracledb = require('oracledb');
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
        `BEGIN JRGY_PRO_ROL_LISTAR(:cursor); END;`,
        { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cursor = result.outBinds.cursor;
      const rows = await cursor.getRows();
      await cursor.close();
      res.json(rows || []);
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
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_ROL_CREAR(:name); END;`,
          { name },
          { autoCommit: true }
        );
        res.status(201).json({ message: 'Rol creado' });
      } catch (err) {
        if (err.errorNum === 20095) throw new AppError('Rol duplicado', 409);
        throw err;
      }
    });
  })
);

router.delete(
  '/roles/:id',
  asyncHandler(async (req, res) => {
    const roleId = Number(req.params.id);
    await withConnection(async (conn) => {
      await requireUserFromToken(conn, extractToken(req), true);
      try {
        await conn.execute(
          `BEGIN JRGY_PRO_ROL_ELIMINAR(:id); END;`,
          { id: roleId },
          { autoCommit: true }
        );
        res.json({ message: 'Rol eliminado' });
      } catch (err) {
        if (err.errorNum === 20020) throw new AppError('Rol no encontrado', 404);
        throw err;
      }
    });
  })
);

module.exports = router;
