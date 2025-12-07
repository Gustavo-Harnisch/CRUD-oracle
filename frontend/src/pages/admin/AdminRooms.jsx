import { useEffect, useMemo, useState } from "react";
import {
  fetchRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  fetchRoomTypes,
  createRoomType,
} from "../../services/roomService";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  numero: "",
  tipo: "",
  capacidad: 1,
  precioBase: 0,
  estado: "LIBRE",
};

const AdminRooms = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const roles = Array.isArray(user?.roles) ? user.roles.map((r) => String(r).toUpperCase()) : [];
  const isAdmin = isAuthenticated && roles.includes("ADMIN");
  const canManage = isAdmin;
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesError, setTypesError] = useState("");
  const [creatingType, setCreatingType] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    tipo: "",
    estado: "",
    minPrice: "",
    maxPrice: "",
    minCap: "",
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const deriveTypesFromRooms = (list = []) => {
    const seen = new Set();
    return list
      .map((r) => String(r?.tipo || "").trim().toUpperCase())
      .filter((name) => {
        if (!name || seen.has(name)) return false;
        seen.add(name);
        return true;
      })
      .map((name) => ({ id: `room-${name}`, nombre: name, tipo: name }));
  };

  useEffect(() => {
    load();
    loadRoomTypes();
  }, []);

  const loadRoomTypes = async () => {
    setTypesError("");
    setTypesLoading(true);
    try {
      const data = await fetchRoomTypes();
      setRoomTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      const serverMessage = err?.response?.data?.message;
      if (rooms.length > 0) {
        setRoomTypes(deriveTypesFromRooms(rooms));
      }
      setTypesError(serverMessage || "No se pudieron cargar los tipos de habitación.");
    } finally {
      setTypesLoading(false);
    }
  };

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await fetchRooms();
      setRooms(data);
      setRoomTypes((prev) => (prev.length > 0 ? prev : deriveTypesFromRooms(data)));
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401) {
        setError("Sesión expirada o sin permisos admin. Inicia sesión.");
      } else {
        setError("No se pudieron cargar las habitaciones.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        numero: Number(form.numero),
        capacidad: Number(form.capacidad),
        precioBase: Number(form.precioBase),
        tipo: String(form.tipo || "").trim().toUpperCase(),
        estado: String(form.estado || "").trim().toUpperCase(),
      };
      if (editingId) {
        await updateRoom(editingId, payload);
      } else {
        await createRoom(payload);
      }
      await load();
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401) {
        setError("Sesión expirada o sin permisos admin. Inicia sesión nuevamente.");
        logout();
        window.location.href = "/login";
      } else {
        const message = err?.response?.data?.message || "No se pudo guardar la habitación.";
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (room) => {
    setEditingId(room.id);
    setForm({
      numero: room.numero,
      tipo: (room.tipo || "").toUpperCase(),
      capacidad: room.capacidad || 1,
      precioBase: room.precioBase || 0,
      estado: (room.estado || "ACTIVO").toUpperCase(),
    });
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await deleteRoom(id);
      await load();
      setConfirmDeleteId(null);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401) {
        setError("Sesión expirada o sin permisos admin. Inicia sesión nuevamente.");
        logout();
        window.location.href = "/login";
      } else {
        const message = err?.response?.data?.message || "No se pudo eliminar.";
        setError(message);
      }
    }
  };

  const handleDeleteClick = (id) => {
    if (confirmDeleteId === id) {
      handleDelete(id);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => {
        setConfirmDeleteId((current) => (current === id ? null : current));
      }, 4000);
    }
  };

  const handleAddType = async () => {
    if (!canManage) return;
    const previous = form.tipo;
    const input = window.prompt("Nombre del nuevo tipo de habitación (se guardará en mayúsculas):");
    if (input === null) return;
    const normalized = (input || "").trim().toUpperCase();
    if (!normalized) return;

    setCreatingType(true);
    setError("");
    setTypesError("");
    try {
      const created = await createRoomType(normalized);
      await loadRoomTypes();
      const nextValue = created?.nombre || created?.tipo || normalized;
      setForm((p) => ({ ...p, tipo: nextValue }));
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401) {
        setError("Sesión expirada o sin permisos admin. Inicia sesión nuevamente.");
        setTypesError("Sesión expirada o sin permisos admin. Inicia sesión nuevamente.");
        logout();
        window.location.href = "/login";
      } else if (status === 409) {
        setError("El tipo ya existe. Selecciónalo en la lista.");
        setTypesError("El tipo ya existe. Selecciónalo en la lista.");
        await loadRoomTypes();
        setForm((p) => ({ ...p, tipo: normalized }));
      } else {
        const message = err?.response?.data?.message || "No se pudo crear el tipo.";
        setError(message);
        setTypesError(message);
        setForm((p) => ({ ...p, tipo: previous }));
      }
    } finally {
      setCreatingType(false);
    }
  };

  const handleTypeChange = async (value) => {
    if (value === "__add__") {
      await handleAddType();
      return;
    }
    setForm((p) => ({ ...p, tipo: value }));
  };

  const typeOptions = useMemo(() => {
    const base = Array.isArray(roomTypes) ? roomTypes : [];
    const seen = new Set();
    const list = [];

    base.forEach((t) => {
      const name = (t?.nombre || t?.tipo || "").toUpperCase();
      if (name && !seen.has(name)) {
        seen.add(name);
        list.push({ id: t?.id ?? name, nombre: name, tipo: name });
      }
    });

    [form.tipo, filters.tipo].forEach((name) => {
      const upper = (name || "").toUpperCase();
      if (upper && !seen.has(upper)) {
        seen.add(upper);
        list.push({ id: `local-${upper}`, nombre: upper, tipo: upper });
      }
    });

    return list;
  }, [roomTypes, form.tipo, filters.tipo]);

  const formatEstado = (estado) => {
    const up = (estado || "").toUpperCase();
    if (up === "LIBRE") return "ACTIVADA";
    if (up === "OCUPADA") return "OCUPADA";
    if (up === "MANTENCION") return "MANTENCION";
    return up || "N/D";
  };

  const filtered = useMemo(() => {
    const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);
    const minCap = filters.minCap === "" ? null : Number(filters.minCap);
    return rooms.filter((r) => {
      const searchMatch = filters.search
        ? `${r.numero} ${r.tipo || ""}`.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const tipoMatch = filters.tipo ? (r.tipo || "").toUpperCase() === filters.tipo.toUpperCase() : true;
      const estadoMatch = filters.estado ? (r.estado || "").toUpperCase() === filters.estado.toUpperCase() : true;
      const minP = minPrice !== null ? Number(r.precioBase || 0) >= minPrice : true;
      const maxP = maxPrice !== null ? Number(r.precioBase || 0) <= maxPrice : true;
      const minC = minCap !== null ? Number(r.capacidad || 0) >= minCap : true;
      return searchMatch && tipoMatch && estadoMatch && minP && maxP && minC;
    });
  }, [rooms, filters]);

  return (
    <div className="container-xxl py-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5">
        <div>
          <p className="text-uppercase text-muted small mb-1">Admin · Habitaciones</p>
          <h1 className="h4 mb-0">Catálogo y tarifas</h1>
          <p className="text-muted small mb-0">Datos conectados a la base real.</p>
        </div>
        <span className="badge bg-success-subtle text-success border">{editingId ? "Editando" : "Nuevo"}</span>
      </div>

      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-2 mb-3">
        <div className="text-muted small">
          Sesión: <strong>{user?.email || "no autenticado"}</strong> · Roles:{" "}
          <strong>{roles.join(", ") || "—"}</strong>
        </div>
        {!canManage && (
          <div className="badge bg-warning-subtle text-warning border">Acciones bloqueadas: se requiere rol ADMIN.</div>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 g-xl-4 align-items-start">
        <div className="col-lg-5 col-xl-4">
          <div className="card shadow-sm h-100">
            <div className="card-body p-4 p-xl-5">
              <h2 className="h6 mb-4">{editingId ? "Editar habitación" : "Nueva habitación"}</h2>
              <form className="row g-4" onSubmit={handleSubmit}>
                <div className="col-12">
                  <label className="form-label">Número</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.numero}
                    onChange={(e) => setForm((p) => ({ ...p, numero: e.target.value }))}
                    required
                    disabled={!canManage}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Tipo</label>
                  <div className="d-flex flex-wrap align-items-stretch gap-2">
                    <select
                      className="form-select flex-grow-1"
                      style={{ minWidth: "200px" }}
                      value={form.tipo}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      required
                      disabled={!canManage || typesLoading || creatingType}
                    >
                      <option value="">{typesLoading ? "Cargando..." : "Selecciona un tipo"}</option>
                      {typeOptions.map((t) => {
                        const value = t.nombre || t.tipo || "";
                        return (
                          <option key={t.id || value} value={value}>
                            {value}
                          </option>
                        );
                      })}
                      <option value="__add__">+ Agregar nuevo tipo...</option>
                    </select>
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-shrink-0"
                      style={{ minWidth: "120px" }}
                      onClick={handleAddType}
                      disabled={!canManage || creatingType}
                    >
                      {creatingType ? "Guardando..." : "Agregar"}
                    </button>
                  </div>
                  <div className="d-flex flex-wrap justify-content-between align-items-center mt-1">
                    <div className="form-text mb-0">
                      {typesLoading && <span className="text-muted">Cargando tipos...</span>}
                      {typesError && <span className="text-danger">{typesError}</span>}
                      {!typesLoading && !typesError && (
                        <span className="text-muted">Usa la lista o agrega uno nuevo (se almacena en MAYÚSCULAS).</span>
                      )}
                    </div>
                    {!typesLoading && (
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 ms-auto"
                        onClick={loadRoomTypes}
                        disabled={creatingType}
                      >
                        Recargar tipos
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-md-6 col-lg-6">
                  <label className="form-label">Capacidad</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={form.capacidad}
                    onChange={(e) => setForm((p) => ({ ...p, capacidad: e.target.value }))}
                    required
                    disabled={!canManage}
                  />
                </div>
                <div className="col-md-6 col-lg-6">
                  <label className="form-label">Precio base</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.precioBase}
                    onChange={(e) => setForm((p) => ({ ...p, precioBase: e.target.value }))}
                    required
                    disabled={!canManage}
                  />
                </div>
                <div className="col-md-6 col-lg-6">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={form.estado}
                    onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value }))}
                    disabled={!canManage}
                  >
                    <option value="LIBRE">Activada</option>
                    <option value="OCUPADA">Ocupada</option>
                    <option value="MANTENCION">Mantención</option>
                  </select>
                </div>
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="submit" disabled={saving || creatingType || !canManage}>
                    {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setEditingId(null);
                        setForm(emptyForm);
                      }}
                      disabled={saving || creatingType || !canManage}
                    >
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7 col-xl-8">
          <div className="card shadow-sm h-100">
            <div className="card-body p-4 p-xl-5">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                  <h2 className="h6 mb-1">Listado</h2>
                  <p className="text-muted small mb-0">Filtra por tipo, precio, capacidad o estado.</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button className="btn btn-sm btn-outline-secondary px-3" onClick={load} disabled={loading}>
                    Recargar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary px-3"
                    type="button"
                    onClick={() =>
                      setFilters({ search: "", tipo: "", estado: "", minPrice: "", maxPrice: "", minCap: "" })
                    }
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>

              <div className="row g-3 mb-4 align-items-end">
                <div className="col-12 col-lg-4">
                  <label className="form-label small text-muted mb-1">Buscar</label>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Número o tipo"
                    value={filters.search}
                    onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                  />
                </div>
                <div className="col-6 col-lg-2">
                  <label className="form-label small text-muted mb-1">Tipo</label>
                  <select
                    className="form-select"
                    value={filters.tipo}
                    onChange={(e) => setFilters((p) => ({ ...p, tipo: e.target.value }))}
                    disabled={typesLoading && typeOptions.length === 0}
                  >
                    <option value="">Todos</option>
                    {typeOptions.map((t) => {
                      const value = t.nombre || t.tipo || "";
                      return (
                        <option key={`filter-${t.id || value}`} value={value}>
                          {value}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="col-6 col-lg-2">
                  <label className="form-label small text-muted mb-1">Estado</label>
                  <select
                    className="form-select"
                    value={filters.estado}
                    onChange={(e) => setFilters((p) => ({ ...p, estado: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    <option value="LIBRE">Activada</option>
                    <option value="OCUPADA">Ocupada</option>
                    <option value="MANTENCION">Mantención</option>
                  </select>
                </div>
                <div className="col-6 col-lg-2">
                  <label className="form-label small text-muted mb-1">Precio mín</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))}
                  />
                </div>
                <div className="col-6 col-lg-2">
                  <label className="form-label small text-muted mb-1">Precio máx</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="100000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))}
                  />
                </div>
                <div className="col-6 col-lg-2">
                  <label className="form-label small text-muted mb-1">Capacidad mín</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="1"
                    value={filters.minCap}
                    onChange={(e) => setFilters((p) => ({ ...p, minCap: e.target.value }))}
                  />
                </div>
              </div>

              {loading ? (
                <p className="text-muted">Cargando habitaciones...</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover align-middle">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Número</th>
                        <th>Tipo</th>
                        <th>Capacidad</th>
                        <th>Precio base</th>
                        <th>Estado</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((room) => (
                        <tr key={room.id} className="align-middle">
                          <td className="py-3">{room.id}</td>
                          <td className="py-3 fw-semibold">{room.numero}</td>
                          <td className="py-3 text-muted">{room.tipo}</td>
                          <td className="py-3">{room.capacidad}</td>
                          <td className="py-3">$ {Number(room.precioBase || 0).toLocaleString()}</td>
                          <td className="py-3">
                            <span
                              className={
                                (() => {
                                  const est = (room.estado || "").toUpperCase();
                                  if (est === "OCUPADA") return "badge bg-danger-subtle text-danger border";
                                  if (est === "MANTENCION") return "badge bg-warning-subtle text-warning border";
                                  return "badge bg-success-subtle text-success border";
                                })()
                              }
                            >
                              {formatEstado(room.estado)}
                            </span>
                          </td>
                          <td className="text-end py-3">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEdit(room)}
                                disabled={!canManage}
                              >
                                Editar
                              </button>
                              <button
                                className={`btn ${confirmDeleteId === room.id ? "btn-danger" : "btn-outline-danger"}`}
                                onClick={() => handleDeleteClick(room.id)}
                                disabled={!canManage}
                              >
                                {confirmDeleteId === room.id ? "¿Seguro?" : "Eliminar"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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

export default AdminRooms;
