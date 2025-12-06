const { getConnection } = require("../db");
const { verifyToken } = require("../middleware/auth");

// GET /api/habitaciones
async function listarHabitaciones(req, res) {
  // Si viene token válido, puede ver todas; si no, solo las disponibles.
  // Antes de responder, liberar habitaciones cuya fecha_desocupacion ya pasó.
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = verifyToken(token);
  const esAutenticado = Boolean(payload && payload.sub);

  let conn;
  try {
    conn = await getConnection();

    // Liberar vencidas
    await conn.execute(
      `
      UPDATE JRGY_HABITACION
      SET ESTADO = 'LIBRE', FECHA_DESOCUPACION = NULL
      WHERE ESTADO IN ('RESERVADA','OCUPADA')
        AND FECHA_DESOCUPACION IS NOT NULL
        AND FECHA_DESOCUPACION <= SYSDATE
    `,
      [],
      { autoCommit: true }
    );

    const sql = `
      SELECT 
        COD_HABITACION,
        NRO_HABITACION,
        NRO_PERSONAS,
        FECHA_DESOCUPACION,
        ESTADO,
        PRECIO_HABITACION
      FROM JRGY_HABITACION
      ${esAutenticado ? "" : "WHERE ESTADO = 'LIBRE'"}
      ORDER BY COD_HABITACION
    `;
    const result = await conn.execute(sql);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/habitaciones/:id
async function obtenerHabitacion(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM JRGY_HABITACION WHERE COD_HABITACION = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Habitación no encontrada" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/habitaciones
async function crearHabitacion(req, res) {
  const {
    cod_habitacion,
    nro_habitacion,
    nro_personas,
    fecha_desocupacion,
    estado,
    precio_habitacion
  } = req.body;

  let conn;
  try {
    conn = await getConnection();

    await conn.execute(
      `
      INSERT INTO JRGY_HABITACION
      (COD_HABITACION, NRO_HABITACION, NRO_PERSONAS, FECHA_DESOCUPACION, ESTADO, PRECIO_HABITACION)
      VALUES
      (:cod_habitacion, :nro_habitacion, :nro_personas, :fecha_desocupacion, :estado, :precio_habitacion)
    `,
      {
        cod_habitacion,
        nro_habitacion,
        nro_personas,
        fecha_desocupacion,
        estado,
        precio_habitacion
      },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Habitación creada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/habitaciones/:id
async function actualizarHabitacion(req, res) {
  const id = Number(req.params.id);
  const {
    nro_habitacion,
    nro_personas,
    fecha_desocupacion,
    estado,
    precio_habitacion
  } = req.body;

  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      UPDATE JRGY_HABITACION
      SET
        NRO_HABITACION      = :nro_habitacion,
        NRO_PERSONAS        = :nro_personas,
        FECHA_DESOCUPACION  = :fecha_desocupacion,
        ESTADO              = :estado,
        PRECIO_HABITACION   = :precio_habitacion
      WHERE COD_HABITACION = :id
    `,
      {
        nro_habitacion,
        nro_personas,
        fecha_desocupacion,
        estado,
        precio_habitacion,
        id
      },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Habitación actualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/habitaciones/:id
async function eliminarHabitacion(req, res) {
  const id = Number(req.params.id);
  let conn;

  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_HABITACION WHERE COD_HABITACION = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Habitación eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/habitaciones/admin/ocupacion/todas
async function listarOcupacion(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `
      SELECT 
        h.COD_HABITACION,
        h.NRO_HABITACION,
        h.ESTADO,
        h.FECHA_DESOCUPACION,
        ph.COD_PAGO_HABITACION,
        ph.ESTADO AS ESTADO_PAGO,
        ph.VALOR_TOTAL_PAGO,
        ph.FECHA_PAGO,
        u.COD_USUARIO,
        u.NOMBRE_USUARIO,
        u.EMAIL_USUARIO
      FROM JRGY_HABITACION h
      LEFT JOIN JRGY_DETALLE_PAGO_HABITACION dph ON dph.COD_HABITACION = h.COD_HABITACION
      LEFT JOIN JRGY_PAGO_HABITACION ph ON ph.COD_PAGO_HABITACION = dph.COD_PAGO_HABITACION
      LEFT JOIN JRGY_USUARIO u ON u.COD_USUARIO = ph.COD_USUARIO
      ORDER BY h.COD_HABITACION
      `
    );
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PATCH /api/habitaciones/:id/liberar
async function liberarHabitacion(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      UPDATE JRGY_HABITACION
      SET ESTADO = 'LIBRE', FECHA_DESOCUPACION = NULL
      WHERE COD_HABITACION = :id
      `,
      { id },
      { autoCommit: true }
    );
    res.json({ ok: true, message: "Habitación liberada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarHabitaciones,
  obtenerHabitacion,
  crearHabitacion,
  actualizarHabitacion,
  eliminarHabitacion,
  listarOcupacion,
  liberarHabitacion
};
