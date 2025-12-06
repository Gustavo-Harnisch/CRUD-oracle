import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const TextField = ({ id, label, ...props }) => (
  <div className="mb-3">
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <input id={id} className="form-control" {...props} />
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido1: "",
    apellido2: "",
    email: "",
    telefono: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const initialRegister = location.state?.mode === "register";
  const [isRegisterMode, setIsRegisterMode] = useState(initialRegister);
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
            nombre: formData.nombre,
            apellido1: formData.apellido1 || null,
            apellido2: formData.apellido2 || null,
            email: formData.email,
            telefono: formData.telefono || null,
            contrasena: formData.password
          }
        : { email: formData.email, password: formData.password };

      const auth = await action(payload);
      const fallback = auth?.user?.COD_ROL === 1 ? "/admin" : "/";
      const redirectTo = location.state?.from?.pathname || fallback;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (isRegisterMode
            ? "No se pudo registrar. Revisa los datos."
            : "No se pudo iniciar sesion. Verifica tus credenciales.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <Card
        title={isRegisterMode ? "Crear cuenta" : "Iniciar sesion"}
        footer={
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={() => {
              setIsRegisterMode((prev) => !prev);
              setError(null);
            }}
          >
            {isRegisterMode ? "Ya tienes cuenta? Inicia sesion" : "Nuevo? Crea una cuenta"}
          </button>
        }
      >
        <form onSubmit={handleSubmit}>
          {isRegisterMode && (
            <>
              <TextField
                id="nombre"
                name="nombre"
                label="Nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              <TextField
                id="apellido1"
                name="apellido1"
                label="Apellido paterno (opcional)"
                type="text"
                value={formData.apellido1}
                onChange={handleChange}
              />
              <TextField
                id="apellido2"
                name="apellido2"
                label="Apellido materno (opcional)"
                type="text"
                value={formData.apellido2}
                onChange={handleChange}
              />
              <TextField
                id="telefono"
                name="telefono"
                label="Telefono (opcional)"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
              />
            </>
          )}

          <TextField
            id="email"
            name="email"
            label="Correo electronico"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="mb-3">
            <label className="form-label" htmlFor="password">
              Contrasena
            </label>
            <div className="input-group">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

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
