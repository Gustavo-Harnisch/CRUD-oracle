const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { requireNonEmpty } = require('../utils/validators');
const { extractToken, requireUserFromToken } = require('../services/authService');

const router = express.Router();

router.post(
  '/admin/requests',
  asyncHandler(async (req, res) => {
    const motivo = String(req.body?.motivo || '').trim();
    requireNonEmpty(motivo, 'motivo');

    await withConnection(async (conn) => {
      const auth = await requireUserFromToken(conn, extractToken(req));
      await conn.execute(
        `BEGIN JRGY_PRO_SOLICITUD_CREAR(:userId, :motivo); END;`,
        { userId: auth.id, motivo },
        { autoCommit: true }
      );

      res.status(201).json({ message: 'Solicitud creada' });
    });
  })
);

router.get(
  '/admin/requests',
  asyncHandler(async (req, res) => {
    await withConnection(async (conn) => {
      await requireUserFromToken(conn, extractToken(req), true);
      const result = await conn.execute(
        `BEGIN JRGY_PRO_SOLICITUD_LISTAR(:cursor); END;`,
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
  '/admin/requests/:id/:action',
  asyncHandler(async (req, res) => {
    const requestId = Number(req.params.id);
    const action = String(req.params.action || '').toLowerCase();
    if (!['approve', 'reject'].includes(action)) {
      throw new AppError('Acción inválida', 422);
    }

    await withConnection(async (conn) => {
      const approver = await requireUserFromToken(conn, extractToken(req), true);

      try {
        const nuevoEstado = action === 'approve' ? 'approved' : 'rejected';
        await conn.execute(
          `BEGIN JRGY_PRO_SOLICITUD_RESOLVER(:id, :estado, :approver); END;`,
          { id: requestId, estado: nuevoEstado, approver: approver.id },
          { autoCommit: true }
        );
        res.json({ message: `Solicitud ${nuevoEstado}` });
      } catch (err) {
        if (err.errorNum === 20096) throw new AppError('La solicitud ya fue resuelta', 409);
        if (err.errorNum === 20097) throw new AppError('Solicitud no encontrada', 404);
        throw err;
      }
    });
  })
);

module.exports = router;
