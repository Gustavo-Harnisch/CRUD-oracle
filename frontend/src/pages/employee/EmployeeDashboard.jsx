// src/pages/employee/EmployeeDashboard.jsx
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";

const statCards = [
  { id: "checkins", label: "Check-ins hoy", value: 12, helper: "+2 vs ayer" },
  { id: "checkouts", label: "Salidas programadas", value: 7, helper: "3 late check-out" },
  { id: "requests", label: "Peticiones abiertas", value: 9, helper: "2 urgentes" },
  { id: "oos", label: "Rooms fuera de servicio", value: 3, helper: "Revisión y limpieza" },
];

const employeeSections = [
  {
    id: "clients",
    title: "Check-in y clientes",
    text: "Coordina llegadas, salidas y asignaciones sin saltar a otro módulo.",
    bullets: ["Llegadas confirmadas y en espera", "Late check-out y VIPs", "Notas de operación por habitación"],
    linkHref: "/employee/clients",
    linkLabel: "Abrir check-in",
  },
  {
    id: "requests",
    title: "Peticiones de huéspedes",
    text: "Centraliza tickets, urgencias y responsables en un solo tablero.",
    bullets: ["Prioridad y SLA", "Asignación al equipo", "Seguimiento de escalados"],
    linkHref: "/employee/requests",
    linkLabel: "Gestionar tickets",
  },
  {
    id: "rooms",
    title: "Habitaciones (ops)",
    text: "Visibilidad operativa: ocupación, bloqueos y queue de limpieza.",
    bullets: ["Ocupadas vs disponibles", "Fuera de servicio", "Notas para housekeeping"],
    linkHref: "/employee/rooms",
    linkLabel: "Ver rooms",
  },
  {
    id: "department",
    title: "Mi departamento",
    text: "Equipo, turnos y objetivos en marcha. Mantén a todos alineados.",
    bullets: ["Responsable y extensión", "Turnos activos", "Pendientes clave"],
    linkHref: "/employee/department",
    linkLabel: "Ver detalle",
    variant: "outline-primary",
  },
];

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const firstName = useMemo(() => {
    if (!user?.name) return "equipo";
    const [name] = user.name.split(" ");
    return name || "equipo";
  }, [user?.name]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Empleado</p>
          <h1 className="h4 mb-1">Dashboard operativo</h1>
          <p className="text-muted small mb-0">Hola, {firstName}. Revisa el estado del día y entra a cada módulo.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/employee/clients" className="btn btn-primary btn-sm">
            Check-in rápido
          </Link>
          <Link to="/employee/requests" className="btn btn-outline-secondary btn-sm">
            Ver peticiones
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {statCards.map((card) => (
          <div className="col-6 col-md-3" key={card.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <p className="text-uppercase text-muted small mb-1">{card.label}</p>
                <h3 className="h4 mb-1">{card.value}</h3>
                <p className="text-success small mb-0">{card.helper}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {employeeSections.map((card) => (
          <div className="col-md-6 col-xl-3" key={card.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{card.title}</h5>
                <p className="card-text text-muted">{card.text}</p>
                <ul className="text-muted small ps-3 flex-grow-1">
                  {card.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
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
