const express = require('express');
const oracledb = require('oracledb');
const { asyncHandler } = require('../utils/errors');
const { withConnection } = require('../db');

const router = express.Router();

router.get(
  '/experiences',
  asyncHandler(async (_req, res) => {
    const experiences = await withConnection(async (conn) => {
      const result = await conn.execute(
        `BEGIN JRGY_PRO_EXPERIENCIA_LISTAR(:cursor); END;`,
        { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
      );
      const cursor = result.outBinds.cursor;
      const rows = await cursor.getRows();
      await cursor.close();
      return rows || [];
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
