// src/pages/admin/AdminInventory.jsx
import { Link } from "react-router-dom";

const inventoryBlocks = [
  {
    title: "Habitaciones",
    description: "Administra disponibilidad, bloqueos y asignaciones a los huéspedes.",
    actions: ["Actualizar estado", "Asignar limpieza", "Revisar tipos y comodidades"],
    cta: { label: "Gestionar habitaciones", to: "/admin/rooms" },
  },
  {
    title: "Inventario",
    description: "Lleva control de ropa de cama, amenities y consumibles por piso.",
    actions: ["Stock mínimo", "Alertas de reposición", "Historial de movimientos"],
  },
  {
    title: "Mantenimiento",
    description: "Coordina tareas correctivas y preventivas con responsables internos.",
    actions: ["Incidencias abiertas", "Calendario técnico", "Proveedores y SLA"],
  },
];

const AdminInventory = () => {
  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Administración</p>
          <h1 className="h4 mb-0">Cuartos e inventario</h1>
          <p className="text-muted small mb-0">
            Separa la gestión diaria en módulos de habitaciones, inventario y mantenimiento.
          </p>
        </div>
        <Link to="/admin" className="btn btn-outline-secondary btn-sm mt-3 mt-md-0">
          Volver al dashboard
        </Link>
      </div>

      <div className="row g-3">
        {inventoryBlocks.map(({ title, description, actions, cta }) => (
          <div className="col-md-4" key={title}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{title}</h5>
                <p className="card-text text-muted">{description}</p>
                <ul className="text-muted small ps-3 mb-3">
                  {actions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {cta ? (
                  <Link to={cta.to} className="btn btn-primary btn-sm align-self-start">
                    {cta.label}
                  </Link>
                ) : (
                  <span className="text-secondary small">Enlaza aquí tu flujo detallado.</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminInventory;
