import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ roles = [], children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="container py-5">
        <p className="text-muted mb-0">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length > 0) {
    const userRoles = Array.isArray(user?.roles)
      ? user.roles.map((r) => String(r).toUpperCase())
      : user?.role
        ? [String(user.role).toUpperCase()]
        : [];
    const required = roles.map((r) => String(r).toUpperCase());
    const hasRequired = required.some((r) => userRoles.includes(r));

    // Si no hay usuario o no tiene los roles requeridos, redirigimos.
    if (!hasRequired) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  }

  return children;
};

export default ProtectedRoute;
