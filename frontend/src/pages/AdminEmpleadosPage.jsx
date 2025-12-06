import { useEffect, useState } from "react";
import { fetchEmployees, createEmployee, fetchUsers } from "../services/adminService";

const AdminEmpleadosPage = () => {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    cargo: "",
    fecha_contratacion: "",
    salario: "",
    comision: "",
    cod_usuario: "",
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    const [emps, usrs] = await Promise.allSettled([fetchEmployees(), fetchUsers()]);
    setEmployees(emps.status === "fulfilled" ? emps.value?.data?.data || [] : []);
    setUsers(usrs.status === "fulfilled" ? usrs.value?.data?.data || [] : []);
    if (emps.status === "rejected" || usrs.status === "rejected") {
      setError("No se pudieron cargar empleados/usuarios");
      console.error("Admin empleados error", emps.reason || usrs.reason);
    } else {
      setError(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEmployee({
        cargo: form.cargo,
        fecha_contratacion: form.fecha_contratacion,
        salario: Number(form.salario || 0),
        comision: Number(form.comision || 0),
        cod_usuario: form.cod_usuario ? Number(form.cod_usuario) : null,
      });
      setMessage("Empleado creado");
      setForm({ cargo: "", fecha_contratacion: "", salario: "", comision: "", cod_usuario: "" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el empleado");
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Empleados</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Crear empleado</h5>
          <form className="row g-2 align-items-end" onSubmit={handleSubmit}>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Cargo"
                value={form.cargo}
                onChange={(e) => setForm((p) => ({ ...p, cargo: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={form.fecha_contratacion}
                onChange={(e) => setForm((p) => ({ ...p, fecha_contratacion: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Salario"
                value={form.salario}
                onChange={(e) => setForm((p) => ({ ...p, salario: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Comisión"
                value={form.comision}
                onChange={(e) => setForm((p) => ({ ...p, comision: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={form.cod_usuario}
                onChange={(e) => setForm((p) => ({ ...p, cod_usuario: e.target.value }))}
              >
                <option value="">Usuario (opcional)</option>
                {users.map((u) => (
                  <option key={u.COD_USUARIO} value={u.COD_USUARIO}>
                    {u.COD_USUARIO} - {u.NOMBRE_USUARIO}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-1">
              <button className="btn btn-primary w-100" type="submit">
                Crear
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Listado</h5>
          <div className="table-responsive" style={{ maxHeight: "400px" }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cargo</th>
                  <th>Cod usuario</th>
                  <th>Salario</th>
                  <th>Comisión</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.COD_EMPLEADO}>
                    <td>{e.COD_EMPLEADO}</td>
                    <td>{e.CARGO_EMPLEADO}</td>
                    <td>{e.COD_USUARIO}</td>
                    <td>{e.SALARIO}</td>
                    <td>{e.COMISION}</td>
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

export default AdminEmpleadosPage;
