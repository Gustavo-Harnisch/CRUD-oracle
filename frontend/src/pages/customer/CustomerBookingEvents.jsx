// src/pages/customer/CustomerBookingEvents.jsx
import { useEffect, useState } from "react";
import {
  fetchReservations,
  fetchReservationEvents,
  addReservationEvent,
} from "../../services/bookingService";

const defaultEventTypes = [
  "CREADA",
  "CONFIRMADA",
  "CHECKIN",
  "CHECKOUT",
  "CANCELADA",
  "SERVICIO",
];

const CustomerBookingEvents = () => {
  const [reservations, setReservations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [eventType, setEventType] = useState(defaultEventTypes[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchReservations();
        setReservations(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las reservas.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      if (!selectedId) {
        setEvents([]);
        return;
      }
      try {
        const ev = await fetchReservationEvents(selectedId);
        setEvents(ev);
      } catch (err) {
        console.error(err);
        setEvents([]);
      }
    };
    loadEvents();
  }, [selectedId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!selectedId) {
      setError("Selecciona una reserva.");
      return;
    }
    try {
      await addReservationEvent(selectedId, { tipo: eventType, notas: notes });
      const ev = await fetchReservationEvents(selectedId);
      setEvents(ev);
      setNotes("");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "No se pudo guardar el evento.";
      setError(msg);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Eventos de reserva</p>
          <h1 className="h4 mb-0">Seguimiento y notas</h1>
          <p className="text-muted small mb-0">Conecta con la reserva real en la base.</p>
        </div>
        <span className="badge bg-success-subtle text-success border">Live</span>
      </div>

      {loading && <p className="text-muted">Cargando reservas...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 mb-3">Agregar evento</h2>
              <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-12">
                  <label className="form-label">Reserva</label>
                  <select
                    className="form-select"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                  >
                    <option value="">Selecciona una reserva</option>
                    {reservations.map((r) => (
                      <option key={r.id} value={r.id}>
                        #{r.id} · Hab {r.numero} · {r.tipo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Tipo de evento</label>
                  <select
                    className="form-select"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                  >
                    {defaultEventTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Notas</label>
                  <input
                    type="text"
                    className="form-control"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej: coordinar transporte"
                  />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" type="submit">
                    Guardar evento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 mb-3">Historial</h2>
              {events.length === 0 ? (
                <p className="text-muted small mb-0">Selecciona una reserva para ver sus eventos.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {events.map((ev) => (
                    <li key={ev.id} className="list-group-item d-flex justify-content-between">
                      <div>
                        <p className="mb-1 fw-semibold">{ev.tipo}</p>
                        <small className="text-muted">
                          {ev.fecha?.slice(0, 10)} · {ev.notas || "Sin notas"}
                        </small>
                      </div>
                      <span className="badge bg-secondary-subtle text-secondary border">#{ev.reservaId}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingEvents;
