// src/pages/AdminUsers.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteUser, getUsers } from "../services/userService";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filters, setFilters] = useState({ search: "", role: "" });

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await getUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "No se pudieron cargar los usuarios. Intenta nuevamente.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("¿Eliminar este usuario?");
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);

    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo eliminar el usuario. Intenta nuevamente.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const searchTxt = filters.search.trim().toLowerCase();
      const role = filters.role.trim().toUpperCase();
      const name = `${u.name || ""} ${u.apellido1 || ""} ${u.apellido2 || ""}`.toLowerCase();
      const email = (u.email || "").toLowerCase();
      const tel = String(u.telefono || "");
      const rolesArray = Array.isArray(u.roles) ? u.roles.map((r) => String(r).toUpperCase()) : [];
      const matchesSearch = searchTxt ? name.includes(searchTxt) || email.includes(searchTxt) || tel.includes(searchTxt) : true;
      const matchesRole = role ? rolesArray.includes(role) || String(u.role || "").toUpperCase() === role : true;
      return matchesSearch && matchesRole;
    });
  }, [users, filters]);

  return (
    <div className="container-xxl py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <p className="text-uppercase text-muted small mb-1">Admin · Usuarios</p>
          <h1 className="h4 mb-1">Gestión de usuarios</h1>
          <p className="text-muted small mb-0">Filtra por nombre, correo o rol. Rol ADMIN requerido para editar.</p>
        </div>
        <Link to="/admin/users/create" className="btn btn-primary btn-sm mt-3 mt-md-0">
          Crear usuario
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end mb-3">
            <div className="col-12 col-md-5 col-lg-4">
              <label className="form-label small text-muted mb-1">Buscar</label>
              <input
                type="search"
                className="form-control"
                placeholder="Nombre, correo o teléfono"
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              />
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label small text-muted mb-1">Rol</label>
              <select
                className="form-select"
                value={filters.role}
                onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="ADMIN">ADMIN</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="USER">USER</option>
              </select>
            </div>
            <div className="col-6 col-md-2 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-3"
                onClick={() => setFilters({ search: "", role: "" })}
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Roles</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="text-muted py-3">
                      Cargando usuarios...
                    </td>
                  </tr>
                )}
                {!isLoading && filtered.length === 0 && !error && (
                  <tr>
                    <td colSpan={6} className="text-muted py-3">
                      Sin resultados.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  !error &&
                  filtered.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3">{u.id}</td>
                      <td className="py-3 fw-semibold">
                        {u.name} {u.apellido1} {u.apellido2}
                      </td>
                      <td className="py-3">{u.email}</td>
                      <td className="py-3">{u.telefono || "-"}</td>
                      <td className="py-3">
                        {Array.isArray(u.roles) ? (
                          <div className="d-flex flex-wrap gap-1">
                            {u.roles.map((r) => (
                              <span key={`${u.id}-${r}`} className="badge bg-light text-secondary border">
                                {r}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="badge bg-light text-secondary border">{u.role || "N/D"}</span>
                        )}
                      </td>
                      <td className="text-end py-3">
                        <div className="btn-group btn-group-sm">
                          <Link to={`/admin/users/${u.id}/edit`} className="btn btn-outline-primary">
                            Editar
                          </Link>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(u.id)}
                            disabled={deletingId === u.id}
                          >
                            {deletingId === u.id ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
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

export default AdminUsers;
