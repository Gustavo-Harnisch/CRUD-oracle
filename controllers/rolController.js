const { getConnection, oracledb } = require("../db");

// GET /api/roles
async function listarRoles(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT COD_ROL, NOMBRE_ROL
      FROM JRGY_ROL
      ORDER BY COD_ROL
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/roles/:id
async function obtenerRol(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT COD_ROL, NOMBRE_ROL FROM JRGY_ROL WHERE COD_ROL = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Rol no encontrado" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/roles
async function crearRol(req, res) {
  const { nombre } = req.body;
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `
      INSERT INTO JRGY_ROL (COD_ROL, NOMBRE_ROL)
      VALUES (NULL, :nombre)
      RETURNING COD_ROL INTO :nuevo_id
    `,
      {
        nombre,
        nuevo_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const id = result.outBinds.nuevo_id[0];
    res.json({ ok: true, message: "Rol creado", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/roles/:id
async function actualizarRol(req, res) {
  const id = Number(req.params.id);
  const { nombre } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      UPDATE JRGY_ROL
      SET NOMBRE_ROL = :nombre
      WHERE COD_ROL = :id
    `,
      { nombre, id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Rol actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/roles/:id
async function eliminarRol(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_ROL WHERE COD_ROL = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Rol eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarRoles,
  obtenerRol,
  crearRol,
  actualizarRol,
  eliminarRol
};
