const { getConnection } = require("../db");

// GET /api/usuario-roles
async function listarUsuarioRoles(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT COD_USUARIO, COD_ROL
      FROM JRGY_USUARIO_ROL
      ORDER BY COD_USUARIO, COD_ROL
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/usuario-roles/:usuarioId/:rolId
async function obtenerUsuarioRol(req, res) {
  const usuarioId = Number(req.params.usuarioId);
  const rolId = Number(req.params.rolId);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `
      SELECT COD_USUARIO, COD_ROL
      FROM JRGY_USUARIO_ROL
      WHERE COD_USUARIO = :usuarioId AND COD_ROL = :rolId
    `,
      { usuarioId, rolId }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Relacion usuario-rol no encontrada" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/usuario-roles
async function crearUsuarioRol(req, res) {
  const { cod_usuario, cod_rol } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      INSERT INTO JRGY_USUARIO_ROL (COD_USUARIO, COD_ROL)
      VALUES (:cod_usuario, :cod_rol)
    `,
      { cod_usuario, cod_rol },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Relacion usuario-rol creada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/usuario-roles/:usuarioId/:rolId
async function eliminarUsuarioRol(req, res) {
  const usuarioId = Number(req.params.usuarioId);
  const rolId = Number(req.params.rolId);
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      DELETE FROM JRGY_USUARIO_ROL
      WHERE COD_USUARIO = :usuarioId AND COD_ROL = :rolId
    `,
      { usuarioId, rolId },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Relacion usuario-rol eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarUsuarioRoles,
  obtenerUsuarioRol,
  crearUsuarioRol,
  eliminarUsuarioRol
};
