const { getConnection, oracledb } = require("../db");

// GET /api/movimientos-stock
async function listarMovimientos(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT COD_MOVIMIENTO, COD_PRODUCTO, TIPO_MOVIMIENTO, CANTIDAD, FECHA_MOVIMIENTO, MOTIVO
      FROM JRGY_MOVIMIENTO_STOCK
      ORDER BY COD_MOVIMIENTO
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/movimientos-stock/:id
async function obtenerMovimiento(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `
      SELECT COD_MOVIMIENTO, COD_PRODUCTO, TIPO_MOVIMIENTO, CANTIDAD, FECHA_MOVIMIENTO, MOTIVO
      FROM JRGY_MOVIMIENTO_STOCK
      WHERE COD_MOVIMIENTO = :id
    `,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Movimiento no encontrado" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/movimientos-stock
async function crearMovimiento(req, res) {
  const { cod_producto, tipo_movimiento, cantidad, fecha_movimiento, motivo } = req.body;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `
      INSERT INTO JRGY_MOVIMIENTO_STOCK
        (COD_MOVIMIENTO, COD_PRODUCTO, TIPO_MOVIMIENTO, CANTIDAD, FECHA_MOVIMIENTO, MOTIVO)
      VALUES
        (SQ_PK_MOVIMIENTO_STOCK.NEXTVAL, :cod_producto, :tipo_movimiento, :cantidad, TO_DATE(:fecha_movimiento, 'YYYY-MM-DD'), :motivo)
      RETURNING COD_MOVIMIENTO INTO :nuevo_id
    `,
      {
        cod_producto,
        tipo_movimiento,
        cantidad,
        fecha_movimiento,
        motivo,
        nuevo_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const id = result.outBinds.nuevo_id[0];
    res.json({ ok: true, message: "Movimiento creado", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/movimientos-stock/:id
async function actualizarMovimiento(req, res) {
  const id = Number(req.params.id);
  const { cod_producto, tipo_movimiento, cantidad, fecha_movimiento, motivo } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      UPDATE JRGY_MOVIMIENTO_STOCK
      SET COD_PRODUCTO = :cod_producto,
          TIPO_MOVIMIENTO = :tipo_movimiento,
          CANTIDAD = :cantidad,
          FECHA_MOVIMIENTO = TO_DATE(:fecha_movimiento, 'YYYY-MM-DD'),
          MOTIVO = :motivo
      WHERE COD_MOVIMIENTO = :id
    `,
      { cod_producto, tipo_movimiento, cantidad, fecha_movimiento, motivo, id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Movimiento actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/movimientos-stock/:id
async function eliminarMovimiento(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_MOVIMIENTO_STOCK WHERE COD_MOVIMIENTO = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Movimiento eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarMovimientos,
  obtenerMovimiento,
  crearMovimiento,
  actualizarMovimiento,
  eliminarMovimiento
};
