// src/components/BookingDetailCard.jsx
const statusBadge = (status = "") => {
  const normalized = status.toLowerCase();
  if (normalized === "confirmada") return "badge bg-success-subtle text-success border";
  if (normalized === "finalizada") return "badge bg-primary-subtle text-primary border";
  if (normalized === "cancelada") return "badge bg-danger-subtle text-danger border";
  return "badge bg-warning-subtle text-warning border";
};

const BookingDetailCard = ({ booking, events = [], onClose }) => {
  if (!booking) return null;

  return (
    <div className="card shadow-sm mt-3">
      <div className="card-body">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-2">
          <div>
            <p className="text-uppercase text-muted small mb-1">Detalle de reserva</p>
            <h2 className="h6 mb-0">{booking.id}</h2>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className={statusBadge(booking.status)}>{booking.status}</span>
            {onClose && (
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                Cerrar
              </button>
            )}
          </div>
        </div>
        <div className="row g-2 mb-3">
          <div className="col-md-3">
            <p className="text-muted small mb-1">Habitación</p>
            <p className="mb-0 fw-semibold">{booking.roomType}</p>
          </div>
          <div className="col-md-3">
            <p className="text-muted small mb-1">Fechas</p>
            <p className="mb-0 fw-semibold">
              {booking.start} - {booking.end}
            </p>
          </div>
          <div className="col-md-2">
            <p className="text-muted small mb-1">Huéspedes</p>
            <p className="mb-0 fw-semibold">{booking.guests}</p>
          </div>
          <div className="col-md-2">
            <p className="text-muted small mb-1">Total</p>
            <p className="mb-0 fw-semibold">$ {Number(booking.total || 0).toLocaleString()}</p>
          </div>
        </div>
        <h3 className="h6 mb-2">Eventos asociados</h3>
        {events.length > 0 ? (
          <ul className="list-unstyled mb-0">
            {events.map((ev) => (
              <li key={ev.id} className="py-2 border-bottom">
                <p className="mb-1 fw-semibold">{ev.tipo || ev.type}</p>
                <small className="text-muted d-block">Fecha: {ev.fecha || ev.date}</small>
                <small className="text-muted d-block">Notas: {ev.notas || ev.notes || "Sin notas"}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted small mb-0">Sin eventos asociados.</p>
        )}
      </div>
    </div>
  );
};

export default BookingDetailCard;
