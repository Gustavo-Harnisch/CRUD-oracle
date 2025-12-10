// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../components/FormField";
import PasswordField from "../components/PasswordField";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const Card = ({ title, children, footer, className = "" }) => (
  <div className={`card shadow-sm w-100 ${className}`} style={{ maxWidth: "460px" }}>
    <div className="card-body">
      <h1 className="h4 mb-3 text-center">{title}</h1>
      {children}
    </div>
    {footer && <div className="card-footer bg-white text-center">{footer}</div>}
  </div>
);

const initialFormState = {
  rut: "",
  name: "",
  apellido1: "",
  apellido2: "",
  telefono: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const phoneRegex = /^[0-9]{7,15}$/;
const rutRegex = /^[0-9]{7,8}$/;

const loginHighlights = [
  "Soporte humano inmediato cuando lo necesites",
  "Tus datos seguros y listos para reservar en segundos",
  "Convertimos cada ingreso en una bienvenida personalizada",
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateRegister = () => {
    const errors = {};
    const rutDigits = formData.rut.replace(/\D/g, "");
    if (!rutDigits || !rutRegex.test(rutDigits)) {
      errors.rut = "RUT inválido. Usa 7-8 dígitos sin puntos ni dígito verificador.";
    }
    if (!formData.name.trim() || !formData.apellido1.trim()) {
      if (!formData.name.trim()) errors.name = "Nombre es obligatorio.";
      if (!formData.apellido1.trim()) errors.apellido1 = "Apellido paterno es obligatorio.";
    }
    if (!formData.email.trim() || !formData.password) {
      if (!formData.email.trim()) errors.email = "Correo es obligatorio.";
      if (!formData.password) errors.password = "Contraseña es obligatoria.";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }
    if (formData.telefono && !phoneRegex.test(formData.telefono.trim())) {
      errors.telefono = "Teléfono inválido, usa 7-15 dígitos sin símbolos.";
    }
    return errors;
  };

  const resolveRedirect = (roles) => {
    if (roles.includes("ADMIN")) return "/admin/home";
    if (roles.includes("EMPLOYEE")) return "/employee/home";
    return "/customer/home";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (isRegisterMode) {
      const validationError = validateRegister();
      if (Object.keys(validationError).length > 0) {
        setFieldErrors(validationError);
        setError(Object.values(validationError)[0]);
        return;
      }
    } else {
      const loginErrors = {};
      if (!formData.email.trim()) loginErrors.email = "Correo es obligatorio.";
      if (!formData.password) loginErrors.password = "Contraseña es obligatoria.";
      if (Object.keys(loginErrors).length > 0) {
        setFieldErrors(loginErrors);
        setError(Object.values(loginErrors)[0]);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const action = isRegisterMode ? register : login;
      const rutDigits = formData.rut.replace(/\D/g, "");
      const payload = isRegisterMode
        ? {
            codUsuario: rutDigits,
            name: formData.name,
            apellido1: formData.apellido1,
            apellido2: formData.apellido2,
            telefono: formData.telefono?.trim() || undefined,
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
      const redirectTo = resolveRedirect(userRoles);
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
    <div className="login-shell">
      <div className="login-panel">
        <div className="login-panel__form">
          <Card
            className="login-card"
            title={isRegisterMode ? "Crear cuenta" : "Iniciar sesión"}
            footer={
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => {
              setIsRegisterMode((prev) => !prev);
              setFormData((prev) => ({
                ...initialFormState,
                email: prev.email,
              }));
              setError(null);
              setFieldErrors({});
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
                id="rut"
                name="rut"
                label="RUT (sin DV ni puntos)"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{7,8}"
                value={formData.rut}
                onChange={handleChange}
                required
                placeholder="Ej: 12345678"
                className={fieldErrors.rut ? "is-invalid" : ""}
              />
              <FormField
                id="name"
                name="name"
                label="Nombre"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className={fieldErrors.name ? "is-invalid" : ""}
              />
              <FormField
                id="apellido1"
                name="apellido1"
                label="Apellido paterno"
                type="text"
                value={formData.apellido1}
                onChange={handleChange}
                required
                className={fieldErrors.apellido1 ? "is-invalid" : ""}
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
                required={false}
                className={fieldErrors.telefono ? "is-invalid" : ""}
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
            className={fieldErrors.email ? "is-invalid" : ""}
          />

          <PasswordField
            id="password"
            name="password"
            label="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
            isInvalid={fieldErrors.password}
          />

          {isRegisterMode && (
            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              isInvalid={fieldErrors.confirmPassword}
            />
          )}

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

    <div className="login-panel__aside">
      <div className="login-panel__badge">Residencial Maule</div>
      <h2>Accede a tu experiencia</h2>
      <p>
        Inicia sesión para ver tus reservas, pedir servicios adicionales o contactar al equipo. Si aún no tienes cuenta,
        crea una y mantenemos el contacto antes de tu llegada.
      </p>
      <ul className="login-highlight-list">
        {loginHighlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  </div>
</div>
);
};

export default LoginPage;
