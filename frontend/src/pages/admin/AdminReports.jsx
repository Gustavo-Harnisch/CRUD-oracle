// src/pages/admin/AdminReports.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchIncomeReport, fetchExpenseReport, fetchBalanceReport } from "../../services/reportService";
import { PAGE_STATUS, getStatusClasses } from "../../utils/pageStatus";

const toNumber = (val) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : 0;
};

const pickAmount = (row = {}) => {
  const candidates = [
    "utilidad",
    "ingresosReservas",
    "ingresosVentas",
    "egresosCompras",
    "total",
    "monto",
    "valor",
    "importe",
    "subtotal",
    "totalReserva",
    "totalServicio",
    "totalVenta",
    "totalCompra",
  ];
  for (const key of candidates) {
    if (row[key] !== undefined && row[key] !== null) {
      return toNumber(row[key]);
    }
  }
  // fallback: sum numeric fields
  return Object.values(row).reduce((acc, v) => (Number.isFinite(Number(v)) ? acc + Number(v) : acc), 0);
};

const pickFecha = (row = {}) => {
  const candidates = ["fecha", "periodo", "dia", "mes"];
  const value = candidates.map((k) => row[k]).find((v) => v !== undefined && v !== null);
  if (!value) return "N/D";
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? String(value) : dt.toLocaleDateString();
};

const currency = (num) => `$ ${toNumber(num).toLocaleString()}`;

const AdminReports = () => {
  const [filtros, setFiltros] = useState({ desde: "", hasta: "" });
  const [ingresos, setIngresos] = useState({ reservas: [], ventas: [] });
  const [egresos, setEgresos] = useState({ compras: [] });
  const [balance, setBalance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const params = {
        ...(filtros.desde ? { desde: filtros.desde } : {}),
        ...(filtros.hasta ? { hasta: filtros.hasta } : {}),
      };
      const [ing, egr, bal] = await Promise.all([
        fetchIncomeReport(params),
        fetchExpenseReport(params),
        fetchBalanceReport(params),
      ]);
      setIngresos({
        reservas: Array.isArray(ing?.reservas) ? ing.reservas : [],
        ventas: Array.isArray(ing?.ventas) ? ing.ventas : [],
      });
      setEgresos({
        compras: Array.isArray(egr?.compras) ? egr.compras : [],
      });
      setBalance(bal || {});
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "No se pudieron cargar los reportes.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalIngresosReservas = useMemo(
    () => ingresos.reservas.reduce((acc, r) => acc + pickAmount(r), 0),
    [ingresos.reservas],
  );
  const totalIngresosVentas = useMemo(() => ingresos.ventas.reduce((acc, r) => acc + pickAmount(r), 0), [ingresos.ventas]);
  const totalEgresosCompras = useMemo(
    () => egressAmount(egresos.compras),
    [egresos.compras],
  );

  function egressAmount(list = []) {
    return list.reduce((acc, r) => acc + pickAmount(r), 0);
  }

  const utilidadCalculada = totalIngresosReservas + totalIngresosVentas - totalEgresosCompras;
  const utilidadBalance = balance.utilidad !== undefined ? toNumber(balance.utilidad) : utilidadCalculada;

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
        <div>
          <p className="text-uppercase text-muted small mb-1">Admin · Reportes</p>
          <h1 className="h4 mb-1">Ingresos, egresos y balance</h1>
          <p className="text-muted small mb-0">Consulta por rango de fechas usando procs Oracle.</p>
        </div>
        <span className={`badge ${getStatusClasses(PAGE_STATUS.LIVE)}`}>{PAGE_STATUS.LIVE}</span>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3">
              <label className="form-label small text-muted mb-1">Desde</label>
              <input
                type="date"
                className="form-control"
                value={filtros.desde}
                onChange={(e) => setFiltros((p) => ({ ...p, desde: e.target.value }))}
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label small text-muted mb-1">Hasta</label>
              <input
                type="date"
                className="form-control"
                value={filtros.hasta}
                onChange={(e) => setFiltros((p) => ({ ...p, hasta: e.target.value }))}
              />
            </div>
            <div className="col-12 col-md-6 d-flex gap-2 justify-content-md-end">
              <button type="button" className="btn btn-primary" onClick={load} disabled={loading}>
                {loading ? "Cargando..." : "Consultar"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setFiltros({ desde: "", hasta: "" })}
                disabled={loading}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-uppercase text-muted small mb-1">Ingresos reservas</p>
              <h3 className="h5 mb-1">{currency(totalIngresosReservas)}</h3>
              <p className="text-muted small mb-0">Hab + servicios asociados</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-uppercase text-muted small mb-1">Ingresos ventas</p>
              <h3 className="h5 mb-1">{currency(totalIngresosVentas)}</h3>
              <p className="text-muted small mb-0">Productos/tienda</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-uppercase text-muted small mb-1">Egresos compras</p>
              <h3 className="h5 mb-1">{currency(totalEgresosCompras)}</h3>
              <p className="text-muted small mb-0">Pedidos a proveedores</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-uppercase text-muted small mb-1">Utilidad</p>
              <h3 className="h5 mb-1">{currency(utilidadBalance)}</h3>
              <p className="text-muted small mb-0">
                {balance.utilidad !== undefined ? "Según proc balance" : "Calculada localmente"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h6 mb-0">Ingresos por reservas</h2>
                <span className="badge bg-primary-subtle text-primary border">{ingresos.reservas.length} filas</span>
              </div>
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th className="text-end">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresos.reservas.map((row, idx) => (
                      <tr key={`res-${idx}`}>
                        <td>{pickFecha(row)}</td>
                        <td className="text-end">{currency(pickAmount(row))}</td>
                      </tr>
                    ))}
                    {ingresos.reservas.length === 0 && (
                      <tr>
                        <td colSpan={2} className="text-muted text-center">
                          Sin datos en el rango.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h6 mb-0">Ingresos por ventas</h2>
                <span className="badge bg-primary-subtle text-primary border">{ingresos.ventas.length} filas</span>
              </div>
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th className="text-end">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresos.ventas.map((row, idx) => (
                      <tr key={`ven-${idx}`}>
                        <td>{pickFecha(row)}</td>
                        <td className="text-end">{currency(pickAmount(row))}</td>
                      </tr>
                    ))}
                    {ingresos.ventas.length === 0 && (
                      <tr>
                        <td colSpan={2} className="text-muted text-center">
                          Sin datos en el rango.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mt-3">
        <div className="col-lg-12">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h6 mb-0">Egresos por compras</h2>
                <span className="badge bg-danger-subtle text-danger border">{egresos.compras.length} filas</span>
              </div>
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th className="text-end">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {egresos.compras.map((row, idx) => (
                      <tr key={`egr-${idx}`}>
                        <td>{pickFecha(row)}</td>
                        <td className="text-end">{currency(pickAmount(row))}</td>
                      </tr>
                    ))}
                    {egresos.compras.length === 0 && (
                      <tr>
                        <td colSpan={2} className="text-muted text-center">
                          Sin datos en el rango.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <small className="text-muted d-block mt-2">
                Basado en pedidos/detalle_pedido. Evita doble conteo si se usan pagos aparte.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
