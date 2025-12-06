// src/pages/admin/AdminDashboard.jsx
import { Link } from "react-router-dom";

const adminCards = [
  {
    id: "inventory",
    title: "Cuartos e inventario",
    text: "Controla disponibilidad, bloqueos y existencias sin mezclarlo con otros flujos.",
    linkHref: "/admin/inventory",
    linkLabel: "Ir a inventario",
  },
  {
    id: "users",
    title: "Usuarios",
    text: "Revisa y administra las cuentas de usuarios del sistema.",
    linkHref: "/admin/users",
    linkLabel: "Gestionar usuarios",
  },
  {
    id: "employees",
    title: "Empleados",
    text: "Organiza turnos, altas/bajas y procesos de onboarding.",
    linkHref: "/admin/employees",
    linkLabel: "Ver empleados",
  },
  {
    id: "rates",
    title: "Tarifas y promos",
    text: "Configura precios, temporadas y campañas sin afectar otros módulos.",
    linkHref: "/admin/rates",
    linkLabel: "Configurar tarifas",
  },
  {
    id: "audit",
    title: "Auditoría y logs",
    text: "Consulta eventos sensibles y exporta registros cuando lo necesites.",
    linkHref: "/admin/audit",
    linkLabel: "Ver logs",
  },
  {
    id: "requests",
    title: "Solicitudes de admin",
    text: "Aprueba o rechaza solicitudes de elevación a administrador.",
    linkHref: "/admin/requests",
    linkLabel: "Ver solicitudes",
  },
];

const AdminDashboard = () => {
  return (
    <div className="container py-4">
      <p className="text-uppercase text-muted mb-1 small">Administración</p>
      <h1 className="h3 mb-1">Panel de administración</h1>
      <p className="text-muted">
        Gestiona cada área en su propia página para mantener el código modular.
      </p>

      <div className="row g-3">
        {adminCards.map((card) => (
          <div className="col-md-4" key={card.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{card.title}</h5>
                <p className="card-text text-muted flex-grow-1">{card.text}</p>
                <Link to={card.linkHref} className="btn btn-outline-primary btn-sm align-self-start">
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

export default AdminDashboard;
