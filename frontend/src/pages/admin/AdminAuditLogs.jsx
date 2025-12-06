// src/pages/admin/AdminAuditLogs.jsx
const sampleLogs = [
  {
    id: 1,
    action: "Actualizó tarifas",
    actor: "Admin",
    target: "Temporada alta 2024",
    timestamp: "2024-03-01 10:22",
  },
  {
    id: 2,
    action: "Eliminó usuario",
    actor: "Admin",
    target: "empleado@hotel.cl",
    timestamp: "2024-02-28 18:41",
  },
  {
    id: 3,
    action: "Exportó reporte",
    actor: "Admin",
    target: "logs trimestrales",
    timestamp: "2024-02-25 09:15",
  },
];

const AdminAuditLogs = () => {
  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Administración</p>
          <h1 className="h4 mb-0">Auditoría y logs</h1>
          <p className="text-muted small mb-0">
            Centraliza eventos sensibles sin mezclar la lógica con el resto de módulos.
          </p>
        </div>
        <button type="button" className="btn btn-outline-secondary btn-sm mt-3 mt-md-0" disabled>
          Exportar CSV (próximamente)
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h2 className="h6 mb-0">Últimos movimientos</h2>
            <span className="badge bg-light text-secondary border">Demo</span>
          </div>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Acción</th>
                  <th>Usuario</th>
                  <th>Detalle</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {sampleLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.action}</td>
                    <td>{log.actor}</td>
                    <td>{log.target}</td>
                    <td>{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted small mt-3 mb-0">
            Integra aquí el endpoint real de auditoría para listar y exportar eventos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
