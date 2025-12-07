// src/pages/employee/EmployeeRequests.jsx
const requestColumns = [
  {
    id: "pending",
    title: "Pendientes",
    tone: "warning",
    items: [
      { id: 1, room: "204", note: "Almohadas extra", status: "Pendiente", priority: "Alta", owner: "Recepción", updated: "Hace 5 min" },
      { id: 2, room: "108", note: "Cambio de toallas", status: "Pendiente", priority: "Media", owner: "Pisos", updated: "Hace 12 min" },
    ],
  },
  {
    id: "progress",
    title: "En progreso",
    tone: "info",
    items: [
      { id: 3, room: "305", note: "Room service 20:00", status: "En progreso", priority: "Alta", owner: "Cocina", updated: "Hace 8 min" },
      { id: 4, room: "512", note: "Plancha y secador", status: "En progreso", priority: "Baja", owner: "Recepción", updated: "Hace 2 min" },
    ],
  },
  {
    id: "escalated",
    title: "Escaladas / VIP",
    tone: "danger",
    items: [
      { id: 5, room: "401", note: "Aire acondicionado hace ruido", status: "Escalado", priority: "Urgente", owner: "Mantenimiento", updated: "Hace 1 min" },
    ],
  },
];

const statusVariant = (status) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("progreso")) return "badge bg-info-subtle text-info border";
  if (normalized.includes("resuelto")) return "badge bg-success-subtle text-success border";
  if (normalized.includes("escalado") || normalized.includes("urgente"))
    return "badge bg-danger-subtle text-danger border";
  if (normalized.includes("pendiente")) return "badge bg-warning-subtle text-warning border";
  return "badge bg-light text-secondary border";
};

const priorityVariant = (priority) => {
  const normalized = priority.toLowerCase();
  if (normalized === "urgente") return "badge bg-danger-subtle text-danger border";
  if (normalized === "alta") return "badge bg-warning-subtle text-warning border";
  if (normalized === "media") return "badge bg-info-subtle text-info border";
  return "badge bg-light text-secondary border";
};

const summary = [
  { id: "open", label: "Solicitudes abiertas", value: 5, helper: "Actualizar SLA" },
  { id: "vip", label: "VIP / Escaladas", value: 1, helper: "Resolver antes de 30 min" },
  { id: "today", label: "Atendidas hoy", value: 3, helper: "2 en progreso" },
];

const EmployeeRequests = () => {
  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Empleado</p>
          <h1 className="h4 mb-1">Peticiones de huéspedes</h1>
          <p className="text-muted small mb-0">
            Tablero operativo con prioridades, responsables y tiempos de respuesta.
          </p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button type="button" className="btn btn-primary btn-sm" disabled>
            Nuevo ticket
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
            Ver historial
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {summary.map((card) => (
          <div className="col-12 col-md-4" key={card.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <p className="text-uppercase text-muted small mb-1">{card.label}</p>
                <h3 className="h5 mb-1">{card.value}</h3>
                <p className="text-muted small mb-0">{card.helper}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {requestColumns.map((column) => (
          <div className="col-md-4" key={column.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h6 mb-0">{column.title}</h2>
                  <span className={`badge bg-${column.tone}-subtle text-${column.tone} border`}>
                    {column.items.length} en cola
                  </span>
                </div>
                <div className="d-flex flex-column gap-3">
                  {column.items.map((req) => (
                    <div key={req.id} className="border rounded-3 p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <p className="text-muted small mb-1">Hab. {req.room}</p>
                          <h3 className="h6 mb-0">{req.note}</h3>
                        </div>
                        <span className={statusVariant(req.status)}>{req.status}</span>
                      </div>
                      <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                        <span className={priorityVariant(req.priority)}>{req.priority}</span>
                        <span className="badge bg-light text-muted border">Resp: {req.owner}</span>
                        <span className="text-muted small">{req.updated}</span>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-outline-success btn-sm" disabled>
                          Marcar resuelto
                        </button>
                        <button type="button" className="btn btn-outline-primary btn-sm" disabled>
                          Reasignar
                        </button>
                      </div>
                    </div>
                  ))}
                  {column.items.length === 0 && (
                    <p className="text-muted small mb-0">Sin tickets en esta columna.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-muted small mt-3 mb-0">
        Conecta estas columnas a tu sistema de tickets para mover solicitudes en tiempo real.
      </p>
    </div>
  );
};

export default EmployeeRequests;
