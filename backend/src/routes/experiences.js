const express = require('express');
const { asyncHandler } = require('../utils/errors');
const { withConnection } = require('../db');

const router = express.Router();

router.get(
  '/experiences',
  asyncHandler(async (_req, res) => {
    const experiences = await withConnection(async (conn) => {
      const result = await conn.execute(
        `
          SELECT
            COD_EXPERIENCIA AS ID,
            NOMBRE,
            DESCRIPCION,
            PRECIO,
            TAG,
            ESTADO
          FROM JRGY_EXPERIENCIA
          ORDER BY COD_EXPERIENCIA
        `
      );
      return result.rows || [];
    });

    res.json(
      experiences.map((e) => ({
        id: e.ID,
        nombre: e.NOMBRE,
        descripcion: e.DESCRIPCION,
        precio: e.PRECIO,
        tag: e.TAG,
        estado: e.ESTADO
      }))
    );
  })
);

module.exports = router;
