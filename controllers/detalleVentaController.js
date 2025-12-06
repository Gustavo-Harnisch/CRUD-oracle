const { getConnection } = require("../db");

// GET /api/detalle-ventas
async function listarDetalles(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT COD_VENTA, COD_PRODUCTO, CANTIDAD, PRECIO_PRODUCTO, PRECIO_TOTAL
      FROM JRGY_DETALLE_VENTA
      ORDER BY COD_VENTA, COD_PRODUCTO
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/detalle-ventas/:ventaId/:productoId
async function obtenerDetalle(req, res) {
  const ventaId = Number(req.params.ventaId);
  const productoId = Number(req.params.productoId);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `
      SELECT COD_VENTA, COD_PRODUCTO, CANTIDAD, PRECIO_PRODUCTO, PRECIO_TOTAL
      FROM JRGY_DETALLE_VENTA
      WHERE COD_VENTA = :ventaId AND COD_PRODUCTO = :productoId
    `,
      { ventaId, productoId }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Detalle de venta no encontrado" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/detalle-ventas
async function crearDetalle(req, res) {
  const { cod_venta, cod_producto, cantidad, precio_producto } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      INSERT INTO JRGY_DETALLE_VENTA
        (COD_VENTA, COD_PRODUCTO, CANTIDAD, PRECIO_PRODUCTO)
      VALUES
        (:cod_venta, :cod_producto, :cantidad, :precio_producto)
    `,
      { cod_venta, cod_producto, cantidad, precio_producto },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Detalle de venta creado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/detalle-ventas/:ventaId/:productoId
async function actualizarDetalle(req, res) {
  const ventaId = Number(req.params.ventaId);
  const productoId = Number(req.params.productoId);
  const { cantidad, precio_producto } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      UPDATE JRGY_DETALLE_VENTA
      SET CANTIDAD = :cantidad,
          PRECIO_PRODUCTO = :precio_producto
      WHERE COD_VENTA = :ventaId AND COD_PRODUCTO = :productoId
    `,
      { cantidad, precio_producto, ventaId, productoId },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Detalle de venta actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/detalle-ventas/:ventaId/:productoId
async function eliminarDetalle(req, res) {
  const ventaId = Number(req.params.ventaId);
  const productoId = Number(req.params.productoId);
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      DELETE FROM JRGY_DETALLE_VENTA
      WHERE COD_VENTA = :ventaId AND COD_PRODUCTO = :productoId
    `,
      { ventaId, productoId },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Detalle de venta eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarDetalles,
  obtenerDetalle,
  crearDetalle,
  actualizarDetalle,
  eliminarDetalle
};
