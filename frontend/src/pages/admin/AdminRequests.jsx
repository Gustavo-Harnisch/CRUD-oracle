// src/pages/admin/AdminRequests.jsx
const sampleRequests = [
  { id: 1, name: "Andrea Pérez", email: "andrea@hotel.cl", reason: "Gestión de usuarios", status: "Pendiente" },
  { id: 2, name: "Luis Soto", email: "luis@hotel.cl", reason: "Reportes financieros", status: "Aprobado" },
  { id: 3, name: "Camila Díaz", email: "camila@hotel.cl", reason: "Auditoría", status: "Rechazado" },
];

const statusBadge = (status) => {
  const normalized = status.toLowerCase();
  if (normalized === "aprobado") return "badge bg-success-subtle text-success border";
  if (normalized === "rechazado") return "badge bg-danger-subtle text-danger border";
  return "badge bg-warning-subtle text-warning border";
};

const AdminRequests = () => {
  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Administración</p>
          <h1 className="h4 mb-0">Solicitudes de administrador</h1>
          <p className="text-muted small mb-0">
            Separa el flujo de revisión y respuesta sin mezclarlo con usuarios o inventario.
          </p>
        </div>
        <button type="button" className="btn btn-outline-secondary btn-sm mt-3 mt-md-0" disabled>
          Configurar notificaciones
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h6 mb-3">Solicitudes recientes</h2>
          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sampleRequests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.id}</td>
                    <td>{req.name}</td>
                    <td>{req.email}</td>
                    <td>{req.reason}</td>
                    <td>
                      <span className={statusBadge(req.status)}>{req.status}</span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm" role="group" aria-label="Acciones">
                        <button type="button" className="btn btn-outline-success" disabled>
                          Aprobar
                        </button>
                        <button type="button" className="btn btn-outline-danger" disabled>
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted small mt-3 mb-0">
            Conecta aquí el endpoint real de solicitudes de privilegios cuando esté disponible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRequests;
