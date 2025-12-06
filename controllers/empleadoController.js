const { getConnection, oracledb } = require("../db");

// GET /api/empleados
async function listarEmpleados(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT 
        COD_EMPLEADO,
        CARGO_EMPLEADO,
        FECHA_CONTRATACION,
        SALARIO,
        COMISION,
        COD_USUARIO
      FROM JRGY_EMPLEADO
      ORDER BY COD_EMPLEADO
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/empleados/:id
async function obtenerEmpleado(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM JRGY_EMPLEADO WHERE COD_EMPLEADO = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Empleado no encontrado" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/empleados
async function crearEmpleado(req, res) {
  const {
    cargo,
    fecha_contratacion,
    salario,
    comision,
    cod_usuario,
    // datos opcionales para crear usuario si no existe
    nombre_usuario,
    apellido1_usuario,
    apellido2_usuario,
    email_usuario,
    telefono_usuario,
    contrasena_usuario
  } = req.body;

  if (!cargo || !fecha_contratacion || !salario) {
    return res.status(400).json({ ok: false, message: "Faltan cargo, fecha o salario" });
  }

  let conn;
  try {
    conn = await getConnection();
    await conn.execute("BEGIN NULL; END;"); // abre conexión

    let usuarioId = cod_usuario;

    if (usuarioId) {
      // Verificar que exista el usuario; si no existe y hay datos, crearlo
      const userCheck = await conn.execute(
        `SELECT COD_USUARIO FROM JRGY_USUARIO WHERE COD_USUARIO = :id`,
        { id: usuarioId }
      );
      if (userCheck.rows.length === 0) {
        if (!nombre_usuario || !email_usuario || !contrasena_usuario) {
          return res
            .status(404)
            .json({ ok: false, message: "El usuario indicado no existe y faltan datos para crearlo" });
        }
        const userResult = await conn.execute(
          `
          INSERT INTO JRGY_USUARIO
            (COD_USUARIO, NOMBRE_USUARIO, APELLIDO1_USUARIO, APELLIDO2_USUARIO,
             EMAIL_USUARIO, TELEFONO_USUARIO, CONTRASENA_USUARIO)
          VALUES
            (SQ_PK_USUARIO.NEXTVAL, :nombre, :ap1, :ap2, :email, :tel, :pass)
          RETURNING COD_USUARIO INTO :nuevo_id
          `,
          {
            nombre: nombre_usuario,
            ap1: apellido1_usuario || null,
            ap2: apellido2_usuario || null,
            email: email_usuario,
            tel: telefono_usuario || null,
            pass: contrasena_usuario,
            nuevo_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          },
          { autoCommit: false }
        );
        usuarioId = userResult.outBinds.nuevo_id[0];
      }
    } else {
      // Crear usuario si no se pasa cod_usuario
      if (!nombre_usuario || !email_usuario || !contrasena_usuario) {
        return res
          .status(400)
          .json({ ok: false, message: "Faltan datos para crear el usuario del empleado" });
      }

      const userResult = await conn.execute(
        `
        INSERT INTO JRGY_USUARIO
          (COD_USUARIO, NOMBRE_USUARIO, APELLIDO1_USUARIO, APELLIDO2_USUARIO,
           EMAIL_USUARIO, TELEFONO_USUARIO, CONTRASENA_USUARIO)
        VALUES
          (SQ_PK_USUARIO.NEXTVAL, :nombre, :ap1, :ap2, :email, :tel, :pass)
        RETURNING COD_USUARIO INTO :nuevo_id
        `,
        {
          nombre: nombre_usuario,
          ap1: apellido1_usuario || null,
          ap2: apellido2_usuario || null,
          email: email_usuario,
          tel: telefono_usuario || null,
          pass: contrasena_usuario,
          nuevo_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: false }
      );
      usuarioId = userResult.outBinds.nuevo_id[0];
    }

    const empResult = await conn.execute(
      `
      INSERT INTO JRGY_EMPLEADO
        (CARGO_EMPLEADO, FECHA_CONTRATACION, SALARIO, COMISION, COD_USUARIO)
      VALUES
        (:cargo, TO_DATE(:fecha_contratacion, 'YYYY-MM-DD'), :salario, :comision, :cod_usuario)
      RETURNING COD_EMPLEADO INTO :nuevo_id
    `,
      {
        cargo,
        fecha_contratacion,
        salario,
        comision,
        cod_usuario: usuarioId,
        nuevo_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: false }
    );

    const nuevoId = empResult.outBinds.nuevo_id[0];
    await conn.commit();

    res.json({ ok: true, message: "Empleado creado", id: nuevoId, cod_usuario: usuarioId });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    if (err.errorNum === 1) {
      return res.status(409).json({ ok: false, message: "Correo ya registrado" });
    }
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/empleados/:id
async function actualizarEmpleado(req, res) {
  const id = Number(req.params.id);
  const { cargo, fecha_contratacion, salario, comision, cod_usuario } = req.body;

  let conn;
  try {
    conn = await getConnection();

    await conn.execute(
      `
      UPDATE JRGY_EMPLEADO
      SET
        CARGO_EMPLEADO     = :cargo,
        FECHA_CONTRATACION = TO_DATE(:fecha_contratacion, 'YYYY-MM-DD'),
        SALARIO            = :salario,
        COMISION           = :comision,
        COD_USUARIO        = :cod_usuario
      WHERE COD_EMPLEADO = :id
    `,
      { cargo, fecha_contratacion, salario, comision, cod_usuario, id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Empleado actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/empleados/:id
async function eliminarEmpleado(req, res) {
  const id = Number(req.params.id);
  let conn;

  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_EMPLEADO WHERE COD_EMPLEADO = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Empleado eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarEmpleados,
  obtenerEmpleado,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado
};
