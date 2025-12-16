const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler } = require('../utils/errors');
const { withConnection } = require('../db');

const router = express.Router();

router.get(
  '/geo/regions',
  asyncHandler(async (_req, res) => {
    const regions = await withConnection(async (conn) => {
      const result = await conn.execute(
        `SELECT COD_REGION AS ID, REGION AS NOMBRE FROM JRGY_REGION ORDER BY REGION`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return (result.rows || []).map((r) => ({ id: r.ID, nombre: r.NOMBRE }));
    });
    res.json(regions);
  })
);

router.get(
  '/geo/regions/:regionId/cities',
  asyncHandler(async (req, res) => {
    const regionId = Number(req.params.regionId);
    if (!regionId) return res.json([]);

    const cities = await withConnection(async (conn) => {
      const result = await conn.execute(
        `SELECT COD_CIUDAD AS ID, CIUDAD AS NOMBRE, COD_REGION AS REGION_ID
         FROM JRGY_CIUDAD
         WHERE COD_REGION = :regionId
         ORDER BY CIUDAD`,
        { regionId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return (result.rows || []).map((c) => ({
        id: c.ID,
        nombre: c.NOMBRE,
        regionId: c.REGION_ID
      }));
    });

    res.json(cities);
  })
);

module.exports = router;
