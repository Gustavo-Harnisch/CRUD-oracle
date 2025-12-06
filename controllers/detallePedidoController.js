const { getConnection } = require("../db");

// GET /api/detalle-pedidos
async function listarDetalles(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT COD_PEDIDO, COD_PRODUCTO, NOMBRE_PRODUCTO, CANTIDAD_PRODUCTO, PRECIO_COMPRA, PRECIO_TOTAL
      FROM JRGY_DETALLE_PEDIDO
      ORDER BY COD_PEDIDO, COD_PRODUCTO
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/detalle-pedidos/:pedidoId/:productoId
async function obtenerDetalle(req, res) {
  const pedidoId = Number(req.params.pedidoId);
  const productoId = Number(req.params.productoId);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `
      SELECT COD_PEDIDO, COD_PRODUCTO, NOMBRE_PRODUCTO, CANTIDAD_PRODUCTO, PRECIO_COMPRA, PRECIO_TOTAL
      FROM JRGY_DETALLE_PEDIDO
      WHERE COD_PEDIDO = :pedidoId AND COD_PRODUCTO = :productoId
    `,
      { pedidoId, productoId }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Detalle de pedido no encontrado" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/detalle-pedidos
async function crearDetalle(req, res) {
  const {
    cod_pedido,
    cod_producto,
    nombre_producto,
    cantidad_producto,
    precio_compra
  } = req.body;

  const total = (Number(cantidad_producto) || 0) * (Number(precio_compra) || 0);

  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      INSERT INTO JRGY_DETALLE_PEDIDO
        (COD_PEDIDO, COD_PRODUCTO, NOMBRE_PRODUCTO, CANTIDAD_PRODUCTO, PRECIO_COMPRA, PRECIO_TOTAL)
      VALUES
        (:cod_pedido, :cod_producto, :nombre_producto, :cantidad_producto, :precio_compra, :precio_total)
    `,
      {
        cod_pedido,
        cod_producto,
        nombre_producto,
        cantidad_producto,
        precio_compra,
        precio_total: total
      },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Detalle de pedido creado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/detalle-pedidos/:pedidoId/:productoId
async function actualizarDetalle(req, res) {
  const pedidoId = Number(req.params.pedidoId);
  const productoId = Number(req.params.productoId);
  const {
    nombre_producto,
    cantidad_producto,
    precio_compra
  } = req.body;

  const total = (Number(cantidad_producto) || 0) * (Number(precio_compra) || 0);

  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      UPDATE JRGY_DETALLE_PEDIDO
      SET NOMBRE_PRODUCTO = :nombre_producto,
          CANTIDAD_PRODUCTO = :cantidad_producto,
          PRECIO_COMPRA = :precio_compra,
          PRECIO_TOTAL = :precio_total
      WHERE COD_PEDIDO = :pedidoId AND COD_PRODUCTO = :productoId
    `,
      {
        nombre_producto,
        cantidad_producto,
        precio_compra,
        precio_total: total,
        pedidoId,
        productoId
      },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Detalle de pedido actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/detalle-pedidos/:pedidoId/:proveedorId/:productoId
async function eliminarDetalle(req, res) {
  const pedidoId = Number(req.params.pedidoId);
  const productoId = Number(req.params.productoId);
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      DELETE FROM JRGY_DETALLE_PEDIDO
      WHERE COD_PEDIDO = :pedidoId AND COD_PRODUCTO = :productoId
    `,
      { pedidoId, productoId },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Detalle de pedido eliminado" });
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
