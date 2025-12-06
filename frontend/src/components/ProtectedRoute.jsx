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

  if (roles.length > 0 && user) {
    const role = user.role || user.ROL || user.COD_ROL || user.codRol;
    const matches =
      role === undefined
        ? false
        : roles.includes(role) ||
          roles.includes(String(role)) ||
          (String(role).toLowerCase() === "1" && roles.includes("admin"));
    if (!matches) return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
