import { useEffect, useState } from "react";
import { fetchRoles, createRol, deleteRol, fetchUsuarioRoles, assignUsuarioRol, deleteUsuarioRol, fetchUsers } from "../services/adminService";

const AdminRolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [usuarioRoles, setUsuarioRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [rolForm, setRolForm] = useState({ nombre: "" });
  const [usuarioRolForm, setUsuarioRolForm] = useState({ cod_usuario: "", cod_rol: "" });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    const calls = [fetchRoles(), fetchUsuarioRoles(), fetchUsers()];
    const results = await Promise.allSettled(calls);
    const take = (idx) => (results[idx].status === "fulfilled" ? results[idx].value?.data?.data || [] : []);

    setRoles(take(0));
    setUsuarioRoles(take(1));
    setUsers(take(2));
    const failed = results.find((r) => r.status === "rejected");
    setError(failed ? "No se pudieron cargar roles" : null);
    if (failed) console.error("Admin roles error", failed.reason);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRolSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRol({ nombre: rolForm.nombre });
      setMessage("Rol creado");
      setRolForm({ nombre: "" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el rol");
    }
  };

  const handleDeleteRol = async (id) => {
    try {
      await deleteRol(id);
      setMessage("Rol eliminado");
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo eliminar el rol");
    }
  };

  const handleUsuarioRolSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignUsuarioRol({
        cod_usuario: Number(usuarioRolForm.cod_usuario),
        cod_rol: Number(usuarioRolForm.cod_rol),
      });
      setMessage("Rol asignado");
      setUsuarioRolForm({ cod_usuario: "", cod_rol: "" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo asignar el rol");
    }
  };

  const handleDeleteUsuarioRol = async (usuarioId, rolId) => {
    try {
      await deleteUsuarioRol(usuarioId, rolId);
      setMessage("Rol quitado");
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo quitar el rol");
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Roles y asignaciones</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Crear rol</h5>
          <form className="row g-2 align-items-end" onSubmit={handleRolSubmit}>
            <div className="col-md-8">
              <input
                className="form-control"
                placeholder="Nombre del rol"
                value={rolForm.nombre}
                onChange={(e) => setRolForm((p) => ({ ...p, nombre: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100" type="submit">
                Crear
              </button>
            </div>
          </form>
          <div className="table-responsive mt-3" style={{ maxHeight: "220px" }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Rol</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.COD_ROL}>
                    <td>{r.COD_ROL}</td>
                    <td>{r.NOMBRE_ROL}</td>
                    <td>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteRol(r.COD_ROL)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Asignar rol a usuario</h5>
          <form className="row g-2 align-items-end" onSubmit={handleUsuarioRolSubmit}>
            <div className="col-md-5">
              <select
                className="form-select"
                value={usuarioRolForm.cod_usuario}
                onChange={(e) => setUsuarioRolForm((p) => ({ ...p, cod_usuario: e.target.value }))}
                required
              >
                <option value="">Usuario</option>
                {users.map((u) => (
                  <option key={u.COD_USUARIO} value={u.COD_USUARIO}>
                    {u.COD_USUARIO} - {u.NOMBRE_USUARIO}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-5">
              <select
                className="form-select"
                value={usuarioRolForm.cod_rol}
                onChange={(e) => setUsuarioRolForm((p) => ({ ...p, cod_rol: e.target.value }))}
                required
              >
                <option value="">Rol</option>
                {roles.map((r) => (
                  <option key={r.COD_ROL} value={r.COD_ROL}>
                    {r.COD_ROL} - {r.NOMBRE_ROL}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" type="submit">
                Asignar
              </button>
            </div>
          </form>
          <div className="table-responsive mt-3" style={{ maxHeight: "240px" }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usuarioRoles.map((ur) => (
                  <tr key={`${ur.COD_USUARIO}-${ur.COD_ROL}`}>
                    <td>{ur.COD_USUARIO}</td>
                    <td>{ur.COD_ROL}</td>
                    <td>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteUsuarioRol(ur.COD_USUARIO, ur.COD_ROL)}
                      >
                        Quitar
                      </button>
                    </td>
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

export default AdminRolesPage;
