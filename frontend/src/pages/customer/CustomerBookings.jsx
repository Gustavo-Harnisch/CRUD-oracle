// src/pages/customer/CustomerBookings.jsx
import { useEffect, useMemo, useState } from "react";
import BookingDetailCard from "../../components/BookingDetailCard";
import { fetchReservations, fetchReservationEvents } from "../../services/bookingService";

const statusBadge = (status = "") => {
  const normalized = status.toLowerCase();
  if (normalized === "confirmada") return "badge bg-success-subtle text-success border";
  if (normalized === "finalizada") return "badge bg-primary-subtle text-primary border";
  if (normalized === "cancelada") return "badge bg-danger-subtle text-danger border";
  return "badge bg-warning-subtle text-warning border";
};

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [codeFilter, setCodeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchReservations();
        setBookings(
          data.map((b) => ({
            ...b,
            created: b.fechaInicio,
            start: b.fechaInicio,
            end: b.fechaFin,
            roomType: b.tipo,
            status: b.estado,
            guests: b.huespedes,
          })),
        );
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las reservas.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchesCode = codeFilter
        ? String(b.id).toLowerCase().includes(codeFilter.trim().toLowerCase())
        : true;
      const matchesType = typeFilter ? b.roomType === typeFilter : true;
      const matchesStatus = statusFilter ? b.status === statusFilter : true;
      return matchesCode && matchesType && matchesStatus;
    });
  }, [bookings, codeFilter, typeFilter, statusFilter]);

  const resetFilters = () => {
    setCodeFilter("");
    setTypeFilter("");
    setStatusFilter("");
  };

  const selectedBooking = selectedBookingId
    ? bookings.find((b) => b.id === selectedBookingId)
    : null;

  const [selectedEvents, setSelectedEvents] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      if (!selectedBookingId) {
        setSelectedEvents([]);
        return;
      }
      try {
        const events = await fetchReservationEvents(selectedBookingId);
        setSelectedEvents(events);
      } catch (err) {
        console.error(err);
        setSelectedEvents([]);
      }
    };
    loadEvents();
  }, [selectedBookingId]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Mis reservas</p>
          <h1 className="h4 mb-0">Historial de reservas</h1>
          <p className="text-muted small mb-0">Datos en línea desde la base real.</p>
        </div>
        <a className="btn btn-primary btn-sm mt-3 mt-md-0" href="/customer/reservations">
          Crear nueva reserva
        </a>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p className="text-muted">Cargando reservas...</p>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row g-2 mb-3">
              <div className="col-md-3">
                <label className="form-label mb-1">Código</label>
                <input
                  type="search"
                  className="form-control"
                  placeholder="ID"
                  value={codeFilter}
                  onChange={(e) => setCodeFilter(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label mb-1">Tipo habitación</label>
                <select
                  className="form-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">Todos</option>
                  {Array.from(new Set(bookings.map((b) => b.roomType || ""))).map((type) => (
                    <option key={type} value={type}>
                      {type || "N/D"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label mb-1">Estado</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos</option>
                  {Array.from(new Set(bookings.map((b) => b.status || ""))).map((st) => (
                    <option key={st} value={st}>
                      {st || "N/D"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end justify-content-md-end">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetFilters}>
                  Limpiar filtros
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tipo</th>
                    <th>Ingreso</th>
                    <th>Salida</th>
                    <th>Huéspedes</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.roomType}</td>
                      <td>{booking.start?.slice(0, 10)}</td>
                      <td>{booking.end?.slice(0, 10)}</td>
                      <td>{booking.guests}</td>
                      <td>$ {Number(booking.total || 0).toLocaleString()}</td>
                      <td>
                        <span className={statusBadge(booking.status)}>{booking.status}</span>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setSelectedBookingId(booking.id)}
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedBooking && (
        <BookingDetailCard
          booking={selectedBooking}
          events={selectedEvents}
          onClose={() => setSelectedBookingId(null)}
        />
      )}
    </div>
  );
};

export default CustomerBookings;
