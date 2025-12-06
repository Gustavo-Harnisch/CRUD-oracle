import { useEffect, useMemo, useState } from "react";
import { fetchReservations, fetchReservationEvents } from "../services/bookingService";

const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (value) => {
  const d = parseDate(value);
  if (!d) return "Sin fecha";
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
};

const CustomerOverview = () => {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchReservations();
        setBookings(res);
        // opcional: cargar eventos del primero
        if (res[0]) {
          const ev = await fetchReservationEvents(res[0].id);
          setEvents(ev);
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const totalSpent = useMemo(
    () =>
      bookings.reduce(
        (acc, b) => acc + (b.estado === "Cancelada" ? 0 : Number(b.total || 0)),
        0,
      ),
    [bookings],
  );

  const activeCount = useMemo(
    () => bookings.filter((b) => ["CREADA", "CONFIRMADA", "EN_PROCESO"].includes(String(b.estado).toUpperCase())).length,
    [bookings],
  );

  const eventCount = useMemo(() => events.length, [events]);

  const nextStay = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = bookings
      .map((b) => ({ ...b, startDate: parseDate(b.fechaInicio) }))
      .filter((b) => b.startDate && b.startDate >= today)
      .sort((a, b) => a.startDate - b.startDate);
    return upcoming[0] || null;
  }, [bookings]);

  const daysToNextStay = nextStay
    ? Math.max(0, Math.ceil((nextStay.startDate - new Date()) / 86400000))
    : null;

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <p className="text-uppercase text-muted small mb-1">Resumen de cliente</p>
            <h2 className="h5 mb-0">Estado rápido de tus reservas</h2>
            <p className="text-muted small mb-0">Datos en línea desde la base real.</p>
          </div>
          <span className="badge bg-success-subtle text-success border d-none d-md-inline">
            Live
          </span>
        </div>

        <div className="row g-3 mb-2">
          <div className="col-6 col-lg-3">
            <div className="p-3 rounded border bg-light h-100">
              <p className="text-muted small mb-1">Activas</p>
              <p className="h4 mb-0">{activeCount}</p>
              <small className="text-muted">Confirmadas / en proceso</small>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="p-3 rounded border bg-light h-100">
              <p className="text-muted small mb-1">Total gastado</p>
              <p className="h4 mb-0">$ {totalSpent.toLocaleString()}</p>
              <small className="text-muted">Sin canceladas</small>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="p-3 rounded border bg-light h-100">
              <p className="text-muted small mb-1">Próximo check-in</p>
              {nextStay ? (
                <>
                  <p className="h6 mb-0">{formatDate(nextStay.fechaInicio)}</p>
                  <small className="text-muted">
                    Hab {nextStay.numero} · en {daysToNextStay} día
                    {daysToNextStay === 1 ? "" : "s"}
                  </small>
                </>
              ) : (
                <>
                  <p className="h6 mb-0">Sin fecha</p>
                  <small className="text-muted">Agrega una reserva</small>
                </>
              )}
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="p-3 rounded border bg-light h-100">
              <p className="text-muted small mb-1">Eventos</p>
              <p className="h4 mb-0">{eventCount}</p>
              <small className="text-muted">Notas y seguimientos</small>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-lg-5">
            <div className="p-3 border rounded h-100 bg-white">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted small mb-1">Próxima estadía</p>
                  <h3 className="h6 mb-0">
                    {nextStay ? `Hab ${nextStay.numero} · ${nextStay.tipo}` : "Aún sin reservas"}
                  </h3>
                </div>
                <span
                  className={`badge ${
                    nextStay
                      ? "bg-primary-subtle text-primary border"
                      : "bg-secondary-subtle text-secondary border"
                  }`}
                >
                  {nextStay ? nextStay.estado : "Pendiente"}
                </span>
              </div>

              {nextStay ? (
                <>
                  <p className="mb-1 small">Ingreso: {formatDate(nextStay.fechaInicio)}</p>
                  <p className="mb-1 small">Salida: {formatDate(nextStay.fechaFin)}</p>
                  <p className="mb-1 small">Huéspedes: {nextStay.huespedes}</p>
                  <p className="mb-0 fw-semibold">Total: $ {Number(nextStay.total || 0).toLocaleString()}</p>
                </>
              ) : (
                <p className="text-muted small mb-0">
                  Cuando confirmes o crees una reserva, verás el detalle aquí.
                </p>
              )}
            </div>
          </div>

          <div className="col-lg-7">
            <div className="p-3 border rounded h-100 bg-white">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted small mb-1">Eventos recientes</p>
                  <h3 className="h6 mb-0">Seguimiento</h3>
                </div>
              </div>
              {events.length === 0 ? (
                <p className="text-muted small mb-0">Sin eventos recientes.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {events.slice(0, 5).map((ev) => (
                    <li key={ev.id} className="list-group-item d-flex justify-content-between">
                      <div>
                        <p className="mb-1 fw-semibold">{ev.tipo}</p>
                        <small className="text-muted">{ev.fecha?.slice(0, 10)}</small>
                        <br />
                        <small className="text-muted">{ev.notas || "Sin notas"}</small>
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

export default CustomerOverview;
