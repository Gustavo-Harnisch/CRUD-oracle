// src/pages/LoginPage.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormField from "../components/FormField";
import PasswordField from "../components/PasswordField";
import { useAuth } from "../context/AuthContext";

const Card = ({ title, children, footer }) => (
  <div className="card shadow-sm w-100" style={{ maxWidth: "460px" }}>
    <div className="card-body">
      <h1 className="h4 mb-3 text-center">{title}</h1>
      {children}
    </div>
    {footer && <div className="card-footer bg-white text-center">{footer}</div>}
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    apellido1: "",
    apellido2: "",
    telefono: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const action = isRegisterMode ? register : login;
      const payload = isRegisterMode
        ? {
            name: formData.name,
            apellido1: formData.apellido1,
            apellido2: formData.apellido2,
            telefono: formData.telefono,
            email: formData.email,
            password: formData.password,
            role: "USER",
          }
        : { email: formData.email, password: formData.password };

      const auth = await action(payload);
      const userRoles = Array.isArray(auth?.user?.roles)
        ? auth.user.roles.map((r) => String(r).toUpperCase())
        : auth?.user?.role
          ? [String(auth.user.role).toUpperCase()]
          : [];
      const fallback = userRoles.includes("ADMIN") ? "/admin" : "/";
      const redirectTo = location.state?.from?.pathname || fallback;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo iniciar sesión. Verifica tus credenciales.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <Card
        title={isRegisterMode ? "Crear cuenta" : "Iniciar sesión"}
        footer={
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={() => {
              setIsRegisterMode((prev) => !prev);
              setError(null);
            }}
          >
            {isRegisterMode ? "¿Ya tienes cuenta? Inicia sesión" : "¿Nuevo? Crea una cuenta"}
          </button>
        }
      >
        <form onSubmit={handleSubmit}>
          {isRegisterMode && (
            <>
              <FormField
                id="name"
                name="name"
                label="Nombre"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <FormField
                id="apellido1"
                name="apellido1"
                label="Apellido paterno"
                type="text"
                value={formData.apellido1}
                onChange={handleChange}
                required
              />
              <FormField
                id="apellido2"
                name="apellido2"
                label="Apellido materno (opcional)"
                type="text"
                value={formData.apellido2}
                onChange={handleChange}
              />
              <FormField
                id="telefono"
                name="telefono"
                label="Teléfono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                required
              />
            </>
          )}

          <FormField
            id="email"
            name="email"
            label="Correo electrónico"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <PasswordField
            id="password"
            name="password"
            label="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && <div className="alert alert-danger">{error}</div>}

          <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
            {isSubmitting
              ? isRegisterMode
                ? "Creando cuenta..."
                : "Ingresando..."
              : isRegisterMode
                ? "Crear cuenta"
                : "Entrar"}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
