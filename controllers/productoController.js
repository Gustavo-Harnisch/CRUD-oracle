const { getConnection, oracledb } = require("../db");

// GET /api/productos
async function listarProductos(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT 
        COD_PRODUCTO,
        NOMBRE_PRODUCTO,
        TIPO_PRODUCTO,
        PRECIO_PRODUCTO,
        CANTIDAD_PRODUCTO,
        STOCK_PRODUCTO
      FROM JRGY_PRODUCTO
      ORDER BY COD_PRODUCTO
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/productos/:id
async function obtenerProducto(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM JRGY_PRODUCTO WHERE COD_PRODUCTO = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Producto no encontrado" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/productos
async function crearProducto(req, res) {
  const { nombre, tipo, precio, cantidad, stock } = req.body;

  let conn;
  try {
    conn = await getConnection();

    const sql = `
      INSERT INTO JRGY_PRODUCTO
        (NOMBRE_PRODUCTO, TIPO_PRODUCTO, PRECIO_PRODUCTO, CANTIDAD_PRODUCTO, STOCK_PRODUCTO)
      VALUES
        (:nombre, :tipo, :precio, :cantidad, :stock)
      RETURNING COD_PRODUCTO INTO :nuevo_id
    `;

    const result = await conn.execute(
      sql,
      {
        nombre,
        tipo,
        precio,
        cantidad,
        stock,
        nuevo_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const nuevoId = result.outBinds.nuevo_id[0];

    res.json({ ok: true, message: "Producto creado", id: nuevoId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/productos/:id
async function actualizarProducto(req, res) {
  const id = Number(req.params.id);
  const { nombre, tipo, precio, cantidad, stock } = req.body;

  let conn;
  try {
    conn = await getConnection();

    await conn.execute(
      `
      UPDATE JRGY_PRODUCTO
      SET
        NOMBRE_PRODUCTO = :nombre,
        TIPO_PRODUCTO   = :tipo,
        PRECIO_PRODUCTO = :precio,
        CANTIDAD_PRODUCTO = :cantidad,
        STOCK_PRODUCTO  = :stock
      WHERE COD_PRODUCTO = :id
    `,
      { nombre, tipo, precio, cantidad, stock, id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Producto actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/productos/:id
async function eliminarProducto(req, res) {
  const id = Number(req.params.id);
  let conn;

  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_PRODUCTO WHERE COD_PRODUCTO = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Producto eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};
