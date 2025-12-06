const { getConnection } = require("../db");

// GET /api/regiones
async function listarRegiones(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT COD_REGION, REGION
      FROM JRGY_REGION
      ORDER BY COD_REGION
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/regiones/:id
async function obtenerRegion(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT COD_REGION, REGION FROM JRGY_REGION WHERE COD_REGION = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Region no encontrada" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/regiones
async function crearRegion(req, res) {
  const { cod_region, region } = req.body;
  let conn;
  try {
    if (cod_region == null) {
      return res.status(400).json({ ok: false, message: "cod_region es requerido" });
    }

    conn = await getConnection();
    await conn.execute(
      `
      INSERT INTO JRGY_REGION (COD_REGION, REGION)
      VALUES (:cod_region, :region)
    `,
      { cod_region, region },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Region creada", id: cod_region });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/regiones/:id
async function actualizarRegion(req, res) {
  const id = Number(req.params.id);
  const { region } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      UPDATE JRGY_REGION
      SET REGION = :region
      WHERE COD_REGION = :id
    `,
      { region, id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Region actualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/regiones/:id
async function eliminarRegion(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_REGION WHERE COD_REGION = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Region eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarRegiones,
  obtenerRegion,
  crearRegion,
  actualizarRegion,
  eliminarRegion
};
