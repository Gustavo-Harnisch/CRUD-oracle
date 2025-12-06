import { Fragment, useEffect, useMemo, useState } from "react";
import {
  fetchUsers,
  fetchEmployees,
  fetchVentas,
  fetchOccupancy,
  fetchStockMovs,
  fetchDetalleVentas,
  fetchReservations,
  fetchProductos,
} from "../services/adminService";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [detalleVentas, setDetalleVentas] = useState([]);
  const [detallePagoHab, setDetallePagoHab] = useState([]);
  const [productos, setProductos] = useState([]);
  const [expandedVentas, setExpandedVentas] = useState([]);
  const [expandedPagosHab, setExpandedPagosHab] = useState([]);
  const [error, setError] = useState(null);

  // Mapea productos a nombre para no mostrar solo IDs en tablas
  const productNames = useMemo(() => {
    const map = {};
    productos.forEach((p) => {
      map[p.COD_PRODUCTO] = p.NOMBRE_PRODUCTO;
    });
    return map;
  }, [productos]);

  // Mapea usuarios a nombre/email
  const userNames = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.COD_USUARIO] = u.NOMBRE_USUARIO || u.name || u.EMAIL_USUARIO;
    });
    return map;
  }, [users]);

  // Última habitación asociada a cada usuario (según ocupación)
  const userHabitaciones = useMemo(() => {
    const map = {};
    occupancy.forEach((h) => {
      if (h.COD_USUARIO) {
        map[h.COD_USUARIO] = h.NRO_HABITACION || h.COD_HABITACION || h.HABITACION;
      }
    });
    return map;
  }, [occupancy]);

  // Agrupa detalles por venta para mostrar al expandir
  const detallesPorVenta = useMemo(() => {
    const grouped = {};
    detalleVentas.forEach((d) => {
      if (!grouped[d.COD_VENTA]) grouped[d.COD_VENTA] = [];
      grouped[d.COD_VENTA].push(d);
    });
    return grouped;
  }, [detalleVentas]);

  // Agrupa detalle de pagos de habitación por pago
  const detalleHabPorPago = useMemo(() => {
    const grouped = {};
    detallePagoHab.forEach((d) => {
      if (!grouped[d.COD_PAGO_HABITACION]) grouped[d.COD_PAGO_HABITACION] = [];
      grouped[d.COD_PAGO_HABITACION].push(d);
    });
    return grouped;
  }, [detallePagoHab]);

  // Formatea fechas en pantalla
  const formatDate = (val) => {
    if (!val) return "-";
    // admite objetos Date o strings
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    return String(val).slice(0, 10);
  };

  useEffect(() => {
    const load = async () => {
      // Carga paralela de resúmenes y detalles
      const calls = [
        fetchUsers(),
        fetchEmployees(),
        fetchVentas(),
        fetchOccupancy(),
        fetchStockMovs(),
        fetchDetalleVentas(),
        fetchReservations(),
        fetchProductos(),
      ];

      const results = await Promise.allSettled(calls);
      const take = (idx) => (results[idx].status === "fulfilled" ? results[idx].value?.data?.data || [] : []);

      setUsers(take(0));
      setEmployees(take(1));
      setVentas(take(2));
      setOccupancy(take(3));
      setMovimientos(take(4));
      setDetalleVentas(take(5));
      setDetallePagoHab(take(6));
      setProductos(take(7));

      const failed = results.find((r) => r.status === "rejected");
      setError(failed ? "No se pudo cargar todo el dashboard (revisa consola)" : null);
      if (failed) console.error("Dashboard admin error", failed.reason);
    };

    load();
  }, []);

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Movimientos</h1>
      <p className="text-muted">Vista resumida de actividad. Para crear/editar usa las opciones del menú de admin.</p>
      {error && <div className="alert alert-warning">{error}</div>}

      <div className="row g-3 mb-4">
        {[
          { label: "Usuarios", value: users.length },
          { label: "Empleados", value: employees.length },
          { label: "Hab. libres", value: occupancy.filter((h) => h.ESTADO === "LIBRE").length },
          { label: "Ventas", value: ventas.length },
          {
            label: "Total ventas",
            value: ventas.reduce((acc, v) => acc + (Number(v.VALOR_TOTAL) || 0), 0),
            prefix: "$",
          },
          {
            label: "Total pagos hab.",
            value: detallePagoHab.reduce((acc, d) => acc + (Number(d.VALOR_TOTAL_PAGO) || Number(d.PRECIO_HABITACION) || 0), 0),
            prefix: "$",
          },
          { label: "Mov. stock", value: movimientos.length },
        ].map((card) => (
          <div className="col-sm-6 col-lg-3" key={card.label}>
            <div className="border rounded p-3 h-100 shadow-sm bg-light">
              <div className="text-muted small">{card.label}</div>
              <div className="fw-bold fs-5">
                {card.prefix || ""}
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Movimientos de stock</h5>
              <div className="table-responsive" style={{ maxHeight: "280px" }}>
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Prod.</th>
                      <th>Tipo</th>
                      <th>Cant</th>
                      <th>Fecha</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((m) => (
                      <tr key={m.COD_MOVIMIENTO}>
                        <td>{m.COD_MOVIMIENTO}</td>
                        <td>{m.COD_PRODUCTO}</td>
                        <td>{m.TIPO_MOVIMIENTO}</td>
                        <td>{m.CANTIDAD}</td>
                        <td>{formatDate(m.FECHA_MOVIMIENTO)}</td>
                        <td>{m.MOTIVO}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Ventas</h5>
              <div className="table-responsive" style={{ maxHeight: "320px" }}>
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Usuario</th>
                      <th>Habitación</th>
                      <th>Total</th>
                      <th>Fecha</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((v) => (
                      <Fragment key={v.COD_VENTA}>
                        <tr>
                          <td>{v.COD_VENTA}</td>
                          <td>{userNames[v.COD_USUARIO] || v.COD_USUARIO}</td>
                          <td>{userHabitaciones[v.COD_USUARIO] || "-"}</td>
                          <td>{v.VALOR_TOTAL || "-"}</td>
                          <td>{formatDate(v.FECHA_VENTA)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() =>
                                setExpandedVentas((prev) =>
                                  prev.includes(v.COD_VENTA)
                                    ? prev.filter((id) => id !== v.COD_VENTA)
                                    : [...prev, v.COD_VENTA]
                                )
                              }
                            >
                              {expandedVentas.includes(v.COD_VENTA) ? "Ocultar" : "Ver detalle"}
                            </button>
                          </td>
                        </tr>
                        {expandedVentas.includes(v.COD_VENTA) && (
                          <tr>
                            <td colSpan="6">
                              <div className="table-responsive">
                                <table className="table table-sm mb-0">
                                  <thead>
                                    <tr>
                                      <th>Producto</th>
                                      <th>Cantidad</th>
                                      <th>Precio</th>
                                      <th>Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(detallesPorVenta[v.COD_VENTA] || []).map((d) => (
                                      <tr key={`${d.COD_VENTA}-${d.COD_PRODUCTO}`}>
                                        <td>{productNames[d.COD_PRODUCTO] || d.COD_PRODUCTO}</td>
                                        <td>{d.CANTIDAD}</td>
                                        <td>{d.PRECIO_PRODUCTO}</td>
                                        <td>{d.PRECIO_TOTAL}</td>
                                      </tr>
                                    ))}
                                    {(detallesPorVenta[v.COD_VENTA] || []).length === 0 && (
                                      <tr>
                                        <td colSpan="4" className="text-muted">
                                          Sin detalle de venta.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Pagos de habitación</h5>
          <div className="table-responsive" style={{ maxHeight: "320px" }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Pago</th>
                  <th>Usuario</th>
                  <th>Habitación</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha pago</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {detallePagoHab.map((d) => (
                  <Fragment key={`${d.COD_PAGO_HABITACION}-${d.COD_HABITACION}`}>
                    <tr>
                      <td>{d.COD_PAGO_HABITACION}</td>
                      <td>{userNames[d.COD_USUARIO] || d.COD_USUARIO || "-"}</td>
                      <td>{d.COD_HABITACION || d.NRO_HABITACION || "-"}</td>
                      <td>{d.VALOR_TOTAL_PAGO || d.PRECIO_HABITACION || "-"}</td>
                      <td>{d.ESTADO_PAGO || "-"}</td>
                      <td>{formatDate(d.FECHA_PAGO)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            setExpandedPagosHab((prev) =>
                              prev.includes(d.COD_PAGO_HABITACION)
                                ? prev.filter((id) => id !== d.COD_PAGO_HABITACION)
                                : [...prev, d.COD_PAGO_HABITACION]
                            )
                          }
                        >
                          {expandedPagosHab.includes(d.COD_PAGO_HABITACION) ? "Ocultar" : "Ver detalle"}
                        </button>
                      </td>
                    </tr>
                    {expandedPagosHab.includes(d.COD_PAGO_HABITACION) && (
                      <tr>
                        <td colSpan="7">
                          <div className="table-responsive">
                            <table className="table table-sm mb-0">
                              <thead>
                                <tr>
                                  <th>Fecha estadía</th>
                                  <th>Días</th>
                                  <th>Precio noche</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(detalleHabPorPago[d.COD_PAGO_HABITACION] || []).map((det) => (
                                  <tr key={`${det.COD_PAGO_HABITACION || d.COD_PAGO_HABITACION}-${det.COD_HABITACION || det.COD_HAB}-${det.FECHA_ESTADIA || det.FECHA_PAGO}`}>
                                    <td>{formatDate(det.FECHA_ESTADIA || det.FECHA_PAGO)}</td>
                                    <td>{det.DIAS}</td>
                                    <td>{det.PRECIO_HABITACION}</td>
                                  </tr>
                                ))}
                                {(detalleHabPorPago[d.COD_PAGO_HABITACION] || []).length === 0 && (
                                  <tr>
                                    <td colSpan="3" className="text-muted">
                                      Sin detalle.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
