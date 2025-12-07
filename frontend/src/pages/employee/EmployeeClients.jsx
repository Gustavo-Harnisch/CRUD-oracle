// src/pages/employee/EmployeeClients.jsx
import { PAGE_STATUS, getStatusClasses } from "../../utils/pageStatus";
const arrivals = [
  { id: 1, guest: "María Torres", room: "204", eta: "15:00", status: "Pendiente check-in", origin: "Directo", note: "Cuna solicitada + alergia plumas" },
  { id: 2, guest: "Luis Rivas", room: "305", eta: "14:30", status: "Check-in completado", origin: "Agencia", note: "Pago en mostrador" },
  { id: 3, guest: "Ana López", room: "108", eta: "13:00", status: "VIP esperado", origin: "Corporativo", note: "Late check-in" },
];

const departures = [
  { id: 1, guest: "Sofía Díaz", room: "110", time: "11:00", status: "Pendiente salida", note: "Solicita taxi 10:45" },
  { id: 2, guest: "Javier Pino", room: "403", time: "12:30", status: "Late check-out", note: "Facturación lista en mostrador" },
];

const inHouse = [
  { room: "301", guest: "Daniel Muñoz", nights: 3, status: "En casa", note: "Prefiere almohadas firmes" },
  { room: "207", guest: "Claudia Vera", nights: 1, status: "En casa", note: "Despertador 06:30" },
  { room: "512", guest: "Equipo Frontel", nights: 2, status: "En casa", note: "Check-out parcial mañana" },
];

const statusBadge = (status) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("vip")) return "badge bg-info-subtle text-info border";
  if (normalized.includes("completado") || normalized.includes("en casa"))
    return "badge bg-success-subtle text-success border";
  if (normalized.includes("late") || normalized.includes("pendiente salida"))
    return "badge bg-warning-subtle text-warning border";
  if (normalized.includes("pendiente")) return "badge bg-secondary-subtle text-secondary border";
  return "badge bg-light text-muted border";
};

const summaryCards = [
  { id: "arrivals", label: "Llegadas confirmadas", value: arrivals.length, helper: "Validar documentos y pagos" },
  { id: "departures", label: "Salidas del día", value: departures.length, helper: "Coordinar limpieza" },
  { id: "inhouse", label: "Huéspedes en casa", value: inHouse.length, helper: "Amenidades pendientes" },
  { id: "alerts", label: "Alertas check-in", value: 2, helper: "VIP / late check-in" },
];

const EmployeeClients = () => {
  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Empleado</p>
          <h1 className="h4 mb-1">Check-in y clientes</h1>
          <p className="text-muted small mb-0">
            Controla llegadas, salidas y huéspedes en casa sin salir del panel.
          </p>
        </div>
        <span className={`badge ${getStatusClasses(PAGE_STATUS.EDITING)}`}>{PAGE_STATUS.EDITING}</span>
      </div>

      <div className="row g-3 mb-4">
        {summaryCards.map((card) => (
          <div className="col-6 col-lg-3" key={card.id}>
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

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <div>
              <h2 className="h6 mb-1">Llegadas y check-in</h2>
              <p className="text-muted small mb-0">Confirma identidad, pagos y notas especiales.</p>
            </div>
            <span className={`badge ${getStatusClasses(PAGE_STATUS.EDITING)}`}>{PAGE_STATUS.EDITING}</span>
          </div>
          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>Huésped</th>
                  <th>Hab.</th>
                  <th>Hora</th>
                  <th>Origen</th>
                  <th>Estado</th>
                  <th>Notas</th>
                  <th className="text-end">Acción</th>
                </tr>
              </thead>
              <tbody>
                {arrivals.map((arrival) => (
                  <tr key={arrival.id}>
                    <td className="fw-semibold">{arrival.guest}</td>
                    <td>{arrival.room}</td>
                    <td>{arrival.eta}</td>
                    <td>{arrival.origin}</td>
                    <td>
                      <span className={statusBadge(arrival.status)}>{arrival.status}</span>
                    </td>
                    <td className="text-muted small">{arrival.note}</td>
                    <td className="text-end">
                      <button type="button" className="btn btn-sm btn-outline-primary" disabled>
                        Check-in
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <div>
              <h2 className="h6 mb-1">Salidas / check-out</h2>
              <p className="text-muted small mb-0">Confirma pagos, devoluciones y transporte.</p>
            </div>
            <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
              Notificar housekeeping
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>Huésped</th>
                  <th>Hab.</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Notas</th>
                  <th className="text-end">Acción</th>
                </tr>
              </thead>
              <tbody>
                {departures.map((dep) => (
                  <tr key={dep.id}>
                    <td className="fw-semibold">{dep.guest}</td>
                    <td>{dep.room}</td>
                    <td>{dep.time}</td>
                    <td>
                      <span className={statusBadge(dep.status)}>{dep.status}</span>
                    </td>
                    <td className="text-muted small">{dep.note}</td>
                    <td className="text-end">
                      <button type="button" className="btn btn-sm btn-outline-primary" disabled>
                        Check-out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <div>
              <h2 className="h6 mb-1">Huéspedes en casa</h2>
              <p className="text-muted small mb-0">Notas rápidas para el turno y seguimiento.</p>
            </div>
            <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
              Añadir nota
            </button>
          </div>
          <div className="row g-3">
            {inHouse.map((guest) => (
              <div className="col-md-4" key={guest.room}>
                <div className="border rounded-3 p-3 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <p className="text-uppercase text-muted small mb-1">Hab. {guest.room}</p>
                      <h3 className="h6 mb-0">{guest.guest}</h3>
                    </div>
                    <span className={statusBadge(guest.status)}>{guest.status}</span>
                  </div>
                  <p className="text-muted small mb-2">Noches: {guest.nights}</p>
                  <p className="text-muted small mb-0">{guest.note}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-muted small mt-3 mb-0">
            Integra con el endpoint de reservas/check-in para reemplazar estos datos mock.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeClients;
