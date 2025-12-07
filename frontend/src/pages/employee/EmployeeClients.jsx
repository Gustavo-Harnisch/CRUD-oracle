import { useEffect, useMemo, useState } from "react";
import {
  fetchReservations,
  fetchReservationEvents,
  checkinReservation,
  checkoutReservation,
} from "../../services/bookingService";
import { PAGE_STATUS, getStatusClasses } from "../../utils/pageStatus";

const statusBadge = (status = "") => {
  const normalized = status.toLowerCase();
  if (normalized.includes("final")) return "badge bg-success-subtle text-success border";
  if (normalized.includes("checkout") && normalized.includes("solic"))
    return "badge bg-info-subtle text-info border";
  if (normalized.includes("proceso")) return "badge bg-primary-subtle text-primary border";
  if (normalized.includes("atras")) return "badge bg-danger-subtle text-danger border";
  if (normalized.includes("cancel")) return "badge bg-secondary-subtle text-secondary border";
  if (normalized.includes("cread")) return "badge bg-warning-subtle text-warning border";
  if (normalized.includes("confirm")) return "badge bg-success-subtle text-success border";
  if (normalized.includes("pend")) return "badge bg-warning-subtle text-warning border";
  if (normalized.includes("checkout")) return "badge bg-success-subtle text-success border";
  if (normalized.includes("vip")) return "badge bg-info-subtle text-info border";
  return "badge bg-light text-muted border";
};

const arrivalStatusBadge = (status = "") => {
  const normalized = status.toLowerCase();
  if (normalized === "done") return "badge bg-success-subtle text-success border";
  if (normalized === "missed") return "badge bg-danger-subtle text-danger border";
  if (normalized === "pending") return "badge bg-warning-subtle text-warning border";
  return "badge bg-secondary-subtle text-secondary border";
};

const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (value) => {
  const d = parseDate(value);
  if (!d) return "N/D";
  return d.toLocaleDateString();
};

const EmployeeClients = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [checkinModal, setCheckinModal] = useState({
    open: false,
    mode: "checkin",
    reservaId: null,
    name: "",
    email: "",
    rut: "",
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      // all=1 permite a empleados ver todas las reservas de todos los clientes.
      const data = await fetchReservations({ all: 1 });
      const baseReservations = Array.isArray(data) ? data : [];

      const hydrated = await Promise.all(
        baseReservations.map(async (res) => {
          let events = [];
          try {
            events = await fetchReservationEvents(res.id);
          } catch (err) {
            console.error("Error cargando eventos de reserva", res.id, err);
          }

          const hasCheckin = (events || []).some((e) => (e.tipo || "").toLowerCase().includes("check-in"));
          const hasCheckout = (events || []).some((e) => (e.tipo || "").toLowerCase().includes("check-out"));
          const hasCheckoutRequest = (events || []).some((e) => {
            const t = (e.tipo || "").toLowerCase();
            return t.includes("check-out") && t.includes("solic");
          });
          const startRaw = res.fechaInicio ?? res.start ?? res.fecha_inicio;
          const startDate = parseDate(startRaw);
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);

          let arrivalStatus = "upcoming";
          if (hasCheckin) arrivalStatus = "done";
          else if (startDate && startDate < todayStart) arrivalStatus = "missed";
          else if (startDate && startDate >= todayStart && startDate <= todayEnd) arrivalStatus = "pending";

          return { ...res, events, hasCheckin, hasCheckout, hasCheckoutRequest, arrivalStatus };
        }),
      );

      setReservations(hydrated);
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "No se pudieron cargar las reservas.";
      setError(message);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const normalizedReservations = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const deriveStatus = (res, startDate, endDate, hasCheckin, hasCheckout, hasCheckoutRequest) => {
      const base = String(res.estado || res.status || "CREADA").toUpperCase();
      if (base.includes("CANCEL")) return "CANCELADA";
      if (hasCheckout) return "FINALIZADA";
      if (hasCheckoutRequest || base.includes("CHECKOUT")) return "CHECKOUT_SOLICITADO";
      if (hasCheckin) return "EN PROCESO";
      if (startDate && startDate < todayStart) return "ATRASADO";
      if (startDate && startDate <= todayEnd) return "EN PROCESO";
      return "CREADA";
    };

    return reservations.map((res) => {
      const nombre = res.nombre ?? res.name ?? res.nombre_usuario ?? "";
      const apellido1 = res.apellido1 ?? res.apellido1_usuario ?? "";
      const apellido2 = res.apellido2 ?? res.apellido2_usuario ?? "";
      const fullName = [nombre, apellido1, apellido2].filter(Boolean).join(" ").trim();
      const email = res.email ?? res.email_usuario ?? "";
      const startRaw = res.fechaInicio ?? res.start ?? res.fecha_inicio;
      const endRaw = res.fechaFin ?? res.end ?? res.fecha_fin;
      const startDate = parseDate(startRaw);
      const endDate = parseDate(endRaw);
      const roomNumber =
        res.numero || res.nro_habitacion || res.habitacion || (res.habitacionId ? `#${res.habitacionId}` : "N/D");
      const roomType = res.tipo || res.tipoHabitacion || res.roomType || "N/D";
      const guests = res.huespedes ?? res.guests ?? "N/D";
      const status = res.estado || res.status || "Sin estado";
      const clienteId = res.clienteId || res.userId || res.usuarioId || res.cod_usuario || null;
      const arrivalStatus = res.arrivalStatus || "upcoming";
      const hasCheckin = Boolean(res.hasCheckin);
      const events = res.events || [];
      const hasCheckout = events.some((e) => (e.tipo || "").toLowerCase().includes("check-out"));
      const hasCheckoutRequest =
        Boolean(res.hasCheckoutRequest) ||
        events.some((e) => {
          const t = (e.tipo || "").toLowerCase();
          return t.includes("check-out") && t.includes("solic");
        });
      const derivedStatus = deriveStatus(res, startDate, endDate, hasCheckin, hasCheckout, hasCheckoutRequest);

      return {
        ...res,
        start: startRaw,
        end: endRaw,
        startDate,
        endDate,
        roomNumber,
        roomType,
        guests,
        status,
        clienteId,
        arrivalStatus,
        hasCheckin,
        hasCheckout,
        hasCheckoutRequest,
        events,
        derivedStatus,
        fullName,
        email,
      };
    });
  }, [reservations]);

  const todayRange = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, []);

  const arrivals = useMemo(
    () =>
      normalizedReservations.filter(
        (r) =>
          r.startDate &&
          ((r.startDate >= todayRange.start && r.startDate <= todayRange.end) || r.arrivalStatus === "missed"),
      ),
    [normalizedReservations, todayRange],
  );

  const departures = useMemo(
    () =>
      normalizedReservations.filter(
        (r) => r.endDate && r.endDate >= todayRange.start && r.endDate <= todayRange.end,
      ),
    [normalizedReservations, todayRange],
  );

  const inAction = useMemo(
    () =>
      normalizedReservations.filter((r) => {
        if (!r.startDate || !r.endDate) return false;
        const isToday = r.startDate <= todayRange.end && r.endDate >= todayRange.start;
        return isToday && r.hasCheckin;
      }),
    [normalizedReservations, todayRange],
  );

  const summaryCards = useMemo(
    () => [
      { id: "all", label: "Reservas cargadas", value: normalizedReservations.length, helper: "Todas las de clientes" },
      {
        id: "arrivals",
        label: "Llegadas hoy",
        value: arrivals.filter((a) => a.arrivalStatus === "pending").length,
        helper: "Check-in programados",
      },
      { id: "departures", label: "Salidas hoy", value: departures.length, helper: "Coordinar limpieza" },
      { id: "inaction", label: "Reservas en acción", value: inAction.length, helper: "Check-in ya realizado" },
      {
        id: "missed",
        label: "Check-in atrasados",
        value: arrivals.filter((a) => a.arrivalStatus === "missed").length,
        helper: "Revisar pendientes de días previos",
      },
    ],
    [normalizedReservations.length, arrivals, departures.length, inAction.length],
  );

  const sortedReservations = useMemo(() => {
    return [...normalizedReservations].sort((a, b) => {
      const aDate = a.startDate ? a.startDate.getTime() : 0;
      const bDate = b.startDate ? b.startDate.getTime() : 0;
      return aDate - bDate;
    });
  }, [normalizedReservations]);

  const handleCheckin = (reservaId) => {
    const reserva = reservations.find((r) => r.id === reservaId);
    setCheckinModal({
      open: true,
      mode: "checkin",
      reservaId,
      name: reserva?.fullName || reserva?.nombre || "",
      email: reserva?.email || "",
      rut: "",
    });
  };

  const handleCheckout = (reservaId) => {
    const reserva = reservations.find((r) => r.id === reservaId);
    setCheckinModal({
      open: true,
      mode: "checkout",
      reservaId,
      name: reserva?.fullName || reserva?.nombre || "",
      email: reserva?.email || "",
      rut: "",
    });
  };

  const submitCheckin = (e) => {
    e.preventDefault();
    if (!checkinModal.reservaId || !checkinModal.rut) return;
    setSubmitError("");
    const payload = {
      nombre: checkinModal.name,
      email: checkinModal.email,
      rut: checkinModal.rut,
    };
    const fn = checkinModal.mode === "checkout" ? checkoutReservation : checkinReservation;
    const errorFallback =
      checkinModal.mode === "checkout"
        ? "No se pudo registrar el check-out."
        : "No se pudo registrar el check-in.";

    fn(checkinModal.reservaId, payload)
      .then((updated) => {
        setReservations((prev) =>
          prev.map((r) =>
            r.id === updated.id
              ? {
                  ...r,
                  ...updated,
                  hasCheckin: true,
                  hasCheckout: checkinModal.mode === "checkout" ? true : r.hasCheckout,
                  arrivalStatus: checkinModal.mode === "checkout" ? r.arrivalStatus : "done",
                }
              : r,
          ),
        );
        setCheckinModal({ open: false, mode: "checkin", reservaId: null, name: "", email: "", rut: "" });
      })
      .catch((err) => {
        const message = err?.response?.data?.message || errorFallback;
        setSubmitError(message);
      });
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Empleado</p>
          <h1 className="h4 mb-1">Check-in y clientes</h1>
          <p className="text-muted small mb-0">
            Controla llegadas, salidas y reservas en acción con datos reales de la base.
          </p>
        </div>
        <div className="d-flex gap-2 align-items-center mt-3 mt-md-0">
          <span className={`badge ${getStatusClasses(PAGE_STATUS.LIVE)}`}>{PAGE_STATUS.LIVE}</span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Recargar"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <div className="row g-3 mb-4">
        {summaryCards.map((card) => (
          <div className="col-6 col-lg-3" key={card.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <p className="text-uppercase text-muted small mb-1">{card.label}</p>
                <h3 className="h5 mb-1">{loading ? "..." : card.value}</h3>
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
            <span className="badge bg-primary-subtle text-primary border">
              {loading ? "Cargando..." : "Datos en vivo"}
            </span>
          </div>
          {!loading && arrivals.length === 0 && !error && (
            <p className="text-muted small mb-0">Sin llegadas programadas para hoy.</p>
          )}
          {loading ? (
            <p className="text-muted mb-0">Cargando reservas...</p>
          ) : (
            arrivals.length > 0 && (
              <div className="table-responsive">
                <table className="table table-striped align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Reserva</th>
                      <th>Cliente (ID)</th>
                      <th>Hab.</th>
                      <th>Llegada</th>
                      <th>Estado</th>
                      <th>Check-in</th>
                      <th>Huéspedes</th>
                      <th className="text-end">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arrivals.map((arrival) => (
                      <tr key={arrival.id}>
                        <td className="fw-semibold">#{arrival.id}</td>
                        <td>{arrival.clienteId || "N/D"}</td>
                        <td>{arrival.roomNumber}</td>
                        <td>{formatDate(arrival.start)}</td>
                        <td>
                          <span className={statusBadge(arrival.derivedStatus || arrival.status)}>
                            {arrival.derivedStatus || arrival.status}
                          </span>
                        </td>
                        <td>
                          <span className={arrivalStatusBadge(arrival.arrivalStatus)}>
                            {arrival.arrivalStatus === "pending"
                              ? "Pendiente hoy"
                              : arrival.arrivalStatus === "missed"
                                ? "No llegó"
                                : arrival.arrivalStatus === "done"
                                  ? "Check-in registrado"
                                  : "Próximo"}
                          </span>
                        </td>
                        <td>{arrival.guests}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleCheckin(arrival.id)}
                          disabled={arrival.hasCheckin}
                        >
                          {arrival.hasCheckin ? "Check-in hecho" : "Realizar check-in"}
                        </button>
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
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
          {loading ? (
            <p className="text-muted mb-0">Cargando reservas...</p>
          ) : departures.length === 0 ? (
            <p className="text-muted small mb-0">Sin salidas programadas para hoy.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead>
                  <tr>
                    <th>Reserva</th>
                    <th>Hab.</th>
                    <th>Salida</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th className="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {departures.map((dep) => (
                    <tr key={dep.id}>
                      <td className="fw-semibold">#{dep.id}</td>
                      <td>{dep.roomNumber}</td>
                      <td>{formatDate(dep.end)}</td>
                      <td>
                        <span className={statusBadge(dep.status)}>{dep.status}</span>
                      </td>
                      <td>$ {Number(dep.totalHabitacion || dep.total || 0).toLocaleString()}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleCheckout(dep.id)}
                          disabled={dep.hasCheckout}
                        >
                          {dep.hasCheckout ? "Check-out hecho" : "Check-out"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <div>
              <h2 className="h6 mb-1">Reservas en acción</h2>
              <p className="text-muted small mb-0">Reservas con check-in registrado y estancia activa.</p>
            </div>
            <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
              Añadir nota
            </button>
          </div>
          {loading ? (
            <p className="text-muted mb-0">Cargando reservas...</p>
          ) : inAction.length === 0 ? (
            <p className="text-muted small mb-0">Sin reservas en acción en este momento.</p>
          ) : (
            <div className="row g-3">
              {inAction.map((guest) => (
                <div className="col-md-4" key={`${guest.roomNumber}-${guest.id}`}>
                  <div className="border rounded-3 p-3 h-100">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <p className="text-uppercase text-muted small mb-1">Hab. {guest.roomNumber}</p>
                        <h3 className="h6 mb-0">Reserva #{guest.id}</h3>
                      </div>
                      <span className={statusBadge(guest.derivedStatus || guest.status)}>
                        {guest.derivedStatus || guest.status}
                      </span>
                    </div>
                    <p className="text-muted small mb-2">
                      Estancia: {formatDate(guest.start)} - {formatDate(guest.end)}
                    </p>
                    <p className="text-muted small mb-0">Huéspedes: {guest.guests}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <div>
              <h2 className="h6 mb-1">Reservas de todos los clientes</h2>
              <p className="text-muted small mb-0">Vista completa para revisión rápida.</p>
            </div>
            <span className="badge bg-secondary-subtle text-secondary border">
              {loading ? "Cargando..." : `${sortedReservations.length} registros`}
            </span>
          </div>
          {loading ? (
            <p className="text-muted mb-0">Cargando reservas...</p>
          ) : sortedReservations.length === 0 ? (
            <p className="text-muted small mb-0">Sin reservas registradas.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead>
                  <tr>
                    <th>Reserva</th>
                    <th>Cliente (ID)</th>
                    <th>Hab.</th>
                    <th>Tipo</th>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Estado</th>
                    <th>Huéspedes</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedReservations.map((res) => (
                    <tr key={res.id}>
                      <td className="fw-semibold">#{res.id}</td>
                      <td>{res.clienteId || "N/D"}</td>
                      <td>{res.roomNumber}</td>
                      <td>{res.roomType}</td>
                      <td>{formatDate(res.start)}</td>
                      <td>{formatDate(res.end)}</td>
                      <td>
                        <span className={statusBadge(res.derivedStatus || res.status)}>
                          {res.derivedStatus || res.status}
                        </span>
                      </td>
                      <td>{res.guests}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {checkinModal.open && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {checkinModal.mode === "checkout" ? "Confirmar check-out" : "Confirmar check-in"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() =>
                    setCheckinModal({ open: false, mode: "checkin", reservaId: null, name: "", email: "", rut: "" })
                  }
                />
              </div>
              <form onSubmit={submitCheckin} noValidate>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre del huésped</label>
                    <input
                      type="text"
                      className="form-control"
                      value={checkinModal.name}
                      onChange={(e) => setCheckinModal((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Correo</label>
                    <input
                      type="email"
                      className="form-control"
                      value={checkinModal.email}
                      onChange={(e) => setCheckinModal((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">RUT (7-8 dígitos sin DV)</label>
                    <input
                      type="text"
                      className="form-control"
                      pattern="[0-9]{7,8}"
                      maxLength={8}
                      inputMode="numeric"
                      autoComplete="off"
                      value={checkinModal.rut}
                      onChange={(e) => setCheckinModal((p) => ({ ...p, rut: e.target.value }))}
                      required
                    />
                    <div className="form-text">Se usará para validar identidad; agregar DV en backend.</div>
                  </div>
                  {submitError && <div className="alert alert-danger mb-0">{submitError}</div>}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setCheckinModal({ open: false, reservaId: null, name: "", email: "", rut: "" })}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {checkinModal.mode === "checkout" ? "Confirmar check-out" : "Confirmar check-in"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {checkinModal.open && <div className="modal-backdrop fade show" />}
    </div>
  );
};

export default EmployeeClients;
