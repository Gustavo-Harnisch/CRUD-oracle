const { getConnection } = require("../db");

// GET /api/usuarios
async function listarUsuarios(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT 
        COD_USUARIO,
        NOMBRE_USUARIO,
        APELLIDO1_USUARIO,
        APELLIDO2_USUARIO,
        EMAIL_USUARIO,
        TELEFONO_USUARIO
      FROM JRGY_USUARIO
      ORDER BY COD_USUARIO
    `);
    await conn.close();

    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

// GET /api/usuarios/:id
async function obtenerUsuario(req, res) {
  const id = Number(req.params.id);
  let conn;

  try {
    conn = await getConnection();
    const result = await conn.execute(
      `
      SELECT *
      FROM JRGY_USUARIO
      WHERE COD_USUARIO = :id
    `,
      { id }
    );
    await conn.close();

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

// POST /api/usuarios
async function crearUsuario(req, res) {
  const {
    nombre,
    apellido1,
    apellido2,
    email,
    telefono,
    contrasena
  } = req.body;

  let conn;
  try {
    conn = await getConnection();

    const sql = `
      INSERT INTO JRGY_USUARIO
        (COD_USUARIO, NOMBRE_USUARIO, APELLIDO1_USUARIO, APELLIDO2_USUARIO,
         EMAIL_USUARIO, TELEFONO_USUARIO, CONTRASENA_USUARIO)
      VALUES
        (SQ_PK_USUARIO.NEXTVAL, :nombre, :apellido1, :apellido2,
         :email, :telefono, :contrasena)
      RETURNING COD_USUARIO INTO :nuevo_id
    `;

    const result = await conn.execute(
      sql,
      {
        nombre,
        apellido1,
        apellido2,
        email,
        telefono,
        contrasena,
        nuevo_id: { dir: require("../db").oracledb.BIND_OUT, type: require("../db").oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const nuevoId = result.outBinds.nuevo_id[0];

    res.json({ ok: true, message: "Usuario creado", id: nuevoId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/usuarios/:id
async function actualizarUsuario(req, res) {
  const id = Number(req.params.id);
  const {
    nombre,
    apellido1,
    apellido2,
    email,
    telefono,
    contrasena
  } = req.body;

  let conn;
  try {
    conn = await getConnection();

    await conn.execute(
      `
      UPDATE JRGY_USUARIO
      SET 
        NOMBRE_USUARIO     = :nombre,
        APELLIDO1_USUARIO  = :apellido1,
        APELLIDO2_USUARIO  = :apellido2,
        EMAIL_USUARIO      = :email,
        TELEFONO_USUARIO   = :telefono,
        CONTRASENA_USUARIO = :contrasena
      WHERE COD_USUARIO = :id
    `,
      { nombre, apellido1, apellido2, email, telefono, contrasena, id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Usuario actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/usuarios/:id
async function eliminarUsuario(req, res) {
  const id = Number(req.params.id);
  let conn;

  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_USUARIO WHERE COD_USUARIO = :id`,
      { id },
      { autoCommit: true }
    );
    await conn.close();

    res.json({ ok: true, message: "Usuario eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};
