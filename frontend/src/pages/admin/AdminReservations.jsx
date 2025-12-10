import { useEffect, useMemo, useState } from "react";
import { fetchReservations, createReservation, cancelReservation } from "../../services/bookingService";
import { transferRoomReservation } from "../../services/roomService";
import { useAuth } from "../../context/AuthContext";

const AdminReservations = () => {
  const { logout } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ search: "", estado: "", desde: "", hasta: "" });
  const [form, setForm] = useState({ habitacionId: "", fechaInicio: "", fechaFin: "", huespedes: 1 });
  const [editingId, setEditingId] = useState(null);
  const [transfering, setTransfering] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReservations({ all: 1 });
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        logout();
        window.location.href = "/login";
      } else {
        setError("No se pudieron cargar las reservas.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (val) => {
    if (!val) return "";
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ habitacionId: "", fechaInicio: "", fechaFin: "", huespedes: 1 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        habitacionId: Number(form.habitacionId),
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        huespedes: Number(form.huespedes || 1),
      };
      if (!payload.habitacionId) throw new Error("Habitación requerida");
      if (editingId) {
        await cancelReservation(editingId);
      }
      await createReservation(payload);
      await load();
      resetForm();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        logout();
        window.location.href = "/login";
      } else {
        setError(err?.response?.data?.message || err.message || "No se pudo crear la reserva.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (r) => {
    setEditingId(r.id);
    setForm({
      habitacionId: r.habitacionId || r.numero || "",
      fechaInicio: formatDate(r.fechaInicio),
      fechaFin: formatDate(r.fechaFin),
      huespedes: r.huespedes || 1,
    });
  };

  const handleCancelReservation = async (id) => {
    if (!window.confirm("¿Cancelar esta reserva?")) return;
    setError("");
    try {
      await cancelReservation(id);
      await load();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        logout();
        window.location.href = "/login";
      } else {
        setError(err?.response?.data?.message || "No se pudo cancelar la reserva.");
      }
    }
  };

  const handleTransfer = async (r) => {
    const target = window.prompt("Nuevo usuario ID para transferir la reserva:");
    if (target === null) return;
    const newUserId = Number(target);
    if (!newUserId) {
      setError("Usuario destino inválido.");
      return;
    }
    setError("");
    setTransfering(true);
    try {
      await transferRoomReservation(r.habitacionId, newUserId);
      await load();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        logout();
        window.location.href = "/login";
      } else {
        setError(err?.response?.data?.message || "No se pudo transferir la reserva.");
      }
    } finally {
      setTransfering(false);
    }
  };

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      const texto = `${r.numero || ""} ${r.tipo || ""} ${r.nombre || ""} ${r.apellido1 || ""} ${r.email || ""}`.toLowerCase();
      const s = filters.search ? texto.includes(filters.search.toLowerCase()) : true;
      const e = filters.estado ? String(r.estado || "").toUpperCase() === filters.estado.toUpperCase() : true;
      const fi = formatDate(r.fechaInicio);
      const ff = formatDate(r.fechaFin);
      const dOk = filters.desde ? fi >= filters.desde : true;
      const hOk = filters.hasta ? ff <= filters.hasta : true;
      return s && e && dOk && hOk;
    });
  }, [reservations, filters]);

  const renderEstado = (estado) => {
    const up = (estado || "").toUpperCase();
    const badgeClass =
      up === "EN_PROCESO" || up === "EN PROCESO"
        ? "badge bg-info-subtle text-info border"
        : up === "FINALIZADA"
          ? "badge bg-success-subtle text-success border"
          : up === "CANCELADA"
            ? "badge bg-danger-subtle text-danger border"
            : "badge bg-secondary-subtle text-secondary border";
    return <span className={badgeClass}>{up || "N/D"}</span>;
  };

  return (
    <div className="container-xxl py-4" style={{ maxWidth: "1180px" }}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <p className="text-uppercase text-muted small mb-1">Admin · Reservas</p>
          <h1 className="h4 mb-1">Gestión de reservas</h1>
          <p className="text-muted small mb-0">Crear nuevas reservas y revisar las existentes.</p>
        </div>
        <span className="badge bg-primary-subtle text-primary border">
          {filtered.length} visibles · {reservations.length} total
        </span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 g-lg-4 align-items-start">
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-start">
                <h2 className="h6 mb-3">{editingId ? `Editar reserva #${editingId}` : "Nueva reserva"}</h2>
                {editingId && (
                  <button type="button" className="btn btn-sm btn-link p-0" onClick={resetForm} disabled={saving}>
                    Salir de edición
                  </button>
                )}
              </div>
              <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-12">
                  <label className="form-label">Habitación ID</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={form.habitacionId}
                    onChange={(e) => setForm((p) => ({ ...p, habitacionId: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Fecha inicio</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.fechaInicio}
                    onChange={(e) => setForm((p) => ({ ...p, fechaInicio: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Fecha fin</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.fechaFin}
                    onChange={(e) => setForm((p) => ({ ...p, fechaFin: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Huéspedes</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={form.huespedes}
                    onChange={(e) => setForm((p) => ({ ...p, huespedes: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? "Guardando..." : "Crear"}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={resetForm} disabled={saving}>
                    Limpiar
                  </button>
                </div>
              </form>
              <p className="text-muted small mt-3 mb-0">
                Usa “Editar” en la tabla para precargar y ajustar una reserva; “Crear” guarda (si estabas editando, se cancela la anterior y se crea una nueva).
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3">
                <div>
                  <h2 className="h6 mb-1">Listado</h2>
                  <p className="text-muted small mb-0">Filtra por estado, fechas, huésped o habitación.</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button className="btn btn-sm btn-outline-secondary" onClick={load} disabled={loading}>
                    {loading ? "Cargando..." : "Recargar"}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    type="button"
                    onClick={() => setFilters({ search: "", estado: "", desde: "", hasta: "" })}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>

              <div className="row g-2 g-md-3 mb-3 align-items-end">
                <div className="col-12 col-md-4 col-lg-4">
                  <label className="form-label small text-muted mb-1">Buscar</label>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Habitación, huésped o email"
                    value={filters.search}
                    onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                  />
                </div>
                <div className="col-6 col-md-2">
                  <label className="form-label small text-muted mb-1">Estado</label>
                  <select
                    className="form-select"
                    value={filters.estado}
                    onChange={(e) => setFilters((p) => ({ ...p, estado: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    <option value="EN_PROCESO">En proceso</option>
                    <option value="FINALIZADA">Finalizada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>
                <div className="col-6 col-md-3 col-lg-3">
                  <label className="form-label small text-muted mb-1">Desde</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.desde}
                    onChange={(e) => setFilters((p) => ({ ...p, desde: e.target.value }))}
                  />
                </div>
                <div className="col-6 col-md-3 col-lg-3">
                  <label className="form-label small text-muted mb-1">Hasta</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.hasta}
                    onChange={(e) => setFilters((p) => ({ ...p, hasta: e.target.value }))}
                  />
                </div>
              </div>

              {loading ? (
                <p className="text-muted small mb-0">Cargando reservas...</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover align-middle">
                    <thead>
                      <tr>
                        <th className="text-nowrap" style={{ width: "6%" }}>#</th>
                        <th className="text-nowrap" style={{ width: "12%" }}>Habitación</th>
                        <th className="text-nowrap" style={{ width: "24%" }}>Huésped</th>
                        <th className="text-nowrap" style={{ width: "12%" }}>Fechas</th>
                        <th className="text-nowrap" style={{ width: "8%" }}>Huésp.</th>
                        <th className="text-nowrap text-end" style={{ width: "12%" }}>Total</th>
                        <th className="text-nowrap" style={{ width: "10%" }}>Estado</th>
                        <th className="text-nowrap text-end" style={{ width: "8%" }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => {
                        const nombre = [r.nombre, r.apellido1, r.apellido2].filter(Boolean).join(" ");
                        return (
                          <tr key={r.id}>
                            <td className="text-muted">{r.id}</td>
                            <td>
                              <div className="fw-semibold text-truncate">{r.numero || `Hab ${r.habitacionId}`}</div>
                              <small className="text-muted text-truncate d-block">{r.tipo || "—"}</small>
                            </td>
                            <td>
                              <div className="fw-semibold text-truncate" title={nombre || "—"}>
                                {nombre || "—"}
                              </div>
                              <small className="text-muted text-truncate d-block" title={r.email || ""}>
                                {r.email || "Sin correo"}
                              </small>
                            </td>
                            <td className="text-nowrap">
                              <div>{formatDate(r.fechaInicio)}</div>
                              <div className="text-muted small">→ {formatDate(r.fechaFin)}</div>
                            </td>
                            <td className="text-center">{r.huespedes ?? "—"}</td>
                            <td className="text-end">$ {Number(r.total || 0).toLocaleString()}</td>
                            <td>{renderEstado(r.estado)}</td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button type="button" className="btn btn-outline-primary" onClick={() => handleEdit(r)}>
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => handleCancelReservation(r.id)}
                              disabled={(r.estado || "").toUpperCase() === "CANCELADA"}
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-warning"
                              onClick={() => handleTransfer(r)}
                              disabled={transfering}
                            >
                              {transfering ? "..." : "Transferir"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                    </tbody>
                  </table>
                  {filtered.length === 0 && <p className="text-muted small mb-0">Sin resultados.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReservations;
