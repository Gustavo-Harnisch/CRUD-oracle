const { getConnection } = require("../db");

// GET /api/ciudades
async function listarCiudades(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT COD_CIUDAD, CIUDAD, COD_REGION
      FROM JRGY_CIUDAD
      ORDER BY COD_CIUDAD
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/ciudades/:id
async function obtenerCiudad(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT COD_CIUDAD, CIUDAD, COD_REGION FROM JRGY_CIUDAD WHERE COD_CIUDAD = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Ciudad no encontrada" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/ciudades
async function crearCiudad(req, res) {
  const { cod_ciudad, ciudad, cod_region } = req.body;
  let conn;
  try {
    if (cod_ciudad == null) {
      return res.status(400).json({ ok: false, message: "cod_ciudad es requerido" });
    }

    conn = await getConnection();
    await conn.execute(
      `
      INSERT INTO JRGY_CIUDAD (COD_CIUDAD, CIUDAD, COD_REGION)
      VALUES (:cod_ciudad, :ciudad, :cod_region)
    `,
      { cod_ciudad, ciudad, cod_region },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Ciudad creada", id: cod_ciudad });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/ciudades/:id
async function actualizarCiudad(req, res) {
  const id = Number(req.params.id);
  const { ciudad, cod_region } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      UPDATE JRGY_CIUDAD
      SET CIUDAD = :ciudad,
          COD_REGION = :cod_region
      WHERE COD_CIUDAD = :id
    `,
      { ciudad, cod_region, id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Ciudad actualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/ciudades/:id
async function eliminarCiudad(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_CIUDAD WHERE COD_CIUDAD = :id`,
      { id },
      { autoCommit: true }
    );
    res.json({ ok: true, message: "Ciudad eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarCiudades,
  obtenerCiudad,
  crearCiudad,
  actualizarCiudad,
  eliminarCiudad
};
