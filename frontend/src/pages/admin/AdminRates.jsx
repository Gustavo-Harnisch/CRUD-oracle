// src/pages/admin/AdminRates.jsx
import { Link } from "react-router-dom";

const rateModules = [
  {
    title: "Tarifas base",
    description: "Configura precios por tipo de habitación y temporadas.",
    items: ["Rack rate", "Políticas de cancelación", "Bloqueos por fecha"],
  },
  {
    title: "Promociones",
    description: "Crea códigos y campañas con duración definida.",
    items: ["Códigos promocionales", "Restricciones por canal", "Segmentos de clientes"],
  },
  {
    title: "Reporte de ingresos",
    description: "Métricas rápidas para validar impacto de precios.",
    items: ["ADR y RevPAR", "Pick-up por día", "Top canales de venta"],
    cta: { label: "Exportar", to: "/admin/audit" },
  },
];

const AdminRates = () => {
  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Administración</p>
          <h1 className="h4 mb-0">Tarifas y promociones</h1>
          <p className="text-muted small mb-0">
            Define precios y campañas sin mezclar lógica con otros módulos.
          </p>
        </div>
        <Link to="/admin" className="btn btn-outline-secondary btn-sm mt-3 mt-md-0">
          Volver al dashboard
        </Link>
      </div>

      <div className="row g-3">
        {rateModules.map(({ title, description, items, cta }) => (
          <div className="col-md-4" key={title}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{title}</h5>
                <p className="card-text text-muted">{description}</p>
                <ul className="text-muted small ps-3 mb-3">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {cta ? (
                  <Link to={cta.to} className="btn btn-primary btn-sm align-self-start">
                    {cta.label}
                  </Link>
                ) : (
                  <span className="text-secondary small">Conecta aquí tu flujo de tarifas.</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRates;
