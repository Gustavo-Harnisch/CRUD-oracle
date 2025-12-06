// src/pages/employee/EmployeeRequests.jsx
const guestRequests = [
  { id: 1, room: "204", note: "Almohadas extra", status: "Pendiente" },
  { id: 2, room: "108", note: "Cambio de toallas", status: "En progreso" },
  { id: 3, room: "305", note: "Room service 20:00", status: "Resuelto" },
];

const statusVariant = (status) => {
  const normalized = status.toLowerCase();
  if (normalized === "resuelto") return "badge bg-success-subtle text-success border";
  if (normalized === "en progreso") return "badge bg-warning-subtle text-warning border";
  return "badge bg-light text-secondary border";
};

const EmployeeRequests = () => {
  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Empleado</p>
          <h1 className="h4 mb-0">Peticiones de huéspedes</h1>
          <p className="text-muted small mb-0">
            Modulariza las solicitudes para no mezclarlas con la agenda o inventario.
          </p>
        </div>
        <button type="button" className="btn btn-outline-secondary btn-sm mt-3 mt-md-0" disabled>
          Crear ticket
        </button>
      </div>

      <div className="row g-3">
        {guestRequests.map((req) => (
          <div className="col-md-4" key={req.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <p className="text-muted small mb-1">Habitación {req.room}</p>
                    <h5 className="card-title mb-0">{req.note}</h5>
                  </div>
                  <span className={statusVariant(req.status)}>{req.status}</span>
                </div>
                <p className="text-muted small flex-grow-1">
                  Redirige esta tarjeta a tu sistema de tickets cuando esté listo.
                </p>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-success btn-sm" disabled>
                    Marcar resuelto
                  </button>
                  <button type="button" className="btn btn-outline-primary btn-sm" disabled>
                    Asignar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeRequests;
