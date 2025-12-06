const { getConnection } = require("../db");

// GET /api/detalle-pago-habitacion
async function listarDetalles(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT COD_PAGO_HABITACION, COD_HABITACION, FECHA_ESTADIA, PRECIO_HABITACION, DIAS
      FROM JRGY_DETALLE_PAGO_HABITACION
      ORDER BY COD_PAGO_HABITACION, COD_HABITACION
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/detalle-pago-habitacion/:pagoId/:habId
async function obtenerDetalle(req, res) {
  const pagoId = Number(req.params.pagoId);
  const habId = Number(req.params.habId);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `
      SELECT COD_PAGO_HABITACION, COD_HABITACION, FECHA_ESTADIA, PRECIO_HABITACION, DIAS
      FROM JRGY_DETALLE_PAGO_HABITACION
      WHERE COD_PAGO_HABITACION = :pagoId AND COD_HABITACION = :habId
    `,
      { pagoId, habId }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Detalle no encontrado" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/detalle-pago-habitacion
async function crearDetalle(req, res) {
  const { cod_pago_habitacion, cod_habitacion, fecha_estadia, precio_habitacion, dias } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      INSERT INTO JRGY_DETALLE_PAGO_HABITACION
        (COD_PAGO_HABITACION, COD_HABITACION, FECHA_ESTADIA, PRECIO_HABITACION, DIAS)
      VALUES
        (:cod_pago_habitacion, :cod_habitacion, :fecha_estadia, :precio_habitacion, :dias)
    `,
      { cod_pago_habitacion, cod_habitacion, fecha_estadia, precio_habitacion, dias },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Detalle creado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/detalle-pago-habitacion/:pagoId/:habId
async function actualizarDetalle(req, res) {
  const pagoId = Number(req.params.pagoId);
  const habId = Number(req.params.habId);
  const { fecha_estadia, precio_habitacion, dias } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      UPDATE JRGY_DETALLE_PAGO_HABITACION
      SET FECHA_ESTADIA = :fecha_estadia,
          PRECIO_HABITACION = :precio_habitacion,
          DIAS = :dias
      WHERE COD_PAGO_HABITACION = :pagoId AND COD_HABITACION = :habId
    `,
      { fecha_estadia, precio_habitacion, dias, pagoId, habId },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Detalle actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/detalle-pago-habitacion/:pagoId/:habId
async function eliminarDetalle(req, res) {
  const pagoId = Number(req.params.pagoId);
  const habId = Number(req.params.habId);
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `
      DELETE FROM JRGY_DETALLE_PAGO_HABITACION
      WHERE COD_PAGO_HABITACION = :pagoId AND COD_HABITACION = :habId
    `,
      { pagoId, habId },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Detalle eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarDetalles,
  obtenerDetalle,
  crearDetalle,
  actualizarDetalle,
  eliminarDetalle
};
