// src/pages/customer/CustomerDashboard.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CustomerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container py-4">
      <div className="mb-4">
        <p className="text-uppercase text-muted mb-1">Área de cliente</p>
        <h1 className="h4 mb-0">Bienvenido, {user?.name || "Cliente"}</h1>
        <p className="text-muted small">
          Aquí podrás revisar tus reservas, pagos y contacto directo con el equipo.
        </p>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Nueva reserva</h5>
              <p className="card-text text-muted flex-grow-1">
                Selecciona fechas y tipo de habitación para calcular tu estadía.
              </p>
              <Link to="/customer/reservations" className="btn btn-primary btn-sm align-self-start">
                Reservar ahora
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Mis reservas</h5>
              <p className="card-text text-muted flex-grow-1">
                Consulta el estado de tus reservas actuales y pasadas.
              </p>
              <Link to="/customer/bookings" className="btn btn-primary btn-sm align-self-start">
                Ver historial
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Pagos y boletas</h5>
              <p className="card-text text-muted flex-grow-1">
                Revisa pagos, montos y métodos utilizados en tus estadías.
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
              <h5 className="card-title">Soporte</h5>
              <p className="card-text text-muted flex-grow-1">
                ¿Dudas o cambios? Escríbenos directamente desde contacto.
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

export default CustomerDashboard;
