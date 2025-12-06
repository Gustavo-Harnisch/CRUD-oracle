const { getConnection, oracledb } = require("../db");

// GET /api/pedidos
async function listarPedidos(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT COD_PEDIDO, VALOR_TOTAL, FECHA_PEDIDO, COD_EMPLEADO, COD_PROVEEDOR
      FROM JRGY_PEDIDO
      ORDER BY COD_PEDIDO
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/pedidos/:id
async function obtenerPedido(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT COD_PEDIDO, VALOR_TOTAL, FECHA_PEDIDO, COD_EMPLEADO, COD_PROVEEDOR FROM JRGY_PEDIDO WHERE COD_PEDIDO = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Pedido no encontrado" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/pedidos
async function crearPedido(req, res) {
  const { fecha_pedido, cod_empleado, cod_proveedor } = req.body;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `
      INSERT INTO JRGY_PEDIDO (COD_PEDIDO, VALOR_TOTAL, FECHA_PEDIDO, COD_EMPLEADO, COD_PROVEEDOR)
      VALUES (SQ_PK_PEDIDO.NEXTVAL, 0, TO_DATE(:fecha_pedido, 'YYYY-MM-DD'), :cod_empleado, :cod_proveedor)
      RETURNING COD_PEDIDO INTO :nuevo_id
    `,
      {
        fecha_pedido,
        cod_empleado,
        cod_proveedor,
        nuevo_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const id = result.outBinds.nuevo_id[0];
    res.json({ ok: true, message: "Pedido creado", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/pedidos/:id
async function actualizarPedido(req, res) {
  const id = Number(req.params.id);
  const { fecha_pedido, cod_empleado, cod_proveedor } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      UPDATE JRGY_PEDIDO
      SET FECHA_PEDIDO = TO_DATE(:fecha_pedido, 'YYYY-MM-DD'),
          COD_EMPLEADO = :cod_empleado,
          COD_PROVEEDOR = :cod_proveedor
      WHERE COD_PEDIDO = :id
    `,
      { fecha_pedido, cod_empleado, cod_proveedor, id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Pedido actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/pedidos/:id
async function eliminarPedido(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_PEDIDO WHERE COD_PEDIDO = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Pedido eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarPedidos,
  obtenerPedido,
  crearPedido,
  actualizarPedido,
  eliminarPedido
};
