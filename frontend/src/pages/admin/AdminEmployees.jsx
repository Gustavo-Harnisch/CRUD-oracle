// src/pages/admin/AdminEmployees.jsx
import { Link } from "react-router-dom";

const employeeModules = [
  {
    title: "Equipo activo",
    description: "Listado de empleados, estados y accesos de la plataforma.",
    bullets: ["Altas y bajas", "Documentación vigente", "Roles asignados"],
    cta: { label: "Gestionar usuarios", to: "/admin/users" },
  },
  {
    title: "Turnos y cobertura",
    description: "Planea turnos, descansos y asignaciones por área.",
    bullets: ["Turnos abiertos", "Cobertura por piso", "Alertas de sobrecarga"],
  },
  {
    title: "Onboarding y capacitación",
    description: "Registra capacitaciones y tareas de incorporación.",
    bullets: ["Checklist de ingreso", "Capacitaciones pendientes", "Historial de cursos"],
  },
];

const AdminEmployees = () => {
  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Administración</p>
          <h1 className="h4 mb-0">Empleados</h1>
          <p className="text-muted small mb-0">
            Mantén separadas las funciones de personal, turnos y onboarding.
          </p>
        </div>
        <Link to="/admin" className="btn btn-outline-secondary btn-sm mt-3 mt-md-0">
          Volver al dashboard
        </Link>
      </div>

      <div className="row g-3">
        {employeeModules.map(({ title, description, bullets, cta }) => (
          <div className="col-md-4" key={title}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{title}</h5>
                <p className="card-text text-muted">{description}</p>
                <ul className="text-muted small ps-3 mb-3">
                  {bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {cta ? (
                  <Link to={cta.to} className="btn btn-primary btn-sm align-self-start">
                    {cta.label}
                  </Link>
                ) : (
                  <span className="text-secondary small">Agrega aquí tus flujos.</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEmployees;
