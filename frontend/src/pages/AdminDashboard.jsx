import { useEffect, useMemo, useState } from "react";
import {
  fetchUsers,
  fetchEmployees,
  fetchVentas,
  fetchOccupancy,
  fetchStockMovs,
  fetchPagosVentas,
  fetchDetalleVentas,
  fetchDetallePagoHab,
  fetchProductos,
} from "../services/adminService";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [pagosVenta, setPagosVenta] = useState([]);
  const [detalleVentas, setDetalleVentas] = useState([]);
  const [detallePagoHab, setDetallePagoHab] = useState([]);
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);

  const productNames = useMemo(() => {
    const map = {};
    productos.forEach((p) => {
      map[p.COD_PRODUCTO] = p.NOMBRE_PRODUCTO;
    });
    return map;
  }, [productos]);

  const formatDate = (val) => {
    if (!val) return "-";
    // admite objetos Date o strings
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    return String(val).slice(0, 10);
  };

  useEffect(() => {
    const load = async () => {
      const calls = [
        fetchUsers(),
        fetchEmployees(),
        fetchVentas(),
        fetchOccupancy(),
        fetchStockMovs(),
        fetchPagosVentas(),
        fetchDetalleVentas(),
        fetchDetallePagoHab(),
        fetchProductos(),
      ];

      const results = await Promise.allSettled(calls);
      const take = (idx) => (results[idx].status === "fulfilled" ? results[idx].value?.data?.data || [] : []);

      setUsers(take(0));
      setEmployees(take(1));
      setVentas(take(2));
      setOccupancy(take(3));
      setMovimientos(take(4));
      setPagosVenta(take(5));
      setDetalleVentas(take(6));
      setDetallePagoHab(take(7));
      setProductos(take(8));

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
                        <td>{m.FECHA_MOVIMIENTO}</td>
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
              <h5 className="card-title">Pagos de venta</h5>
              <div className="table-responsive" style={{ maxHeight: "280px" }}>
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Venta</th>
                      <th>Modo</th>
                      <th>Monto</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagosVenta.map((p) => (
                      <tr key={p.COD_PAGO}>
                        <td>{p.COD_PAGO}</td>
                        <td>{p.COD_VENTA}</td>
                        <td>{p.MODO_PAGO}</td>
                        <td>{p.MONTO}</td>
                        <td>{p.FECHA_PAGO}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Detalle de ventas</h5>
          <div className="table-responsive" style={{ maxHeight: "260px" }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Venta</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detalleVentas.map((d) => (
                  <tr key={`${d.COD_VENTA}-${d.COD_PRODUCTO}`}>
                    <td>{d.COD_VENTA}</td>
                    <td>{productNames[d.COD_PRODUCTO] || d.COD_PRODUCTO}</td>
                    <td>{d.CANTIDAD}</td>
                    <td>{d.PRECIO_PRODUCTO}</td>
                    <td>{d.PRECIO_TOTAL}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Detalle pago de habitación</h5>
          <div className="table-responsive" style={{ maxHeight: "260px" }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Pago</th>
                  <th>Hab.</th>
                  <th>Fecha estadía</th>
                  <th>Precio</th>
                  <th>Días</th>
                </tr>
              </thead>
              <tbody>
                {detallePagoHab.map((d) => (
                  <tr key={`${d.COD_PAGO_HABITACION}-${d.COD_HABITACION}`}>
                    <td>{d.COD_PAGO_HABITACION}</td>
                    <td>{d.COD_HABITACION}</td>
                    <td>{formatDate(d.FECHA_ESTADIA)}</td>
                    <td>{d.PRECIO_HABITACION}</td>
                    <td>{d.DIAS}</td>
                  </tr>
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
