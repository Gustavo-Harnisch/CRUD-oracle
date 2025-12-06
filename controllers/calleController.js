const { getConnection } = require("../db");

// GET /api/calles
async function listarCalles(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT COD_CALLE, CALLE, NRO, COD_COMUNA
      FROM JRGY_CALLE
      ORDER BY COD_CALLE
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/calles/:id
async function obtenerCalle(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT COD_CALLE, CALLE, NRO, COD_COMUNA FROM JRGY_CALLE WHERE COD_CALLE = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Calle no encontrada" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/calles
async function crearCalle(req, res) {
  const { cod_calle, calle, nro, cod_comuna } = req.body;
  let conn;
  try {
    if (cod_calle == null) {
      return res.status(400).json({ ok: false, message: "cod_calle es requerido" });
    }

    conn = await getConnection();
    await conn.execute(
      `
      INSERT INTO JRGY_CALLE (COD_CALLE, CALLE, NRO, COD_COMUNA)
      VALUES (:cod_calle, :calle, :nro, :cod_comuna)
    `,
      { cod_calle, calle, nro, cod_comuna },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Calle creada", id: cod_calle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/calles/:id
async function actualizarCalle(req, res) {
  const id = Number(req.params.id);
  const { calle, nro, cod_comuna } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      UPDATE JRGY_CALLE
      SET CALLE = :calle,
          NRO = :nro,
          COD_COMUNA = :cod_comuna
      WHERE COD_CALLE = :id
    `,
      { calle, nro, cod_comuna, id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Calle actualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/calles/:id
async function eliminarCalle(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_CALLE WHERE COD_CALLE = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Calle eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarCalles,
  obtenerCalle,
  crearCalle,
  actualizarCalle,
  eliminarCalle
};
