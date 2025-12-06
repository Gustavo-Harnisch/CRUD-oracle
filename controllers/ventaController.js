const { getConnection, oracledb } = require("../db");

// GET /api/ventas
async function listarVentas(req, res) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(`
      SELECT 
        COD_VENTA,
        COD_USUARIO,
        NOMBRE_USUARIO,
        COD_EMPLEADO,
        FECHA_VENTA,
        VALOR_TOTAL
      FROM VW_VENTAS
      ORDER BY COD_VENTA
    `);
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// GET /api/ventas/:id
async function obtenerVenta(req, res) {
  const id = Number(req.params.id);
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM VW_VENTAS WHERE COD_VENTA = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Venta no encontrada" });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/ventas
async function crearVenta(req, res) {
  const { cod_usuario, cod_empleado } = req.body;

  let conn;
  try {
    conn = await getConnection();

    const sql = `
      INSERT INTO JRGY_VENTA
        (COD_USUARIO, COD_EMPLEADO, FECHA_VENTA)
      VALUES
        (:cod_usuario, :cod_empleado, SYSDATE)
      RETURNING COD_VENTA INTO :nuevo_id
    `;

    const result = await conn.execute(
      sql,
      {
        cod_usuario,
        cod_empleado,
        nuevo_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const nuevoId = result.outBinds.nuevo_id[0];

    res.json({ ok: true, message: "Venta creada", id: nuevoId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// POST /api/ventas/comprar (usuario autenticado con reserva pagada)
async function crearVentaUsuario(req, res) {
  const userId = req.user?.sub;
  const detalles = req.body?.detalles || [];
  const cod_empleado = req.body?.cod_empleado ?? null;

  if (!userId) {
    return res.status(401).json({ ok: false, message: "No autorizado" });
  }
  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ ok: false, message: "Debe enviar al menos un producto" });
  }

  let conn;
  try {
    conn = await getConnection();

    // Verificar reserva pagada
    const reservaRes = await conn.execute(
      `SELECT COUNT(*) AS CNT FROM JRGY_PAGO_HABITACION WHERE COD_USUARIO = :id AND ESTADO = 'PAGADO'`,
      { id: userId }
    );
    const tieneReserva = reservaRes.rows?.[0]?.CNT > 0;
    if (!tieneReserva) {
      return res.status(403).json({ ok: false, message: "Necesita una reserva pagada para comprar" });
    }

    // Crear venta
    const ventaRes = await conn.execute(
      `
      INSERT INTO JRGY_VENTA (COD_USUARIO, COD_EMPLEADO, FECHA_VENTA)
      VALUES (:cod_usuario, :cod_empleado, SYSDATE)
      RETURNING COD_VENTA INTO :nuevo_id
    `,
      {
        cod_usuario: userId,
        cod_empleado,
        nuevo_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: false }
    );
    const ventaId = ventaRes.outBinds.nuevo_id[0];

    // Insertar detalles (precio_total lo calcula trigger)
    for (const det of detalles) {
      const { cod_producto, cantidad, precio_producto = null } = det || {};
      await conn.execute(
        `
        INSERT INTO JRGY_DETALLE_VENTA (COD_VENTA, COD_PRODUCTO, CANTIDAD, PRECIO_PRODUCTO)
        VALUES (:venta, :prod, :cant, :precio)
      `,
        { venta: ventaId, prod: cod_producto, cant: cantidad, precio: precio_producto },
        { autoCommit: false }
      );
    }

    await conn.commit();
    res.status(201).json({ ok: true, message: "Venta creada", id: ventaId });
  } catch (err) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (_) {
        /* ignore */
      }
    }
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// PUT /api/ventas/:id
async function actualizarVenta(req, res) {
  const id = Number(req.params.id);
  const { cod_usuario, cod_empleado, fecha_venta } = req.body;

  let conn;
  try {
    conn = await getConnection();

    await conn.execute(
      `
      UPDATE JRGY_VENTA
      SET
        COD_USUARIO  = :cod_usuario,
        COD_EMPLEADO = :cod_empleado,
        FECHA_VENTA  = :fecha_venta
      WHERE COD_VENTA = :id
    `,
      { cod_usuario, cod_empleado, fecha_venta, id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Venta actualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

// DELETE /api/ventas/:id
async function eliminarVenta(req, res) {
  const id = Number(req.params.id);
  let conn;

  try {
    conn = await getConnection();
    await conn.execute(
      `DELETE FROM JRGY_VENTA WHERE COD_VENTA = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ ok: true, message: "Venta eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = {
  listarVentas,
  obtenerVenta,
  crearVenta,
  crearVentaUsuario,
  actualizarVenta,
  eliminarVenta
};
