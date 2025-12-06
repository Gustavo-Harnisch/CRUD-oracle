const express = require('express');
const { asyncHandler } = require('../utils/errors');
const { withConnection } = require('../db');

const router = express.Router();

router.get(
  '/rooms',
  asyncHandler(async (_req, res) => {
    const rooms = await withConnection(async (conn) => {
      const result = await conn.execute(
        `
          SELECT
            h.COD_HABITACION AS ID,
            h.NRO_HABITACION AS NUMERO,
            h.CAPACIDAD,
            h.PRECIO_BASE,
            th.TIPO_HABITACION AS TIPO,
            eh.ESTADO_HABITACION AS ESTADO
          FROM JRGY_HABITACION h
          LEFT JOIN JRGY_CAT_TIPO_HABITACION th ON th.COD_TIPO_HABITACION = h.COD_TIPO_HABITACION
          LEFT JOIN JRGY_CAT_ESTADO_HABITACION eh ON eh.COD_ESTADO_HABITACION = h.COD_ESTADO_HABITACION
          ORDER BY h.NRO_HABITACION
        `
      );
      return result.rows || [];
    });

    res.json(
      rooms.map((r) => ({
        id: r.ID,
        numero: r.NUMERO,
        capacidad: r.CAPACIDAD,
        precioBase: r.PRECIO_BASE,
        tipo: r.TIPO,
        estado: r.ESTADO
      }))
    );
  })
);

module.exports = router;
