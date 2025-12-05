// src/pages/employee/EmployeeDashboard.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EmployeeDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container py-4">
      <div className="mb-4">
        <p className="text-uppercase text-muted mb-1">Panel de empleado</p>
        <h1 className="h4 mb-0">Hola, {user?.name || "Equipo"}</h1>
        <p className="text-muted small">
          Accede rápido a habitaciones, servicios y gestión interna.
        </p>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Habitaciones</h5>
              <p className="card-text text-muted flex-grow-1">
                Revisa disponibilidad, asignaciones y precios base.
              </p>
              <Link to="/rooms" className="btn btn-primary btn-sm align-self-start">
                Ver habitaciones
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Solicitudes admin</h5>
              <p className="card-text text-muted flex-grow-1">
                Pide acceso de administrador si necesitas gestionar usuarios.
              </p>
              <button className="btn btn-outline-secondary btn-sm" type="button" disabled>
                Próximamente
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Contacto rápido</h5>
              <p className="card-text text-muted flex-grow-1">
                Envíanos feedback o reporta incidencias internas.
              </p>
              <Link to="/contact" className="btn btn-outline-primary btn-sm align-self-start">
                Ir a contacto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
