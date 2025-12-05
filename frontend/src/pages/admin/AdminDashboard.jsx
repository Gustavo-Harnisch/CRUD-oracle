// src/pages/admin/AdminDashboard.jsx
import { Link } from "react-router-dom";

const adminCards = [
  {
    id: "users",
    title: "Usuarios",
    text: "Revisa y administra las cuentas de usuarios del sistema.",
    linkHref: "/admin/users",
    linkLabel: "Gestionar usuarios",
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
      <h1 className="h3 mb-3">Panel de administración</h1>
      <p className="text-muted">
        Gestión completa de usuarios, roles y solicitudes.
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
