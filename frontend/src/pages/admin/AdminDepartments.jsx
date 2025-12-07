import { useMemo, useState } from "react";
import { PAGE_STATUS, getStatusClasses } from "../../utils/pageStatus";

// Estado EDITING: datos locales a la espera de procs /api/departments.
const sampleDepartments = [
  { id: 1, nombre: "Operaciones", jefe: "María Torres", empleados: 8, presupuesto: 1200000 },
  { id: 2, nombre: "Limpieza", jefe: "Juan Pérez", empleados: 5, presupuesto: 450000 },
  { id: 3, nombre: "Recepción", jefe: "Ana Ruiz", empleados: 4, presupuesto: 380000 },
];

const emptyForm = { nombre: "", jefe: "", presupuesto: "" };

const AdminDepartments = () => {
  const [departments] = useState(sampleDepartments);
  const [filters, setFilters] = useState({ search: "", jefe: "" });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const filtered = useMemo(() => {
    return departments.filter((d) => {
      const s = filters.search
        ? `${d.nombre} ${d.jefe}`.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const j = filters.jefe ? (d.jefe || "").toLowerCase().includes(filters.jefe.toLowerCase()) : true;
      return s && j;
    });
  }, [departments, filters]);

  const handleEditMock = (dep) => {
    setEditingId(dep.id);
    setForm({ nombre: dep.nombre, jefe: dep.jefe, presupuesto: dep.presupuesto });
  };

  const handleReset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="container-xxl py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <p className="text-uppercase text-muted small mb-1">Admin · Departamentos</p>
          <h1 className="h4 mb-1">Áreas y responsables</h1>
          <p className="text-muted small mb-0">
            Estado EDITING: conecta a procs /departments cuando estén listos.
          </p>
        </div>
        <span className={`badge ${getStatusClasses(PAGE_STATUS.EDITING)}`}>{PAGE_STATUS.EDITING}</span>
      </div>

      <div className="row g-3 g-xl-4 align-items-start">
        <div className="col-lg-5 col-xl-4">
          <div className="card shadow-sm h-100">
            <div className="card-body p-4 p-xl-5">
              <h2 className="h6 mb-4">{editingId ? "Editar departamento" : "Nuevo departamento"}</h2>
              <form className="row g-3">
                <div className="col-12">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.nombre}
                    onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Jefe / Responsable</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.jefe}
                    onChange={(e) => setForm((p) => ({ ...p, jefe: e.target.value }))}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Presupuesto / Saldo</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.presupuesto}
                    onChange={(e) => setForm((p) => ({ ...p, presupuesto: e.target.value }))}
                  />
                </div>
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="button" disabled>
                    Guardar (pendiente backend)
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
                    placeholder="Responsable"
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
                      <th>Jefe</th>
                      <th>Empleados</th>
                      <th>Presupuesto</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d) => (
                      <tr key={d.id}>
                        <td className="py-3">{d.id}</td>
                        <td className="py-3 fw-semibold">{d.nombre}</td>
                        <td className="py-3 text-muted">{d.jefe}</td>
                        <td className="py-3">{d.empleados}</td>
                        <td className="py-3">$ {Number(d.presupuesto || 0).toLocaleString()}</td>
                        <td className="text-end py-3">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary" type="button" onClick={() => handleEditMock(d)}>
                              Editar
                            </button>
                            <button className="btn btn-outline-danger" type="button" disabled>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-3 text-muted small">
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
