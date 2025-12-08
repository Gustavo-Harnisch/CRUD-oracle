import { useEffect, useMemo, useState } from "react";
import {
  listServices,
  createService,
  updateService,
  deleteService,
  changeServiceStatus,
  fetchServiceCategories,
} from "../../services/serviceService";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  nombre: "",
  descripcion: "",
  tipo: "",
  precio: 0,
  estado: "activo",
  destacado: false,
  orden: "",
  horarios: [],
  horarioInicio: "",
  horarioFin: "",
};

const AdminServices = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const roles = Array.isArray(user?.roles) ? user.roles.map((r) => String(r).toUpperCase()) : [];
  const isAdmin = isAuthenticated && roles.includes("ADMIN");
  const canManage = isAdmin;
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    tipo: "",
    minPrice: "",
    maxPrice: "",
    hour: "",
  });
  const typeOptions = useMemo(() => {
    const base = Array.isArray(categories) ? categories : [];
    const seen = new Set(base.map((c) => c.trim()));
    const list = [...base];
    [form.tipo, filters.tipo].forEach((name) => {
      const n = (name || "").trim();
      if (n && !seen.has(n)) {
        seen.add(n);
        list.push(n);
      }
    });
    return list;
  }, [categories, form.tipo, filters.tipo]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listServices({ includeInactive: true });
      setServices(data);
      await loadCategories(data);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401) {
        setError("Sesión expirada o sin permisos. Inicia sesión como admin.");
      } else {
        setError("No se pudieron cargar los servicios.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const loadCategories = async (servicesData = services) => {
    setCategoriesError("");
    setCategoriesLoading(true);
    try {
      const cats = await fetchServiceCategories();
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error(err);
      const derived = Array.isArray(servicesData)
        ? Array.from(new Set(servicesData.map((s) => (s.tipo || "").toUpperCase())))
        : [];
      setCategories(derived.filter((c) => (c || "").trim() !== ""));
      setCategoriesError("No se pudieron cargar las categorías; usando valores existentes.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleAddCategory = () => {
    const name = window.prompt("Nombre de la categoría (se guarda en MAYÚSCULAS):");
    if (name === null) return;
    const trimmed = (name || "").trim().toUpperCase();
    if (!trimmed) return;
    setCategories((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      if (!next.includes(trimmed)) next.push(trimmed);
      return next;
    });
    setForm((p) => ({ ...p, tipo: trimmed }));
  };

  const handleCategoryChange = (value) => {
    if (value === "__add__") {
      handleAddCategory();
      return;
    }
    setForm((prev) => ({ ...prev, tipo: value }));
  };

  const parseTime = (val) => {
    if (!val) return { hour: NaN, hasMinutes: false, invalid: true };
    const [hh, mm = "0"] = String(val).split(":");
    const hour = Number(hh);
    const minutes = Number(mm);
    return {
      hour,
      hasMinutes: minutes !== 0,
      invalid: Number.isNaN(hour) || Number.isNaN(minutes),
    };
  };

  const formatTime = (num) => {
    if (num === null || num === undefined) return "";
    const totalMinutes = Math.round(Number(num) * 60);
    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  const handleAddHorario = () => {
    const inicioParsed = parseTime(form.horarioInicio);
    const finParsed = parseTime(form.horarioFin);
    if (inicioParsed.invalid || finParsed.invalid) {
      setError("Ingresa un horario válido en formato HH:00.");
      return;
    }
    if (inicioParsed.hasMinutes || finParsed.hasMinutes) {
      setError("Usa horas completas (minutos 00). Los procs actuales solo aceptan 0-23.");
      return;
    }

    const inicio = inicioParsed.hour;
    const fin = finParsed.hour;
    if (inicio < 0 || inicio > 23 || fin < 0 || fin > 23 || fin < inicio) {
      setError("Rango inválido: usa horas entre 0 y 23 y fin >= inicio.");
      return;
    }
    setError("");
    setForm((prev) => ({
      ...prev,
      horarios: [...prev.horarios, { inicio, fin }],
      horarioInicio: "",
      horarioFin: "",
    }));
  };

  const handleRemoveHorario = (idx) => {
    setForm((prev) => ({
      ...prev,
      horarios: prev.horarios.filter((_, i) => i !== idx),
    }));
  };

  const handleEdit = (svc) => {
    setEditingId(svc.id);
    setForm({
      nombre: svc.nombre || "",
      descripcion: svc.descripcion || "",
      tipo: (svc.tipo || "").toUpperCase(),
      precio: svc.precio || 0,
      estado: (svc.estado || "activo").toLowerCase(),
      destacado: Boolean(svc.destacado),
      orden: svc.orden ?? "",
      horarios: (svc.horarios || []).map((h) => ({
        inicio: Number(h.inicio),
        fin: Number(h.fin),
      })),
      horarioInicio: "",
      horarioFin: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        tipo: (form.tipo || "").trim().toUpperCase(),
        precio: Number(form.precio || 0),
        estado: form.estado,
        destacado: form.destacado,
        orden: form.orden === "" ? null : Number(form.orden),
        horarios: form.horarios.map((h) => ({
          inicio: Number(h.inicio),
          fin: Number(h.fin),
        })),
      };

      if (editingId) {
        await updateService(editingId, payload);
      } else {
        await createService(payload);
      }
      await load();
      resetForm();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "No se pudo guardar el servicio.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este servicio? (solo si no tiene reservas asociadas)")) return;
    setError("");
    try {
      await deleteService(id);
      await load();
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

  const handleToggleEstado = async (svc) => {
    const nextEstado = (svc.estado || "activo").toLowerCase() === "activo" ? "inactivo" : "activo";
    setError("");
    try {
      await changeServiceStatus(svc.id, nextEstado);
      await load();
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401) {
        setError("Sesión expirada o sin permisos admin. Inicia sesión nuevamente.");
        logout();
        window.location.href = "/login";
      } else {
        const message = err?.response?.data?.message || "No se pudo cambiar el estado.";
        setError(message);
      }
    }
  };

  const sorted = useMemo(() => {
    return [...services].sort((a, b) => {
      const da = a.destacado ? 0 : 1;
      const db = b.destacado ? 0 : 1;
      if (da !== db) return da - db;
      return (a.orden ?? 9999) - (b.orden ?? 9999);
    });
  }, [services]);

  const filtered = useMemo(() => {
    const hourVal = filters.hour === "" ? null : Number(filters.hour);
    const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);
    return sorted.filter((svc) => {
      const nameMatch = filters.search
        ? svc.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
          (svc.descripcion || "").toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const typeMatch = filters.tipo ? (svc.tipo || "").toLowerCase() === filters.tipo.toLowerCase() : true;
      const minMatch = minPrice !== null ? Number(svc.precio || 0) >= minPrice : true;
      const maxMatch = maxPrice !== null ? Number(svc.precio || 0) <= maxPrice : true;
      const hourMatch =
        hourVal === null ||
        !svc.horarios ||
        svc.horarios.length === 0 ||
        svc.horarios.some((h) => hourVal >= h.inicio && hourVal <= h.fin);
      return nameMatch && typeMatch && minMatch && maxMatch && hourMatch;
    });
  }, [sorted, filters]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted small mb-1">Admin · Servicios</p>
          <h1 className="h4 mb-0">Catálogo de servicios</h1>
          <p className="text-muted small mb-0">CRUD completo con horarios.</p>
        </div>
        <span className="badge bg-primary-subtle text-primary border">{editingId ? "Editando" : "Nuevo"}</span>
      </div>

      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-2 mb-3">
        <div className="text-muted small">
          Sesión: <strong>{user?.email || "no autenticado"}</strong> · Roles:{" "}
          <strong>{roles.join(", ") || "—"}</strong>
        </div>
        {!canManage && (
          <div className="badge bg-warning-subtle text-warning border">
            Acciones bloqueadas: se requiere rol ADMIN.
          </div>
        )}
      </div>

      {!canManage && (
        <div className="alert alert-warning">
          Necesitas iniciar sesión como administrador para gestionar servicios. Las acciones están deshabilitadas.
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 mb-3">{editingId ? "Editar servicio" : "Nuevo servicio"}</h2>
              <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-12">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.nombre}
                    onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={form.descripcion}
                    onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Categoría / tipo</label>
                  <div className="d-flex gap-2 flex-wrap align-items-center">
                    <select
                      className="form-select flex-grow-1"
                      style={{ minWidth: "220px" }}
                      value={form.tipo}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      disabled={categoriesLoading}
                    >
                      <option value="">{categoriesLoading ? "Cargando..." : "Selecciona"}</option>
                      {typeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                      {form.tipo && !typeOptions.includes(form.tipo) && (
                        <option value={form.tipo}>{form.tipo}</option>
                      )}
                      <option value="__add__">+ Agregar categoría...</option>
                    </select>
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-shrink-0"
                      style={{ minWidth: "130px" }}
                      onClick={handleAddCategory}
                      disabled={categoriesLoading}
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="d-flex flex-wrap justify-content-between align-items-center mt-1">
                    <div className="form-text mb-0">
                      {categoriesLoading && <span className="text-muted">Cargando categorías...</span>}
                      {categoriesError && <span className="text-danger">{categoriesError}</span>}
                      {!categoriesLoading && !categoriesError && (
                        <span className="text-muted">Usa la lista o agrega una nueva categoría (se guarda en MAYÚSCULAS).</span>
                      )}
                    </div>
                    {!categoriesLoading && (
                      <button type="button" className="btn btn-sm btn-link p-0 ms-auto" onClick={() => loadCategories()}>
                        Recargar
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Precio por pax</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.precio}
                    onChange={(e) => setForm((prev) => ({ ...prev, precio: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={form.estado}
                    onChange={(e) => setForm((prev) => ({ ...prev, estado: e.target.value }))}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Orden</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.orden}
                    onChange={(e) => setForm((prev) => ({ ...prev, orden: e.target.value }))}
                  />
                  <small className="text-muted">Usa números bajos para que aparezca primero (prioridad visual).</small>
                </div>
                <div className="col-12 form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="destacado"
                    checked={form.destacado}
                    onChange={(e) => setForm((prev) => ({ ...prev, destacado: e.target.checked }))}
                  />
                  <label className="form-check-label" htmlFor="destacado">
                    Destacado
                  </label>
                </div>

                <div className="col-12">
                  <label className="form-label">Horarios (HH:00 · horas en punto)</label>
                  <div className="d-flex gap-2 mb-2">
                    <input
                      type="time"
                      step="3600"
                      min="00:00"
                      max="23:00"
                      className="form-control"
                      placeholder="Inicio"
                      title="Solo horas completas (minutos 00)"
                      value={form.horarioInicio}
                      onChange={(e) => setForm((prev) => ({ ...prev, horarioInicio: e.target.value }))}
                    />
                    <input
                      type="time"
                      step="3600"
                      min="00:00"
                      max="23:00"
                      className="form-control"
                      placeholder="Fin"
                      title="Solo horas completas (minutos 00)"
                      value={form.horarioFin}
                      onChange={(e) => setForm((prev) => ({ ...prev, horarioFin: e.target.value }))}
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={handleAddHorario}>
                      Agregar
                    </button>
                  </div>
                  <small className="text-muted d-block mb-2">
                    Solo horas completas (minutos 00) mientras el procedimiento acepta 0-23.
                  </small>
                  {form.horarios.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {form.horarios.map((h, idx) => (
                        <span key={`${h.inicio}-${h.fin}-${idx}`} className="badge bg-primary-subtle text-primary border">
                          {`${formatTime(h.inicio)} - ${formatTime(h.fin)}`}{" "}
                          <button
                            type="button"
                            className="btn btn-link btn-sm p-0 ms-1 text-danger"
                            onClick={() => handleRemoveHorario(idx)}
                            aria-label="Eliminar horario"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <small className="text-muted">Sin horarios: se permitirá cualquier hora.</small>
                  )}
                </div>

                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="submit" disabled={saving || !canManage}>
                    {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                      disabled={saving || !canManage}
                    >
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
                <h2 className="h6 mb-0">Listado</h2>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={load} disabled={loading}>
                    Recargar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    type="button"
                    onClick={() => setFilters({ search: "", tipo: "", minPrice: "", maxPrice: "", hour: "" })}
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
                    placeholder="Nombre o descripción"
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
                  >
                    <option value="">Todos</option>
                    {typeOptions.map((t) => (
                      <option key={`filter-${t}`} value={t}>
                        {t}
                      </option>
                    ))}
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
                  <label className="form-label small text-muted mb-1">Hora (entera 0-23)</label>
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
              </div>
              {loading ? (
                <p className="text-muted">Cargando...</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover align-middle">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Estado</th>
                        <th>Horarios</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((svc) => (
                        <tr key={svc.id} className="align-middle">
                          <td className="py-3">{svc.id}</td>
                          <td className="py-3">
                            <div className="fw-semibold">{svc.nombre}</div>
                            <small className="text-muted">{svc.tipo || "—"}</small>
                          </td>
                          <td className="py-3">$ {Number(svc.precio || 0).toLocaleString()}</td>
                          <td className="py-3">
                            <span
                              className={
                                (svc.estado || "").toLowerCase() === "activo"
                                  ? "badge bg-success-subtle text-success border"
                                  : "badge bg-secondary-subtle text-secondary border"
                              }
                            >
                              {svc.estado}
                            </span>
                          </td>
                          <td className="py-3">
                            {svc.horarios?.length ? (
                              <div className="d-flex flex-wrap gap-1">
                                {svc.horarios.map((h) => (
                                  <span
                                    key={`${svc.id}-${h.id || h.inicio}`}
                                    className="badge bg-light text-secondary border"
                                  >
                                    {`${formatTime(h.inicio)}-${formatTime(h.fin)}`}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <small className="text-muted">Abierto</small>
                            )}
                          </td>
                          <td className="text-end py-3">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEdit(svc)}
                                disabled={!canManage}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => handleToggleEstado(svc)}
                                disabled={!canManage}
                              >
                                {(svc.estado || "").toLowerCase() === "activo" ? "Inactivar" : "Activar"}
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(svc.id)}
                                disabled={!canManage}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminServices;
