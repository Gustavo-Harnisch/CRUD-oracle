import { memo, useCallback, useEffect, useState } from "react";
import FormField from "./FormField";
import PasswordField from "./PasswordField";

const defaultValues = {
  name: "",
  apellido1: "",
  apellido2: "",
  telefono: "",
  email: "",
  role: "USER",
  password: "",
};

const UserForm = memo(
  ({
    initialValues = defaultValues,
    onSubmit,
    isSubmitting = false,
    error = null,
    submitLabel = "Guardar",
    onCancel,
    includePassword = true,
    passwordOptional = false,
  }) => {
    const [formData, setFormData] = useState({ ...defaultValues, ...initialValues });

    useEffect(() => {
      setFormData({ ...defaultValues, ...initialValues });
    }, [initialValues]);

    const handleChange = useCallback((event) => {
      const { name, value } = event.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(
      (event) => {
        event.preventDefault();
        onSubmit?.(formData);
      },
      [formData, onSubmit],
    );

    return (
      <form onSubmit={handleSubmit} className="card card-body" style={{ maxWidth: "600px" }}>
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

        <FormField
          id="email"
          name="email"
          label="Correo electrónico"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <FormField
          id="role"
          name="role"
          label="Rol"
          as="select"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona un rol</option>
          <option value="ADMIN">Admin</option>
          <option value="EMPLOYEE">Empleado</option>
          <option value="USER">Usuario</option>
        </FormField>

        {includePassword && (
          <PasswordField
            id="password"
            name="password"
            label={passwordOptional ? "Contraseña (opcional)" : "Contraseña"}
            value={formData.password}
            onChange={handleChange}
            required={!passwordOptional}
            placeholder={passwordOptional ? "Deja en blanco para no cambiarla" : ""}
          />
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : submitLabel}
          </button>

          {onCancel && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    );
  },
);

UserForm.displayName = "UserForm";

export default UserForm;
