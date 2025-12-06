// src/pages/employee/EmployeeClients.jsx
const sampleClients = [
  { id: 1, name: "María Torres", room: "204", status: "Check-in 15:00" },
  { id: 2, name: "Juan Rivas", room: "305", status: "Salida 11:00" },
  { id: 3, name: "Ana López", room: "108", status: "Late check-out" },
];

const EmployeeClients = () => {
  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Empleado</p>
          <h1 className="h4 mb-0">Clientes y check-in</h1>
          <p className="text-muted small mb-0">
            Mantén la información de huéspedes separada del resto del panel.
          </p>
        </div>
        <button type="button" className="btn btn-outline-secondary btn-sm mt-3 mt-md-0" disabled>
          Registrar llegada
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h6 mb-3">Movimientos de hoy</h2>
          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Habitación</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {sampleClients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.id}</td>
                    <td>{client.name}</td>
                    <td>{client.room}</td>
                    <td>{client.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted small mt-3 mb-0">
            Aquí puedes conectar el endpoint de check-in y check-out cuando esté listo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeClients;
