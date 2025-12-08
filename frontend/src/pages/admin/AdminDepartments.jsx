import { useEffect, useMemo, useState } from "react";
import { PAGE_STATUS, getStatusClasses } from "../../utils/pageStatus";
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../services/departmentService";
import { useAuth } from "../../context/AuthContext";

const emptyForm = { id: null, nombre: "", jefeEmpleadoId: "", jefeUsuarioId: "" };

const AdminDepartments = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const roles = Array.isArray(user?.roles) ? user.roles.map((r) => String(r).toUpperCase()) : [];
  const canManage = isAuthenticated && roles.includes("ADMIN");

  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ search: "", jefe: "" });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await listDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("No autorizado o sesión expirada.");
        logout();
        window.location.href = "/login";
      } else {
        setError("No se pudieron cargar los departamentos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return departments.filter((d) => {
      const s = filters.search
        ? `${d.nombre || ""} ${d.jefeRut || ""} ${d.jefeEmpleadoId || ""}`
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        : true;
      const j = filters.jefe
        ? `${d.jefeRut || ""} ${d.jefeEmpleadoId || ""}`.toLowerCase().includes(filters.jefe.toLowerCase())
        : true;
      return s && j;
    });
  }, [departments, filters]);

  const handleEdit = (dep) => {
    setEditingId(dep.id);
    setForm({
      id: dep.id,
      nombre: dep.nombre || "",
      jefeEmpleadoId: dep.jefeEmpleadoId || "",
      jefeUsuarioId: dep.jefeRut || dep.jefeEmpleadoId || "",
      presupuesto: undefined,
    });
  };

  const handleReset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    setError("");
    setSaving(true);
    try {
      const payload = {
        nombre: String(form.nombre || "").trim(),
        jefeUsuarioId: form.jefeUsuarioId === "" ? null : Number(form.jefeUsuarioId),
        jefeEmpleadoId: form.jefeEmpleadoId === "" ? null : Number(form.jefeEmpleadoId),
        presupuesto: null,
      };
      if (!payload.nombre) {
        setError("Nombre requerido.");
        setSaving(false);
        return;
      }
      if (editingId) {
        await updateDepartment(editingId, payload);
      } else {
        await createDepartment(payload);
      }
      await load();
      handleReset();
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("No autorizado o sesión expirada.");
        logout();
        window.location.href = "/login";
      } else {
        setError(err?.response?.data?.message || "No se pudo guardar el departamento.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!canManage) return;
    if (!window.confirm("¿Eliminar este departamento?")) return;
    setError("");
    try {
      await deleteDepartment(id);
      await load();
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("No autorizado o sesión expirada.");
        logout();
        window.location.href = "/login";
      } else {
        setError(err?.response?.data?.message || "No se pudo eliminar.");
      }
    }
  };

  const highlightMissing = (dep) => !dep.jefeEmpleadoId || dep.jefeEmpleadoId === null;

  return (
    <div className="container-xxl py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <p className="text-uppercase text-muted small mb-1">Admin · Departamentos</p>
          <h1 className="h4 mb-1">Áreas y responsables</h1>
          <p className="text-muted small mb-0">
            Datos conectados a la base. Admin puede crear, editar y eliminar.
          </p>
        </div>
        <span className={`badge ${getStatusClasses(PAGE_STATUS.LIVE)}`}>{PAGE_STATUS.LIVE}</span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 g-xl-4 align-items-start">
        <div className="col-lg-5 col-xl-4">
          <div className="card shadow-sm h-100">
            <div className="card-body p-4 p-xl-5">
              <h2 className="h6 mb-4">{editingId ? "Editar departamento" : "Nuevo departamento"}</h2>
              <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-12">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.nombre}
                    onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                    required
                    disabled={!canManage}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Jefe / Responsable (RUT / ID usuario)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.jefeUsuarioId}
                    onChange={(e) => setForm((p) => ({ ...p, jefeUsuarioId: e.target.value }))}
                    placeholder="RUT o ID de usuario asociado"
                    disabled={!canManage}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Sueldo total (cálculo automático)</label>
                  <input type="text" className="form-control" value="Se calcula según empleados" readOnly />
                </div>
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="submit" disabled={saving || !canManage}>
                    {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-outline-secondary" onClick={handleReset} disabled={saving}>
                      Cancelar edición
                    </button>
                  )}
                  <button type="button" className="btn btn-outline-secondary ms-auto" onClick={load} disabled={loading}>
                    {loading ? "Cargando..." : "Recargar"}
                  </button>
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
                  <p className="text-muted small mb-0">Filtra por nombre o jefe.</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-sm btn-outline-secondary px-3"
                    type="button"
                    onClick={() => setFilters({ search: "", jefe: "" })}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>

              <div className="row g-3 mb-4 align-items-end">
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label small text-muted mb-1">Buscar</label>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Nombre o jefe"
                    value={filters.search}
                    onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label small text-muted mb-1">Jefe</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ID o RUT"
                    value={filters.jefe}
                    onChange={(e) => setFilters((p) => ({ ...p, jefe: e.target.value }))}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Departamento</th>
                      <th>Jefe ID</th>
                      <th>Jefe RUT</th>
                      <th>Empleados</th>
                      <th>Sueldo total</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={7} className="py-3 text-muted">
                          Cargando...
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      filtered.map((d) => (
                        <tr key={d.id} className={highlightMissing(d) ? "table-warning" : ""}>
                          <td className="py-3">{d.id}</td>
                          <td className="py-3 fw-semibold">{d.nombre}</td>
                          <td className="py-3 text-muted">{d.jefeEmpleadoId || "—"}</td>
                          <td className="py-3 text-muted">{d.jefeRut || "—"}</td>
                          <td className="py-3">{d.empleadosAsignados ?? "—"}</td>
                          <td className="py-3">
                            {d.sueldoTotal === null || d.sueldoTotal === undefined
                              ? "—"
                              : `$ ${Number(d.sueldoTotal || 0).toLocaleString()}`}
                          </td>
                          <td className="text-end py-3">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                type="button"
                                onClick={() => handleEdit(d)}
                                disabled={!canManage}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                type="button"
                                onClick={() => handleDelete(d.id)}
                                disabled={!canManage}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-3 text-muted small">
                          Sin resultados.
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
    </div>
  );
};

export default AdminDepartments;
