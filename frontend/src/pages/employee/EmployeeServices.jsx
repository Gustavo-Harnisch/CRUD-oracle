// src/pages/employee/EmployeeServices.jsx
import { useEffect, useMemo, useState } from "react";
import { listServices } from "../../services/serviceService";

const formatTime = (num) => {
  if (num === null || num === undefined) return "";
  const totalMinutes = Math.round(Number(num) * 60);
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const EmployeeServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", tipo: "", hour: "" });

  useEffect(() => {
    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const data = await listServices();
        setServices(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los servicios.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const hourVal = filters.hour === "" ? null : Number(filters.hour);
    return services.filter((svc) => {
      const nameMatch = filters.search
        ? svc.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
          (svc.descripcion || "").toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const typeMatch = filters.tipo ? (svc.tipo || "").toLowerCase() === filters.tipo.toLowerCase() : true;
      const hourMatch =
        hourVal === null ||
        !svc.horarios ||
        svc.horarios.length === 0 ||
        svc.horarios.some((h) => hourVal >= h.inicio && hourVal <= h.fin);
      return nameMatch && typeMatch && hourMatch;
    });
  }, [services, filters]);

  const summary = useMemo(() => {
    const active = services.filter((s) => (s.estado || "").toLowerCase() === "activo").length;
    const featured = services.filter((s) => s.destacado).length;
    const alwaysOn = services.filter((s) => !s.horarios || s.horarios.length === 0).length;
    return [
      { id: "active", label: "Activos", value: active, helper: "Se muestran solo servicios activos" },
      { id: "featured", label: "Destacados", value: featured, helper: "Priorizar upsell en recepción" },
      { id: "anytime", label: "Sin horario", value: alwaysOn, helper: "Disponibles en cualquier hora" },
    ];
  }, [services]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
        <div>
          <p className="text-uppercase text-muted small mb-1">Empleado</p>
          <h1 className="h4 mb-1">Servicios disponibles para huéspedes</h1>
          <p className="text-muted small mb-0">
            Consulta rápida de horarios y precios. Solo lectura para rol EMPLOYEE.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setFilters({ search: "", tipo: "", hour: "" })}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {summary.map((card) => (
          <div className="col-12 col-md-4" key={card.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <p className="text-uppercase text-muted small mb-1">{card.label}</p>
                <h3 className="h5 mb-1">{card.value}</h3>
                <p className="text-muted small mb-0">{card.helper}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-5 col-lg-6">
              <label className="form-label small text-muted mb-1">Buscar</label>
              <input
                type="search"
                className="form-control"
                placeholder="Nombre o descripción"
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              />
            </div>
            <div className="col-6 col-md-3 col-lg-3">
              <label className="form-label small text-muted mb-1">Tipo</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: spa"
                value={filters.tipo}
                onChange={(e) => setFilters((p) => ({ ...p, tipo: e.target.value }))}
              />
            </div>
            <div className="col-6 col-md-2 col-lg-2">
              <label className="form-label small text-muted mb-1">Hora (0-23)</label>
              <input
                type="number"
                min="0"
                max="23"
                className="form-control"
                placeholder="Ej: 14"
                value={filters.hour}
                onChange={(e) => setFilters((p) => ({ ...p, hour: e.target.value }))}
              />
            </div>
            <div className="col-12 col-md-2 col-lg-1 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({ search: "", tipo: "", hour: "" })}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p className="text-muted">Cargando servicios...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Servicio</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Horarios</th>
                <th>Destacado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((svc) => (
                <tr key={svc.id}>
                  <td>{svc.id}</td>
                  <td>
                    <div className="fw-semibold">{svc.nombre}</div>
                    <small className="text-muted">{svc.descripcion || "Sin descripción"}</small>
                  </td>
                  <td>{svc.tipo || "—"}</td>
                  <td>$ {Number(svc.precio || 0).toLocaleString()}</td>
                  <td>
                    {svc.horarios?.length ? (
                      <div className="d-flex flex-wrap gap-1">
                        {svc.horarios.map((h) => (
                          <span key={`${svc.id}-${h.id || h.inicio}`} className="badge bg-light text-secondary border">
                            {`${formatTime(h.inicio)}-${formatTime(h.fin)}`}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <small className="text-muted">Cualquier hora</small>
                    )}
                  </td>
                  <td>
                    {svc.destacado ? (
                      <span className="badge bg-primary-subtle text-primary border">Sí</span>
                    ) : (
                      <span className="badge bg-light text-secondary border">No</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted text-center py-3">
                    No hay servicios que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeServices;
