import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "../services/userService";
import { fetchRoles, fetchUsuarioRoles, assignUsuarioRol, deleteUsuarioRol } from "../services/adminService";

const EditarUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });
  const [roles, setRoles] = useState([]);
  const [usuarioRoles, setUsuarioRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setError(null);
      try {
        // Carga usuario + catálogo de roles + asignaciones para precargar select
        const [userRes, rolesRes, urRes] = await Promise.all([
          getUserById(id),
          fetchRoles(),
          fetchUsuarioRoles(),
        ]);
        const user = userRes?.data?.data || userRes?.data || {};
        const listRoles = rolesRes?.data?.data || rolesRes?.data || [];
        setRoles(Array.isArray(listRoles) ? listRoles : []);
        const listUr = urRes?.data?.data || urRes?.data || [];
        setUsuarioRoles(Array.isArray(listUr) ? listUr : []);
        const assigned = (Array.isArray(listUr) ? listUr : []).find(
          (ur) => String(ur.COD_USUARIO) === String(id)
        );
        setFormData({
          name: user.NOMBRE_USUARIO ?? user.name ?? "",
          email: user.EMAIL_USUARIO ?? user.email ?? "",
          role: assigned ? String(assigned.COD_ROL) : "",
          password: "",
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "No se pudo cargar el usuario. Intenta nuevamente.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const body = {
        nombre: formData.name,
        email: formData.email,
      };
      if (formData.password) {
        body.contrasena = formData.password;
      }
      await updateUser(id, body); // actualiza datos base

      // Actualiza rol: elimina actuales y asigna el nuevo (si hay)
      const currentAssignments = usuarioRoles.filter((ur) => String(ur.COD_USUARIO) === String(id));
      const targetRole = formData.role ? Number(formData.role) : null;

      const tasks = [];
      currentAssignments.forEach((ur) => {
        if (!targetRole || ur.COD_ROL !== targetRole) {
          tasks.push(deleteUsuarioRol(Number(id), ur.COD_ROL));
        }
      });
      if (targetRole && !currentAssignments.find((ur) => ur.COD_ROL === targetRole)) {
        tasks.push(assignUsuarioRol({ cod_usuario: Number(id), cod_rol: targetRole }));
      }
      if (tasks.length) {
        await Promise.all(tasks);
      }

      navigate("/admin/users");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo actualizar el usuario. Revisa los datos e intenta nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-4">
        <p className="text-muted mb-0">Cargando usuario...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Editar usuario</h1>

      <form onSubmit={handleSubmit} className="card card-body" style={{ maxWidth: "600px" }}>
        <div className="mb-3">
          <label className="form-label" htmlFor="name">
            Nombre completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="role">
            Rol
          </label>
          <select
            id="role"
            name="role"
            className="form-select"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un rol</option>
            {roles.map((r) => (
              <option key={r.COD_ROL} value={r.COD_ROL}>
                {r.NOMBRE_ROL}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="password">
            Contraseña (opcional)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            placeholder="Deja en blanco para no cambiarla"
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Actualizar usuario"}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/admin/users")}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarUsuario;
