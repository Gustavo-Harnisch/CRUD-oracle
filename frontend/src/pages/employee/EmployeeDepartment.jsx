import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";

const departmentFallback = {
  name: "Operaciones",
  lead: "María Torres",
  extension: "101",
  shift: "Mañana",
  goal: "SLA peticiones < 30 min",
  backlog: 4,
};

const teamMembers = [
  { name: "Luis Rivas", role: "Recepción", shift: "Mañana", contact: "luis@hotel.cl", focus: "Check-in express", status: "Activo" },
  { name: "Claudia Vera", role: "Recepción", shift: "Tarde", contact: "claudia@hotel.cl", focus: "VIP y grupos", status: "Activo" },
  { name: "Carlos Soto", role: "Mantenimiento", shift: "Mañana", contact: "carlos@hotel.cl", focus: "Soporte habitaciones", status: "Activo" },
  { name: "Laura Díaz", role: "Housekeeping", shift: "Tarde", contact: "laura@hotel.cl", focus: "Limpieza y amenities", status: "En turno" },
];

const focusAreas = [
  "Coordinación check-in / housekeeping",
  "Seguimiento de tickets VIP y urgentes",
  "Control de bloqueos y rooms fuera de servicio",
  "Comunicación interna con proveedores críticos",
];

const initiatives = [
  { title: "Tablero único de operaciones", status: "En marcha", owner: "Recepción" },
  { title: "Plantilla de bienvenida VIP", status: "Listo", owner: "Front desk" },
  { title: "Checklist de bloqueos", status: "Borrador", owner: "Operaciones" },
];

const statusBadge = (status) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("turno")) return "badge bg-info-subtle text-info border";
  if (normalized.includes("activo")) return "badge bg-success-subtle text-success border";
  return "badge bg-light text-secondary border";
};

const EmployeeDepartment = () => {
  const { user } = useAuth();
  const departmentName = user?.department || user?.departamento || departmentFallback.name;
  const lead = user?.lead || user?.jefe || departmentFallback.lead;
  const extension = user?.extension || departmentFallback.extension;
  const shift = user?.shift || user?.turno || departmentFallback.shift;
  const goal = departmentFallback.goal;
  const backlog = departmentFallback.backlog;

  const greeting = useMemo(() => user?.name || "Colaborador", [user?.name]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Empleado</p>
          <h1 className="h4 mb-1">Mi departamento</h1>
          <p className="text-muted small mb-0">
            {greeting}, aquí tienes datos rápidos de tu equipo y responsabilidades.
          </p>
        </div>
        <div className="text-md-end mt-3 mt-md-0">
          <p className="text-muted small mb-1">Departamento</p>
          <span className="badge bg-primary-subtle text-primary border">{departmentName}</span>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 mb-3">Resumen operativo</h2>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Responsable</span>
                <span className="fw-semibold">{lead}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Extensión</span>
                <span className="fw-semibold">{extension}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Turno</span>
                <span className="fw-semibold">{shift}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted small">Backlog actual</span>
                <span className="badge bg-warning-subtle text-warning border">{backlog} pendientes</span>
              </div>
              <p className="text-muted small mb-2">Objetivo inmediato</p>
              <p className="fw-semibold small mb-0">{goal}</p>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
                <div>
                  <h2 className="h6 mb-1">Equipo</h2>
                  <p className="text-muted small mb-0">Roles, turnos y focos por persona.</p>
                </div>
                <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
                  Actualizar datos
                </button>
              </div>
              <div className="table-responsive">
                <table className="table table-striped align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Rol</th>
                      <th>Turno</th>
                      <th>Enfoque</th>
                      <th>Contacto</th>
                      <th className="text-end">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr key={member.name}>
                        <td className="fw-semibold">{member.name}</td>
                        <td>{member.role}</td>
                        <td>{member.shift}</td>
                        <td className="text-muted small">{member.focus}</td>
                        <td className="text-muted small">{member.contact}</td>
                        <td className="text-end">
                          <span className={statusBadge(member.status)}>{member.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-muted small mt-3 mb-0">
                Sustituye esta tabla con datos reales de /departments o del directorio interno.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 mb-3">Prioridades del turno</h2>
              <ul className="text-muted small ps-3 mb-0">
                {focusAreas.map((item) => (
                  <li key={item} className="mb-1">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 mb-3">Iniciativas del equipo</h2>
              <div className="d-flex flex-column gap-3">
                {initiatives.map((item) => (
                  <div key={item.title} className="border rounded-3 p-3">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h3 className="h6 mb-0">{item.title}</h3>
                      <span className="badge bg-light text-muted border">{item.status}</span>
                    </div>
                    <p className="text-muted small mb-0">Owner: {item.owner}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDepartment;
