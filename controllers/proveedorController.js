const { getConnection, oracledb } = require("../db");

// GET /api/proveedores
async function listarProveedores(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT 
        COD_PROVEEDOR,
        NOMBRE_PROVEEDOR,
        DIRECCION_PROVEEDOR,
        TELEFONO_PROVEEDOR,
        COD_REGION
      FROM JRGY_PROVEEDOR
      ORDER BY COD_PROVEEDOR
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/proveedores/:id
async function obtenerProveedor(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM JRGY_PROVEEDOR WHERE COD_PROVEEDOR = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Proveedor no encontrado" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/proveedores
async function crearProveedor(req, res) {
  const { nombre, direccion, telefono, cod_region } = req.body;

  let conn;
  try {
    conn = await getConnection();

    const sql = `
      INSERT INTO JRGY_PROVEEDOR
        (NOMBRE_PROVEEDOR, DIRECCION_PROVEEDOR, TELEFONO_PROVEEDOR, COD_REGION)
      VALUES
        (:nombre, :direccion, :telefono, :cod_region)
      RETURNING COD_PROVEEDOR INTO :nuevo_id
    `;

    const result = await conn.execute(
      sql,
      {
        nombre,
        direccion,
        telefono,
        cod_region,
        nuevo_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const nuevoId = result.outBinds.nuevo_id[0];
    res.json({ ok: true, message: "Proveedor creado", id: nuevoId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/proveedores/:id
async function actualizarProveedor(req, res) {
  const id = Number(req.params.id);
  const { nombre, direccion, telefono, cod_region } = req.body;

  let conn;
  try {
    conn = await getConnection();

    await conn.execute(
      `
      UPDATE JRGY_PROVEEDOR
      SET
        NOMBRE_PROVEEDOR    = :nombre,
        DIRECCION_PROVEEDOR = :direccion,
        TELEFONO_PROVEEDOR  = :telefono,
        COD_REGION          = :cod_region
      WHERE COD_PROVEEDOR = :id
    `,
      { nombre, direccion, telefono, cod_region, id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Proveedor actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/proveedores/:id
async function eliminarProveedor(req, res) {
  const id = Number(req.params.id);
  let conn;

  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_PROVEEDOR WHERE COD_PROVEEDOR = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Proveedor eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
};
