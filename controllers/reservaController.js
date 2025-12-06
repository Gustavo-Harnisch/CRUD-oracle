const { getConnection, oracledb } = require("../db");

// GET /api/reservas
async function listarReservas(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT 
        ph.COD_PAGO_HABITACION,
        ph.FECHA_PAGO,
        ph.VALOR_TOTAL_PAGO,
        ph.COD_USUARIO,
        ph.ESTADO AS ESTADO_PAGO,
        dph.COD_HABITACION,
        dph.FECHA_ESTADIA,
        dph.DIAS,
        dph.PRECIO_HABITACION,
        h.NRO_HABITACION,
        u.EMAIL_USUARIO
      FROM JRGY_PAGO_HABITACION ph
      LEFT JOIN JRGY_DETALLE_PAGO_HABITACION dph ON dph.COD_PAGO_HABITACION = ph.COD_PAGO_HABITACION
      LEFT JOIN JRGY_HABITACION h ON h.COD_HABITACION = dph.COD_HABITACION
      LEFT JOIN JRGY_USUARIO u ON u.COD_USUARIO = ph.COD_USUARIO
      ORDER BY ph.COD_PAGO_HABITACION DESC
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/reservas/:id
async function obtenerReserva(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM JRGY_PAGO_HABITACION WHERE COD_PAGO_HABITACION = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Reserva no encontrada" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/reservas
async function crearReserva(req, res) {
  const { cod_habitacion, fecha_estadia, fecha_salida, cod_usuario } = req.body;

  if (!cod_habitacion || !fecha_estadia || !fecha_salida || !cod_usuario) {
    return res.status(400).json({ ok: false, message: "Faltan datos de la reserva" });
  }

  const inicio = new Date(fecha_estadia);
  const fin = new Date(fecha_salida);
  const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
  if (isNaN(dias) || dias <= 0) {
    return res.status(400).json({ ok: false, message: "Rango de fechas inválido" });
  }

  let conn;
  try {
    conn = await getConnection();
    await conn.execute("BEGIN NULL; END;"); // ensure connection open
    // Traer habitación y validar disponibilidad
    const habRes = await conn.execute(
      `SELECT COD_HABITACION, ESTADO, PRECIO_HABITACION FROM JRGY_HABITACION WHERE COD_HABITACION = :id`,
      { id: cod_habitacion }
    );
    if (habRes.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Habitación no encontrada" });
    }
    const habitacion = habRes.rows[0];
    if (habitacion.ESTADO !== "LIBRE") {
      return res.status(409).json({ ok: false, message: "Habitación no disponible" });
    }

    const total = (habitacion.PRECIO_HABITACION || 0) * dias;

    // Crear pago/reserva en estado PENDIENTE y detalle
    const pagoResult = await conn.execute(
      `
        INSERT INTO JRGY_PAGO_HABITACION
          (COD_PAGO_HABITACION, FECHA_PAGO, VALOR_TOTAL_PAGO, COD_USUARIO, ESTADO)
        VALUES
          (SQ_PK_PAGO_HAB.NEXTVAL, SYSDATE, 0, :usuario, 'PENDIENTE')
        RETURNING COD_PAGO_HABITACION INTO :nuevo_id
      `,
      {
        usuario: cod_usuario,
        nuevo_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: false }
    );

    const nuevoPagoId = pagoResult.outBinds.nuevo_id[0];

    await conn.execute(
      `
        INSERT INTO JRGY_DETALLE_PAGO_HABITACION
          (COD_PAGO_HABITACION, COD_HABITACION, FECHA_ESTADIA, PRECIO_HABITACION, DIAS)
        VALUES
          (:pago, :hab, :inicio, :precio, :dias)
      `,
      {
        pago: nuevoPagoId,
        hab: habitacion.COD_HABITACION,
        inicio: inicio,
        precio: habitacion.PRECIO_HABITACION,
        dias
      },
      { autoCommit: false }
    );

    // Marcar habitación como RESERVADA mientras se paga
    await conn.execute(
      `UPDATE JRGY_HABITACION SET ESTADO = 'RESERVADA', FECHA_DESOCUPACION = :fin WHERE COD_HABITACION = :hab`,
      { fin, hab: habitacion.COD_HABITACION },
      { autoCommit: false }
    );

    await conn.commit();

    res.status(201).json({
      ok: true,
      message: "Reserva creada (pendiente de pago)",
      pago: nuevoPagoId,
      total,
      dias
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    res.status(500).json({ ok: false, message: "Error al crear reserva", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/reservas/:id/pagar
async function pagarReserva(req, res) {
  const id = Number(req.params.id);
  const { modo_pago = "EFECTIVO" } = req.body;

  let conn;
  try {
    conn = await getConnection();
    await conn.execute("BEGIN NULL; END;");

    // Buscar pago y detalle
    const pagoRes = await conn.execute(
      `
      SELECT PH.COD_PAGO_HABITACION,
             PH.ESTADO,
             DPH.COD_HABITACION
      FROM JRGY_PAGO_HABITACION PH
      JOIN JRGY_DETALLE_PAGO_HABITACION DPH ON DPH.COD_PAGO_HABITACION = PH.COD_PAGO_HABITACION
      WHERE PH.COD_PAGO_HABITACION = :id
      `,
      { id }
    );

    if (pagoRes.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Reserva no encontrada" });
    }

    const pago = pagoRes.rows[0];
    if (pago.ESTADO === "PAGADO") {
      return res.status(409).json({ ok: false, message: "La reserva ya está pagada" });
    }

    await conn.execute(
      `
        UPDATE JRGY_PAGO_HABITACION
        SET ESTADO = 'PAGADO', FECHA_PAGO = SYSDATE, MODO_PAGO = :modo
        WHERE COD_PAGO_HABITACION = :id
      `,
      { modo: modo_pago, id },
      { autoCommit: false }
    );

    await conn.execute(
      `UPDATE JRGY_HABITACION SET ESTADO = 'OCUPADA' WHERE COD_HABITACION = :hab`,
      { hab: pago.COD_HABITACION },
      { autoCommit: false }
    );

    await conn.commit();

    res.json({ ok: true, message: "Pago confirmado", reserva: id });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    res.status(500).json({ ok: false, message: "Error al confirmar pago", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PATCH /api/reservas/:id/fechas
async function actualizarFechas(req, res) {
  const id = Number(req.params.id);
  const { fecha_estadia, fecha_salida } = req.body;

  const inicio = new Date(fecha_estadia);
  const fin = new Date(fecha_salida);
  const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
  if (isNaN(dias) || dias <= 0) {
    return res.status(400).json({ ok: false, message: "Rango de fechas inválido" });
  }

  let conn;
  try {
    conn = await getConnection();
    await conn.execute("BEGIN NULL; END;");

    await conn.execute(
      `
      UPDATE JRGY_DETALLE_PAGO_HABITACION
      SET FECHA_ESTADIA = :inicio, DIAS = :dias
      WHERE COD_PAGO_HABITACION = :id
      `,
      { inicio, dias, id },
      { autoCommit: false }
    );

    await conn.execute(
      `
      UPDATE JRGY_HABITACION
      SET FECHA_DESOCUPACION = :fin
      WHERE COD_HABITACION = (
        SELECT COD_HABITACION
        FROM JRGY_DETALLE_PAGO_HABITACION
        WHERE COD_PAGO_HABITACION = :id
        FETCH FIRST 1 ROWS ONLY
      )
      `,
      { fin, id },
      { autoCommit: false }
    );

    await conn.commit();
    res.json({ ok: true, message: "Fechas de reserva actualizadas", dias });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    res
      .status(500)
      .json({ ok: false, message: "Error al actualizar fechas de reserva", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/reservas/:id
async function actualizarReserva(req, res) {
  const id = Number(req.params.id);
  const { fecha_pago, cod_usuario } = req.body;

  let conn;
  try {
    conn = await getConnection();

    await conn.execute(
      `
      UPDATE JRGY_PAGO_HABITACION
      SET
        FECHA_PAGO       = :fecha_pago,
        COD_USUARIO      = :cod_usuario
      WHERE COD_PAGO_HABITACION = :id
    `,
      { fecha_pago, cod_usuario, id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Reserva actualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/reservas/:id
async function eliminarReserva(req, res) {
  const id = Number(req.params.id);
  let conn;

  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_PAGO_HABITACION WHERE COD_PAGO_HABITACION = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Reserva eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarReservas,
  obtenerReserva,
  crearReserva,
  pagarReserva,
  actualizarFechas,
  actualizarReserva,
  eliminarReserva
};
