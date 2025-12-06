const { getConnection, oracledb } = require("../db");
const { signToken } = require("../middleware/auth");

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ ok: false, message: "Faltan email o contraseña" });
  }

  let conn;
  try {
    conn = await getConnection();

    const sql = `
      BEGIN
        JRGY_PRO_LOGIN(:EMAIL_P, :CONTRASENA_P, :CUR_LOGIN);
      END;
    `;

    const result = await conn.execute(sql, {
      EMAIL_P: email,
      CONTRASENA_P: password,
      CUR_LOGIN: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
    });

    const cursor = result.outBinds.CUR_LOGIN;
    const rows = await cursor.getRows();
    await cursor.close();

    if (!rows || rows.length === 0) {
      return res.status(401).json({ ok: false, message: "Credenciales inválidas" });
    }

    const user = rows[0];
    const token = signToken({
      sub: user.COD_USUARIO,
      email: user.EMAIL_USUARIO,
      rol: user.COD_ROL || null
    });

    return res.json({
      ok: true,
      user,
      token
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, message: "Error en login", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/auth/register
async function register(req, res) {
  const {
    nombre,
    apellido1 = null,
    apellido2 = null,
    email,
    telefono = null,
    contrasena,
    codRol = null
  } = req.body;

  if (!nombre || !email || !contrasena) {
    return res
      .status(400)
      .json({ ok: false, message: "Faltan nombre, email o contraseña" });
  }

  let conn;
  try {
    conn = await getConnection();

    // Validar email único
    const existing = await conn.execute(
      `SELECT COD_USUARIO FROM JRGY_USUARIO WHERE EMAIL_USUARIO = :email`,
      { email }
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ ok: false, message: "Email ya registrado" });
    }

    const result = await conn.execute(
      `
        INSERT INTO JRGY_USUARIO
          (COD_USUARIO, NOMBRE_USUARIO, APELLIDO1_USUARIO, APELLIDO2_USUARIO,
           EMAIL_USUARIO, TELEFONO_USUARIO, CONTRASENA_USUARIO)
        VALUES
          (SQ_PK_USUARIO.NEXTVAL, :nombre, :apellido1, :apellido2,
           :email, :telefono, :contrasena)
        RETURNING COD_USUARIO INTO :nuevo_id
      `,
      {
        nombre,
        apellido1,
        apellido2,
        email,
        telefono,
        contrasena,
        nuevo_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: false }
    );

    const nuevoId = result.outBinds.nuevo_id[0];

    if (codRol) {
      await conn.execute(
        `
          INSERT INTO JRGY_USUARIO_ROL (COD_USUARIO, COD_ROL)
          VALUES (:usuarioId, :rolId)
        `,
        { usuarioId: nuevoId, rolId: codRol }
      );
    }

    await conn.commit();

    const token = signToken({
      sub: nuevoId,
      email,
      rol: codRol || null
    });

    return res.status(201).json({
      ok: true,
      user: {
        COD_USUARIO: nuevoId,
        NOMBRE_USUARIO: nombre,
        APELLIDO1_USUARIO: apellido1,
        APELLIDO2_USUARIO: apellido2,
        EMAIL_USUARIO: email,
        TELEFONO_USUARIO: telefono,
        COD_ROL: codRol || null
      },
      token
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, message: "Error al registrar", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  login,
  register
};
