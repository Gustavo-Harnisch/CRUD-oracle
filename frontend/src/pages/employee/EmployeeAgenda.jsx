// src/pages/employee/EmployeeAgenda.jsx
const agendaBlocks = [
  { title: "Eventos del día", description: "Check-ins, check-outs y bloqueos de habitaciones programados." },
  { title: "Recordatorios", description: "Notas internas, pendientes de huéspedes y entregas especiales." },
  { title: "Coordinación", description: "Comparte actualizaciones con limpieza y mantenimiento." },
];

const EmployeeAgenda = () => {
  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Empleado</p>
          <h1 className="h4 mb-0">Agenda y eventos</h1>
          <p className="text-muted small mb-0">
            Centraliza los movimientos diarios sin mezclarlo con otros módulos.
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-sm mt-3 mt-md-0" disabled>
          Crear evento
        </button>
      </div>

      <div className="row g-3">
        {agendaBlocks.map(({ title, description }) => (
          <div className="col-md-4" key={title}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{title}</h5>
                <p className="card-text text-muted flex-grow-1">{description}</p>
                <span className="text-secondary small">Integra tu calendario aquí.</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeAgenda;
