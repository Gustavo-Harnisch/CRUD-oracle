// src/pages/CrearUsuario.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../services/userService";
import { fetchRoles, assignUsuarioRol } from "../services/adminService";

const CrearUsuario = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });
  const [roles, setRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await fetchRoles();
        const list = res?.data?.data || res?.data || [];
        setRoles(Array.isArray(list) ? list : []);
      } catch (err) {
        /* ignore roles load errors */
      }
    };
    loadRoles();
  }, []);

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
        contrasena: formData.password,
      };
      const res = await createUser(body); // crea en BD
      const newId = res?.data?.id ?? res?.data?.data?.id;
      if (formData.role && newId) {
        // asigna rol seleccionado en tabla de asignaciones
        await assignUsuarioRol({ cod_usuario: Number(newId), cod_rol: Number(formData.role) });
      }
      navigate("/admin/users");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo crear el usuario. Revisa los datos e intenta nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Crear usuario</h1>

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
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar usuario"}
        </button>
      </form>
    </div>
  );
};

export default CrearUsuario;
