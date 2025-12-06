// src/pages/Usuarios.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteUser, getUsers } from "../services/userService";
import {
  fetchRoles,
  fetchUsuarioRoles,
  assignUsuarioRol,
  deleteUsuarioRol,
} from "../services/adminService";

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [usuarioRoles, setUsuarioRoles] = useState([]);
  const [roleAssignments, setRoleAssignments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [savingRoleId, setSavingRoleId] = useState(null);

  const rolesMap = useMemo(() => {
    // Mapa de rol_id -> nombre para desplegar en lista
    const map = {};
    roles.forEach((r) => {
      map[r.COD_ROL] = r.NOMBRE_ROL;
    });
    return map;
  }, [roles]);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Carga usuarios + roles + asignaciones en paralelo
        const [uRes, rRes, urRes] = await Promise.all([
          getUsers(),
          fetchRoles(),
          fetchUsuarioRoles(),
        ]);

        const list = uRes?.data?.data || uRes?.data || [];
        const normalized = Array.isArray(list)
          ? list.map((u) => ({
              id: u.COD_USUARIO ?? u.id,
              name: u.NOMBRE_USUARIO ?? u.name,
              email: u.EMAIL_USUARIO ?? u.email,
            }))
          : [];
        setUsers(normalized);
        const roleList = rRes?.data?.data || rRes?.data || [];
        setRoles(Array.isArray(roleList) ? roleList : []);
        const urList = urRes?.data?.data || urRes?.data || [];
        setUsuarioRoles(Array.isArray(urList) ? urList : []);
        const map = {};
        (Array.isArray(urList) ? urList : []).forEach((ur) => {
          if (map[ur.COD_USUARIO] == null) map[ur.COD_USUARIO] = ur.COD_ROL;
        });
        setRoleAssignments(map);
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

  const handleRoleChange = async (userId, newRoleId) => {
    const numRole = newRoleId ? Number(newRoleId) : null;
    setSavingRoleId(userId);
    setError(null);
    try {
      // Quitamos asignaciones previas y dejamos solo la elegida
      const currentRoles = usuarioRoles.filter((ur) => ur.COD_USUARIO === userId);
      const tasks = [];
      currentRoles.forEach((ur) => {
        if (!numRole || ur.COD_ROL !== numRole) {
          tasks.push(deleteUsuarioRol(userId, ur.COD_ROL));
        }
      });
      if (numRole && !currentRoles.find((ur) => ur.COD_ROL === numRole)) {
        tasks.push(assignUsuarioRol({ cod_usuario: userId, cod_rol: numRole }));
      }
      if (tasks.length > 0) {
        await Promise.all(tasks);
      }

      // refresca asignaciones
      const urRes = await fetchUsuarioRoles();
      const urList = urRes?.data?.data || urRes?.data || [];
      setUsuarioRoles(Array.isArray(urList) ? urList : []);
      const map = {};
      (Array.isArray(urList) ? urList : []).forEach((ur) => {
        if (map[ur.COD_USUARIO] == null) map[ur.COD_USUARIO] = ur.COD_ROL;
      });
      setRoleAssignments(map);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo actualizar el rol");
    } finally {
      setSavingRoleId(null);
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
              <th>Rol</th>
              <th style={{ width: "160px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="5" className="text-center py-3">
                  Cargando usuarios...
                </td>
              </tr>
            )}

            {!isLoading && error && (
              <tr>
                <td colSpan="5" className="text-danger py-3">
                  {error}
                </td>
              </tr>
            )}

            {!isLoading && !error && users.length === 0 && (
              <tr>
                <td colSpan="5" className="text-muted py-3">
                  No hay usuarios aún.
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ minWidth: 180 }}>
                    <select
                      className="form-select form-select-sm"
                      value={roleAssignments[u.id] || ""}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={savingRoleId === u.id || roles.length === 0}
                    >
                      <option value="">Sin rol</option>
                      {roles.map((r) => (
                        <option key={r.COD_ROL} value={r.COD_ROL}>
                          {r.NOMBRE_ROL}
                        </option>
                      ))}
                    </select>
                  </td>
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
