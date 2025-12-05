const express = require('express');
const { asyncHandler, AppError } = require('../utils/errors');
const { withConnection } = require('../db');
const { requireNonEmpty } = require('../utils/validators');
const { extractToken, requireUserFromToken } = require('../services/authService');
const { findRoleIds, assignRoles } = require('../services/userService');

const router = express.Router();

router.post(
  '/admin/requests',
  asyncHandler(async (req, res) => {
    const motivo = String(req.body?.motivo || '').trim();
    requireNonEmpty(motivo, 'motivo');

    await withConnection(async (conn) => {
      const auth = await requireUserFromToken(conn, extractToken(req));
      await conn.execute(
        `
          INSERT INTO JRGY_SOLICITUD_ADMIN (COD_USUARIO, ESTADO, MOTIVO, FECHA_CREACION)
          VALUES (:userId, :estado, :motivo, SYSDATE)
        `,
        { userId: auth.id, estado: 'pending', motivo },
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
        `
          SELECT s.COD_SOLICITUD, s.COD_USUARIO, s.ESTADO, s.MOTIVO, s.FECHA_CREACION, s.FECHA_RESOLUCION, s.APROBADO_POR,
                 u.NOMBRE_USUARIO, u.EMAIL_USUARIO
          FROM JRGY_SOLICITUD_ADMIN s
          INNER JOIN JRGY_USUARIO u ON u.COD_USUARIO = s.COD_USUARIO
          ORDER BY s.FECHA_CREACION DESC
        `
      );
      res.json(result.rows || []);
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
        const rowRes = await conn.execute(
          `
            SELECT COD_SOLICITUD, COD_USUARIO, ESTADO
            FROM JRGY_SOLICITUD_ADMIN
            WHERE COD_SOLICITUD = :id
            FOR UPDATE
          `,
          { id: requestId }
        );

        const solicitud = (rowRes.rows || [])[0];
        if (!solicitud) {
          throw new AppError('Solicitud no encontrada', 404);
        }
        if (solicitud.ESTADO !== 'pending') {
          throw new AppError('La solicitud ya fue resuelta', 409);
        }

        const nuevoEstado = action === 'approve' ? 'approved' : 'rejected';
        await conn.execute(
          `
            UPDATE JRGY_SOLICITUD_ADMIN
            SET ESTADO = :estado, APROBADO_POR = :approver, FECHA_RESOLUCION = SYSDATE
            WHERE COD_SOLICITUD = :id
          `,
          { estado: nuevoEstado, approver: approver.id, id: requestId }
        );

        if (action === 'approve') {
          const adminRoleIds = await findRoleIds(conn, ['ADMIN']);
          await assignRoles(conn, solicitud.COD_USUARIO, adminRoleIds, false);
        }

        await conn.commit();
        res.json({ message: `Solicitud ${nuevoEstado}` });
      } catch (err) {
        await conn.rollback();
        throw err;
      }
    });
  })
);

module.exports = router;
