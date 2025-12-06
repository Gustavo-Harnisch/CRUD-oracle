const { getConnection, oracledb } = require("../db");

// GET /api/pago-ventas
async function listarPagos(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT COD_PAGO, COD_VENTA, MODO_PAGO, MONTO, FECHA_PAGO
      FROM JRGY_PAGO_VENTA
      ORDER BY COD_PAGO
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/pago-ventas/:id
async function obtenerPago(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `
      SELECT COD_PAGO, COD_VENTA, MODO_PAGO, MONTO, FECHA_PAGO
      FROM JRGY_PAGO_VENTA
      WHERE COD_PAGO = :id
    `,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Pago no encontrado" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/pago-ventas
async function crearPago(req, res) {
  const { cod_venta, modo_pago, monto, fecha_pago } = req.body;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `
      INSERT INTO JRGY_PAGO_VENTA (COD_PAGO, COD_VENTA, MODO_PAGO, MONTO, FECHA_PAGO)
      VALUES (SQ_PK_PAGO_VENTA.NEXTVAL, :cod_venta, :modo_pago, :monto, TO_DATE(:fecha_pago, 'YYYY-MM-DD'))
      RETURNING COD_PAGO INTO :nuevo_id
    `,
      {
        cod_venta,
        modo_pago,
        monto,
        fecha_pago,
        nuevo_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const id = result.outBinds.nuevo_id[0];
    res.json({ ok: true, message: "Pago creado", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/pago-ventas/:id
async function actualizarPago(req, res) {
  const id = Number(req.params.id);
  const { cod_venta, modo_pago, monto, fecha_pago } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      UPDATE JRGY_PAGO_VENTA
      SET COD_VENTA = :cod_venta,
          MODO_PAGO = :modo_pago,
          MONTO = :monto,
          FECHA_PAGO = TO_DATE(:fecha_pago, 'YYYY-MM-DD')
      WHERE COD_PAGO = :id
    `,
      { cod_venta, modo_pago, monto, fecha_pago, id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Pago actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/pago-ventas/:id
async function eliminarPago(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_PAGO_VENTA WHERE COD_PAGO = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Pago eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarPagos,
  obtenerPago,
  crearPago,
  actualizarPago,
  eliminarPago
};
