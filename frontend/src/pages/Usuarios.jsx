// src/pages/Usuarios.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AsyncTableState from "../components/AsyncTableState";
import { deleteUser, getUsers } from "../services/userService";

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Usuarios</h1>
        <Link to="/admin/users/create" className="btn btn-primary btn-sm">
          Crear usuario
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Roles</th>
              <th style={{ width: "160px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <AsyncTableState
              isLoading={isLoading}
              error={error}
              isEmpty={!isLoading && !error && users.length === 0}
              colSpan={6}
              loadingMessage="Cargando usuarios..."
              emptyMessage="No hay usuarios aún."
            />

            {!isLoading &&
              !error &&
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name} {u.apellido1} {u.apellido2}</td>
                  <td>{u.email}</td>
                  <td>{u.telefono || "-"}</td>
                  <td>{Array.isArray(u.roles) ? u.roles.join(", ") : u.role}</td>
                  <td className="d-flex gap-2">
                    <Link to={`/admin/users/${u.id}/edit`} className="btn btn-outline-secondary btn-sm">
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(u.id)}
                      disabled={deletingId === u.id}
                    >
                      {deletingId === u.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Usuarios;
