// src/pages/employee/EmployeeDashboard.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const employeeCards = [
  {
    id: "agenda",
    title: "Agenda y eventos",
    text: "Organiza check-ins, check-outs y bloqueos diarios.",
    linkHref: "/employee/agenda",
    linkLabel: "Ir a agenda",
  },
  {
    id: "clients",
    title: "Clientes y check-in",
    text: "Consulta llegadas, salidas y asignaciones pendientes.",
    linkHref: "/employee/clients",
    linkLabel: "Ver clientes",
  },
  {
    id: "requests",
    title: "Peticiones de huéspedes",
    text: "Centraliza solicitudes y asigna responsables.",
    linkHref: "/employee/requests",
    linkLabel: "Gestionar peticiones",
  },
  {
    id: "rooms",
    title: "Habitaciones",
    text: "Revisa disponibilidad y tarifas para apoyar reservas.",
    linkHref: "/rooms",
    linkLabel: "Ver habitaciones",
  },
  {
    id: "contact",
    title: "Contacto rápido",
    text: "Envíanos feedback o reporta incidencias internas.",
    linkHref: "/contact",
    linkLabel: "Ir a contacto",
    variant: "outline-primary",
  },
];

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
        {employeeCards.map((card) => (
          <div className="col-md-4" key={card.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{card.title}</h5>
                <p className="card-text text-muted flex-grow-1">{card.text}</p>
                <Link
                  to={card.linkHref}
                  className={`btn btn-${card.variant || "primary"} btn-sm align-self-start`}
                >
                  {card.linkLabel}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
