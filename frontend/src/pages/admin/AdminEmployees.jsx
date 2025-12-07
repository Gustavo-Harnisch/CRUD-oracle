import { useEffect, useMemo, useState } from "react";
import { createEmployee, deleteEmployee, listEmployees, updateEmployee } from "../../services/employeeService";
import { listDepartments } from "../../services/departmentService";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  usuarioId: "",
  nombre: "",
  rol: "",
  email: "",
  sueldo: "",
  estado: "ACTIVO",
  departamento: "",
  fechaContratacion: "",
};

const AdminEmployees = () => {
  const { logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", rol: "", estado: "", soloIncompletos: false });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [highlightMissing, setHighlightMissing] = useState(true);
  const [departments, setDepartments] = useState([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listEmployees();
      setEmployees(data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        logout();
        window.location.href = "/login";
      } else {
        setError("No se pudieron cargar los empleados.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await listDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("No se pudieron cargar departamentos", err);
    }
  };

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const s = filters.search
        ? `${e.nombre || ""} ${e.email || ""}`.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const r = filters.rol ? (e.cargo || "").toLowerCase() === filters.rol.toLowerCase() : true;
      const estadoValue = e.estadoLaboral || e.estado || "";
      const st = filters.estado ? estadoValue.toUpperCase() === filters.estado.toUpperCase() : true;
      const inc = filters.soloIncompletos ? e.incompleto : true;
      return s && r && st && inc;
    });
  }, [employees, filters]);

  const handleEdit = (emp) => {
    setEditingId(emp.id || null);
    setForm({
      usuarioId: emp.usuarioId || "",
      nombre: emp.nombre,
      rol: emp.cargo,
      email: emp.email,
      sueldo: emp.sueldoBase,
      estado: emp.estadoLaboral || emp.estado || "ACTIVO",
      departamento: emp.departamentoId ? String(emp.departamentoId) : emp.departamento || "NONE",
      fechaContratacion: emp.fechaContratacion ? emp.fechaContratacion.slice(0, 10) : "",
    });
  };

  const handleReset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        usuarioId: Number(form.usuarioId),
        cargo: form.rol,
        sueldoBase: form.sueldo === "" ? null : Number(form.sueldo),
        fechaContratacion: form.fechaContratacion || new Date().toISOString().slice(0, 10),
        departamentoId: form.departamento && form.departamento !== "NONE" ? Number(form.departamento) : null,
        estadoLaboral: form.estado,
      };
      if (editingId) {
        await updateEmployee(editingId, payload);
      } else {
        await createEmployee(payload);
      }
      await load();
      handleReset();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        logout();
        window.location.href = "/login";
      } else {
        setError(err?.response?.data?.message || "No se pudo guardar el empleado.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este empleado?")) return;
    setError("");
    try {
      await deleteEmployee(id);
      await load();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        logout();
        window.location.href = "/login";
      } else {
        setError(err?.response?.data?.message || "No se pudo eliminar.");
      }
    }
  };

  return (
    <div className="container-xxl py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <p className="text-uppercase text-muted small mb-1">Admin · Empleados</p>
          <h1 className="h4 mb-1">Equipo y accesos</h1>
          <p className="text-muted small mb-0">Solo ADMIN gestiona altas/bajas de empleados.</p>
        </div>
        {loading && <span className="badge bg-warning-subtle text-warning border">Cargando…</span>}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 g-xl-4 align-items-start">
        <div className="col-lg-5 col-xl-4">
          <div className="card shadow-sm h-100">
            <div className="card-body p-4 p-xl-5">
              <h2 className="h6 mb-4">{editingId ? "Editar empleado" : "Nuevo empleado"}</h2>
              <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-12">
                  <label className="form-label">Usuario ID</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={form.usuarioId}
                    onChange={(e) => setForm((p) => ({ ...p, usuarioId: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Nombre completo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.nombre}
                    onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Rol/área</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.rol}
                    onChange={(e) => setForm((p) => ({ ...p, rol: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Sueldo base</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.sueldo}
                    onChange={(e) => setForm((p) => ({ ...p, sueldo: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Departamento</label>
                  <select
                    className="form-select"
                    value={form.departamento}
                    onChange={(e) => setForm((p) => ({ ...p, departamento: e.target.value }))}
                  >
                    <option value="NONE">Sin departamento</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Fecha de contratación</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.fechaContratacion}
                    onChange={(e) => setForm((p) => ({ ...p, fechaContratacion: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={form.estado}
                    onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value }))}
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    Guardar
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
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
                  <p className="text-muted small mb-0">Filtra por rol, estado o nombre.</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-sm btn-outline-secondary px-3"
                    type="button"
                    onClick={() => setFilters({ search: "", rol: "", estado: "" })}
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
                    placeholder="Nombre o email"
                    value={filters.search}
                    onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                  />
                </div>
                <div className="col-6 col-lg-4">
                  <label className="form-label small text-muted mb-1">Rol/área</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Recepción"
                    value={filters.rol}
                    onChange={(e) => setFilters((p) => ({ ...p, rol: e.target.value }))}
                  />
                </div>
                <div className="col-6 col-lg-2">
                  <label className="form-label small text-muted mb-1">Estado</label>
                  <select
                    className="form-select"
                    value={filters.estado}
                    onChange={(e) => setFilters((p) => ({ ...p, estado: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
                <div className="col-6 col-lg-2">
                  <label className="form-label small text-muted mb-1">Validación</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="filtroIncompletos"
                      checked={filters.soloIncompletos}
                      onChange={(e) => setFilters((p) => ({ ...p, soloIncompletos: e.target.checked }))}
                    />
                    <label className="form-check-label small text-muted" htmlFor="filtroIncompletos">
                      Solo incompletos
                    </label>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Rol/área</th>
                      <th>Email</th>
                      <th>Departamento</th>
                      <th>Sueldo base</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={8} className="py-3 text-muted">
                          Cargando...
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      filtered.map((e) => (
                        <tr
                          key={`${e.id || "usr"}-${e.usuarioId}`}
                          className={highlightMissing && e.incompleto ? "table-warning" : ""}
                        >
                          <td className="py-3">{e.id || "—"}</td>
                          <td className="py-3 fw-semibold">{e.nombre}</td>
                          <td className="py-3 text-muted">{e.cargo || e.rol || "—"}</td>
                          <td className="py-3">{e.email}</td>
                          <td className="py-3">{e.departamento || "NONE"}</td>
                          <td className="py-3">
                            {e.sueldoBase || e.sueldo
                              ? `$ ${Number(e.sueldoBase || e.sueldo || 0).toLocaleString()}`
                              : "—"}
                          </td>
                          <td className="py-3">
                            <span
                              className={
                                (e.estadoLaboral || e.estado || "ACTIVO").toUpperCase() === "ACTIVO"
                                  ? "badge bg-success-subtle text-success border"
                                  : "badge bg-secondary-subtle text-secondary border"
                              }
                            >
                              {e.estadoLaboral || e.estado || "ACTIVO"}
                            </span>
                          </td>
                          <td className="text-end py-3">
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary" type="button" onClick={() => handleEdit(e)}>
                                {e.id ? "Editar" : "Completar"}
                              </button>
                              <button className="btn btn-outline-danger" type="button" disabled={!e.id}>
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-3 text-muted small">
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

export default AdminEmployees;
