// src/pages/CreateUser.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserForm from "../components/UserForm";
import { createUser } from "../services/userService";

const CreateUser = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    const rutDigits = (formData.rut || "").replace(/\D/g, "");
    if (!rutDigits || rutDigits.length < 7 || rutDigits.length > 8) {
      setError("RUT inválido. Usa 7-8 dígitos sin puntos ni DV.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        codUsuario: rutDigits,
        roles: formData.role ? [String(formData.role).toUpperCase()] : ["USER"],
      };
      await createUser(payload);
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

      <UserForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
        submitLabel="Guardar usuario"
      />
    </div>
  );
};

export default CreateUser;
