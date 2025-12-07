import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserForm from "../components/UserForm";
import { getUserById, updateUser } from "../services/userService";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState({
    rut: "",
    name: "",
    apellido1: "",
    apellido2: "",
    telefono: "",
    email: "",
    role: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setError(null);
      try {
        const { data } = await getUserById(id);
        setInitialValues({
          rut: data?.id ? String(data.id) : "",
          name: data?.name || "",
          apellido1: data?.apellido1 || "",
          apellido2: data?.apellido2 || "",
          telefono: data?.telefono ? String(data.telefono) : "",
          email: data?.email || "",
          role: Array.isArray(data?.roles) && data.roles.length ? data.roles[0] : data?.role || "",
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

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { password, rut, ...rest } = formData;
      const payloadBase = password ? { ...rest, password } : rest; // No enviar contraseña vacía
      const payload = {
        ...payloadBase,
        roles: payloadBase.role ? [String(payloadBase.role).toUpperCase()] : ["USER"],
      };
      await updateUser(id, payload);
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

      <UserForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
        submitLabel="Actualizar usuario"
        onCancel={() => navigate("/admin/users")}
        rutDisabled
        passwordOptional
      />
    </div>
  );
};

export default EditUser;
