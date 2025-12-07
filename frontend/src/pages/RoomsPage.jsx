// src/pages/RoomsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRooms } from "../services/roomService";
import { PAGE_STATUS, getStatusClasses } from "../utils/pageStatus";

const statusBadge = (estado = "") => {
  const normalized = (estado || "").toUpperCase();
  if (normalized.includes("LIBRE")) return "badge bg-success-subtle text-success border"; // verde
  if (normalized.includes("OCUP")) return "badge bg-danger-subtle text-danger border"; // rojo
  if (normalized.includes("MANT")) return "badge bg-warning-subtle text-warning border"; // amarillo
  return "badge bg-light text-muted border";
};

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchRooms();
        setRooms(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las habitaciones");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const types = useMemo(
    () => Array.from(new Set(rooms.map((r) => r.tipo).filter(Boolean))).sort(),
    [rooms]
  );

  const statuses = useMemo(
    () => Array.from(new Set(rooms.map((r) => r.estado).filter(Boolean))).sort(),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch = search
        ? String(room.numero).toLowerCase().includes(search.trim().toLowerCase()) ||
          String(room.tipo || "").toLowerCase().includes(search.trim().toLowerCase())
        : true;
      const matchesType = typeFilter ? room.tipo === typeFilter : true;
      const matchesStatus = statusFilter ? room.estado === statusFilter : true;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rooms, search, typeFilter, statusFilter]);

  const totals = useMemo(() => {
    const total = rooms.length;
    const libres = rooms.filter((r) => (r.estado || "").toUpperCase().includes("LIBRE")).length;
    const ocupadas = rooms.filter((r) => (r.estado || "").toUpperCase().includes("OCUP")).length;
    return { total, libres, ocupadas };
  }, [rooms]);

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("");
    setStatusFilter("");
  };

  return (
    <div className="container py-4">
      <div className="card border-0 shadow-sm mb-4 bg-gradient">
        <div className="card-body d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div>
            <p className="text-uppercase text-muted mb-1 small">Habitaciones</p>
            <h1 className="h4 mb-1">Catálogo de habitaciones</h1>
            <p className="text-muted small mb-0">Explora disponibilidad y precios en línea.</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-center">
              <p className="text-muted small mb-0">Total</p>
              <p className="h5 mb-0">{totals.total}</p>
            </div>
            <div className="text-center">
              <p className="text-muted small mb-0">Libres</p>
              <p className="h5 mb-0 text-success">{totals.libres}</p>
            </div>
            <div className="text-center">
              <p className="text-muted small mb-0">Ocupadas</p>
              <p className="h5 mb-0 text-warning">{totals.ocupadas}</p>
            </div>
            <span className={`badge ${getStatusClasses(PAGE_STATUS.LIVE)}`}>{PAGE_STATUS.LIVE}</span>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label mb-1">Buscar</label>
              <input
                type="search"
                className="form-control"
                placeholder="Número o tipo"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label mb-1">Tipo</label>
              <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">Todos</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label mb-1">Estado</label>
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Todos</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2 d-grid">
              <button type="button" className="btn btn-outline-secondary" onClick={resetFilters}>
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p className="text-muted">Cargando habitaciones...</p>
      ) : filteredRooms.length === 0 ? (
        <div className="alert alert-info">No hay habitaciones que coincidan con los filtros.</div>
      ) : (
        <div className="row g-3">
          {filteredRooms.map((room) => (
            <div className="col-md-6 col-lg-4" key={room.id}>
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span className="badge bg-primary-subtle text-primary border mb-1">Hab. {room.numero}</span>
                      <h2 className="h6 mb-0 text-uppercase">{room.tipo}</h2>
                    </div>
                    <span className={statusBadge(room.estado)}>{room.estado || "N/D"}</span>
                  </div>
                  <p className="text-muted small mb-3">ID #{room.id}</p>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <p className="text-muted small mb-0">Capacidad</p>
                      <p className="fw-semibold mb-0">{room.capacidad} huésped(es)</p>
                    </div>
                    <div className="text-end">
                      <p className="text-muted small mb-0">Desde / noche</p>
                      <p className="fw-bold mb-0">$ {Number(room.precioBase || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Ideal para estancias breves y cómodas.</span>
                    <Link className="btn btn-sm btn-outline-primary" to={`/customer/reservations?room=${room.id}`}>
                      Reservar
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
