const { getConnection } = require("../db");

// GET /api/comunas
async function listarComunas(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT COD_COMUNA, COMUNA, COD_CIUDAD
      FROM JRGY_COMUNA
      ORDER BY COD_COMUNA
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/comunas/:id
async function obtenerComuna(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT COD_COMUNA, COMUNA, COD_CIUDAD FROM JRGY_COMUNA WHERE COD_COMUNA = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Comuna no encontrada" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/comunas
async function crearComuna(req, res) {
  const { cod_comuna, comuna, cod_ciudad } = req.body;
  let conn;
  try {
    if (cod_comuna == null) {
      return res.status(400).json({ ok: false, message: "cod_comuna es requerido" });
    }

    conn = await getConnection();
    await conn.execute(
      `
      INSERT INTO JRGY_COMUNA (COD_COMUNA, COMUNA, COD_CIUDAD)
      VALUES (:cod_comuna, :comuna, :cod_ciudad)
    `,
      { cod_comuna, comuna, cod_ciudad },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Comuna creada", id: cod_comuna });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/comunas/:id
async function actualizarComuna(req, res) {
  const id = Number(req.params.id);
  const { comuna, cod_ciudad } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      UPDATE JRGY_COMUNA
      SET COMUNA = :comuna,
          COD_CIUDAD = :cod_ciudad
      WHERE COD_COMUNA = :id
    `,
      { comuna, cod_ciudad, id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Comuna actualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/comunas/:id
async function eliminarComuna(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_COMUNA WHERE COD_COMUNA = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Comuna eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarComunas,
  obtenerComuna,
  crearComuna,
  actualizarComuna,
  eliminarComuna
};
