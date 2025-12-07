// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateRegister = () => {
    const rutDigits = formData.rut.replace(/\D/g, "");
    if (!rutDigits || !rutRegex.test(rutDigits)) {
      return "RUT inválido. Usa 7-8 dígitos sin puntos ni dígito verificador.";
    }
    if (!formData.name.trim() || !formData.apellido1.trim()) {
      return "Nombre y apellido paterno son obligatorios.";
    }
    if (!formData.email.trim() || !formData.password) {
      return "Correo y contraseña son obligatorios.";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Las contraseñas no coinciden.";
    }
    if (formData.telefono && !phoneRegex.test(formData.telefono.trim())) {
      return "Teléfono inválido, usa 7-15 dígitos sin símbolos.";
    }
    return null;
  };

  const resolveRedirect = (roles) => {
    if (roles.includes("ADMIN")) return "/admin/home";
    if (roles.includes("EMPLOYEE")) return "/employee/home";
    return "/customer/home";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (isRegisterMode) {
      const validationError = validateRegister();
      if (validationError) {
        setError(validationError);
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
    <div className="container py-5 d-flex justify-content-center">
      <Card
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
              />
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
                required={false}
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

          {isRegisterMode && (
            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
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
  );
};

export default LoginPage;
