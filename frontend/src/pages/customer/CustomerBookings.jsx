// src/pages/customer/CustomerBookings.jsx
import { useEffect, useMemo, useState } from "react";
import BookingDetailCard from "../../components/BookingDetailCard";
import {
  fetchReservations,
  fetchReservationEvents,
  fetchReservationServices,
  addReservationService,
  cancelReservationService,
  cancelReservation,
  requestCheckout,
} from "../../services/bookingService";
import { listServices } from "../../services/serviceService";

const statusBadge = (status = "") => {
  const normalized = status.toLowerCase();
  if (normalized.includes("final")) return "badge bg-success-subtle text-success border";
  if (normalized.includes("checkout") && normalized.includes("solic")) return "badge bg-info-subtle text-info border";
  if (normalized.includes("proceso")) return "badge bg-primary-subtle text-primary border";
  if (normalized.includes("atras")) return "badge bg-danger-subtle text-danger border";
  if (normalized.includes("cancel")) return "badge bg-secondary-subtle text-secondary border";
  if (normalized.includes("cread")) return "badge bg-warning-subtle text-warning border";
  return "badge bg-light text-muted border";
};

const parseDate = (value) => {
  if (!value) return null;
  // Evita desfases por zona horaria parseando la fecha (YYYY-MM-DD) en local.
  const parts = String(value).slice(0, 10).split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts.map((p) => Number(p));
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [codeFilter, setCodeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [servicesCatalog, setServicesCatalog] = useState([]);
  const [reservationServices, setReservationServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({
    serviceId: "",
    fecha: "",
    hora: "",
    cantidad: 1,
    nota: "",
  });
  const [loadingServices, setLoadingServices] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [cancelingReservation, setCancelingReservation] = useState(false);
  const [requestingCheckout, setRequestingCheckout] = useState(false);

  const normalizeEventType = (tipo = "") => String(tipo).trim().toLowerCase();
  const compactEventType = (tipo = "") => normalizeEventType(tipo).replace(/[\s_-]+/g, "");
  const isCheckinEvent = (tipo = "") => {
    const t = compactEventType(tipo);
    return t === "checkin";
  };
  const isCheckoutEvent = (tipo = "") => {
    const t = compactEventType(tipo);
    return t === "checkout";
  };
  const isCheckoutRequestEvent = (tipo = "") => {
    const t = normalizeEventType(tipo);
    return (t.includes("check-out") || t.includes("check out") || t.includes("checkout")) && t.includes("solicit");
  };

  useEffect(() => {
    if (servicesCatalog.length && !serviceForm.serviceId) {
      setServiceForm((prev) => ({ ...prev, serviceId: servicesCatalog[0].id }));
    }
  }, [servicesCatalog, serviceForm.serviceId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [resData, svcData] = await Promise.all([fetchReservations(), listServices()]);
        setServicesCatalog(svcData);
        const data = resData;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const bookingsWithEvents = await Promise.all(
          data.map(async (b) => {
            let events = [];
            try {
              events = await fetchReservationEvents(b.id);
            } catch (err) {
              console.error("Error cargando eventos de reserva", b.id, err);
            }

            const hasCheckin = events.some((e) => isCheckinEvent(e.tipo));
            const hasCheckout = events.some((e) => isCheckoutEvent(e.tipo));
            const hasCheckoutRequest = events.some((e) => isCheckoutRequestEvent(e.tipo));
            const startDate = parseDate(b.fechaInicio);
            const endDate = parseDate(b.fechaFin);
            const base = String(b.estado || "").toUpperCase();
            let derivedStatus = base || "CREADA";
            if (base.includes("CANCEL")) derivedStatus = "CANCELADA";
            else if (hasCheckout) derivedStatus = "FINALIZADA";
            else if (hasCheckoutRequest || base.includes("CHECKOUT")) derivedStatus = "CHECKOUT_SOLICITADO";
            else if (hasCheckin) derivedStatus = "EN PROCESO";
            else if (startDate && startDate <= todayEnd) {
              derivedStatus = hasCheckin ? "EN PROCESO" : "ATRASADO";
            }
            else derivedStatus = "CREADA";

            return {
              ...b,
              created: b.fechaInicio,
              start: b.fechaInicio,
              end: b.fechaFin,
              roomType: b.tipo,
              status: derivedStatus,
              guests: b.huespedes,
              totalHabitacion: b.totalHabitacion ?? b.total_habitacion,
              totalServicios: b.totalServicios ?? b.total_servicios,
              hasCheckin,
              hasCheckout,
              hasCheckoutRequest,
              events,
            };
          }),
        );

        setBookings(bookingsWithEvents);
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

  const selectedService = useMemo(
    () => servicesCatalog.find((s) => String(s.id) === String(serviceForm.serviceId)),
    [servicesCatalog, serviceForm.serviceId]
  );

  const formatTime = (num) => {
    if (num === null || num === undefined) return "";
    const totalMinutes = Math.round(Number(num) * 60);
    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  const blockOptions = useMemo(() => {
    if (selectedService && Array.isArray(selectedService.horarios) && selectedService.horarios.length > 0) {
      return selectedService.horarios.map((h) => {
        const start = Number(h.inicio ?? h.horaInicio ?? 0);
        const end = Number(h.fin ?? h.horaFin ?? start);
        return {
          value: start,
          label: `${formatTime(start)} - ${formatTime(end)}`,
        };
      });
    }
    return [{ value: 0, label: "00:00 - 23:00" }];
  }, [selectedService]);

  useEffect(() => {
    if (blockOptions.length === 0) return;
    const current = Number(serviceForm.hora);
    const values = blockOptions.map((b) => b.value);
    if (serviceForm.hora === "" || Number.isNaN(current) || !values.includes(current)) {
      setServiceForm((prev) => ({ ...prev, hora: blockOptions[0].value }));
    }
  }, [blockOptions, serviceForm.hora]);

  const selectedBooking = selectedBookingId
    ? bookings.find((b) => b.id === selectedBookingId)
    : null;

  const canCancelBooking = !!selectedBooking && ["CREADA", "ATRASADO"].includes((selectedBooking.status || "").toUpperCase());

  const [selectedEvents, setSelectedEvents] = useState([]);
  const hasCheckoutRequest =
    selectedEvents.some((ev) => isCheckoutRequestEvent(ev.tipo)) || (selectedBooking?.hasCheckoutRequest ?? false);
  const canRequestCheckout =
    !!selectedBooking &&
    ((selectedBooking.status || "").toUpperCase() === "EN PROCESO") &&
    !selectedBooking.hasCheckout &&
    !hasCheckoutRequest;

  const refreshBookingData = async () => {
    try {
      setLoadingServices(true);
      const data = await fetchReservations();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const bookingsWithEvents = await Promise.all(
        data.map(async (b) => {
          let events = [];
          try {
            events = await fetchReservationEvents(b.id);
          } catch (err) {
            console.error("Error cargando eventos de reserva", b.id, err);
          }

          const hasCheckin = events.some((e) => isCheckinEvent(e.tipo));
          const hasCheckout = events.some((e) => isCheckoutEvent(e.tipo));
          const hasCheckoutRequest = events.some((e) => isCheckoutRequestEvent(e.tipo));
          const startDate = parseDate(b.fechaInicio);
          const base = String(b.estado || "").toUpperCase();
          let derivedStatus = base || "CREADA";
          if (base.includes("CANCEL")) derivedStatus = "CANCELADA";
          else if (hasCheckout) derivedStatus = "FINALIZADA";
          else if (hasCheckoutRequest || base.includes("CHECKOUT")) derivedStatus = "CHECKOUT_SOLICITADO";
          else if (hasCheckin) derivedStatus = "EN PROCESO";
          else if (startDate && startDate < todayStart) derivedStatus = "ATRASADO";
          else if (startDate && startDate <= todayEnd) derivedStatus = "EN PROCESO";
          else derivedStatus = "CREADA";

          return {
            ...b,
            created: b.fechaInicio,
            start: b.fechaInicio,
            end: b.fechaFin,
            roomType: b.tipo,
            status: derivedStatus,
            guests: b.huespedes,
            totalHabitacion: b.totalHabitacion ?? b.total_habitacion,
            totalServicios: b.totalServicios ?? b.total_servicios,
            hasCheckin,
            hasCheckout,
            hasCheckoutRequest,
            events,
          };
        }),
      );

      setBookings(bookingsWithEvents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingServices(false);
    }
  };

  const reloadReservationServices = async (bookingId) => {
    if (!bookingId) return;
    try {
      setLoadingServices(true);
      const [events, services] = await Promise.all([
        fetchReservationEvents(bookingId),
        fetchReservationServices(bookingId),
      ]);
      setSelectedEvents(events);
      setReservationServices(services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    const loadEvents = async () => {
      if (!selectedBookingId) {
        setSelectedEvents([]);
        setReservationServices([]);
        return;
      }
      try {
        const [events, services] = await Promise.all([
          fetchReservationEvents(selectedBookingId),
          fetchReservationServices(selectedBookingId),
        ]);
        setSelectedEvents(events);
        setReservationServices(services);
        const booking = bookings.find((b) => b.id === selectedBookingId);
        setServiceForm((prev) => ({
          ...prev,
          serviceId: servicesCatalog[0]?.id || prev.serviceId || "",
          fecha: booking?.start?.slice(0, 10) || "",
          hora: "",
          cantidad: 1,
          nota: "",
        }));
      } catch (err) {
        console.error(err);
        setSelectedEvents([]);
        setReservationServices([]);
      }
    };
    loadEvents();
  }, [selectedBookingId, bookings, servicesCatalog]);

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    if (!serviceForm.serviceId || !serviceForm.fecha) return;
    setSavingService(true);
    setError("");
    try {
      await addReservationService(selectedBooking.id, {
        serviceId: Number(serviceForm.serviceId),
        fechaServicio: serviceForm.fecha,
        hora: Number(serviceForm.hora || 0),
        cantidad: Number(serviceForm.cantidad || 1),
        nota: serviceForm.nota,
      });
      await reloadReservationServices(selectedBooking.id);
      await refreshBookingData();
      setServiceForm((prev) => ({
        ...prev,
        hora: "",
        cantidad: 1,
        nota: "",
      }));
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "No se pudo agregar el servicio.";
      setError(message);
    } finally {
      setSavingService(false);
    }
  };

  const handleCancelService = async (itemId) => {
    if (!selectedBooking) return;
    if (!window.confirm("¿Cancelar este servicio de la reserva?")) return;
    setError("");
    try {
      await cancelReservationService(selectedBooking.id, itemId);
      await reloadReservationServices(selectedBooking.id);
      await refreshBookingData();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "No se pudo cancelar el servicio.";
      setError(message);
    }
  };

  const handleCancelReservation = async () => {
    if (!selectedBooking) return;
    const normalizedStatus = (selectedBooking.status || "").toUpperCase();
    if (!["CREADA", "ATRASADO"].includes(normalizedStatus)) {
      setError("Solo puedes cancelar reservas en estado CREADA o ATRASADO.");
      return;
    }
    if (!window.confirm("¿Cancelar esta reserva?")) return;
    setCancelingReservation(true);
    setError("");
    try {
      await cancelReservation(selectedBooking.id);
      await reloadReservationServices(selectedBooking.id);
      await refreshBookingData();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "No se pudo cancelar la reserva.";
      setError(message);
    } finally {
      setCancelingReservation(false);
    }
  };

  const handleRequestCheckout = async () => {
    if (!selectedBooking) return;
    if (!canRequestCheckout) {
      setError("Solo puedes solicitar check-out cuando la reserva está en proceso y sin check-out registrado.");
      return;
    }
    if (!window.confirm("¿Solicitar check-out?")) return;
    setRequestingCheckout(true);
    setError("");
    try {
      await requestCheckout(selectedBooking.id);
      await reloadReservationServices(selectedBooking.id);
      await refreshBookingData();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "No se pudo solicitar el check-out.";
      setError(message);
    } finally {
      setRequestingCheckout(false);
    }
  };

  const showPackagesSection = false;

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
        <>
          <BookingDetailCard
            booking={selectedBooking}
            events={selectedEvents}
            onClose={() => setSelectedBookingId(null)}
            onCancel={handleCancelReservation}
            canCancel={canCancelBooking}
            canceling={cancelingReservation}
            onRequestCheckout={handleRequestCheckout}
            canRequestCheckout={canRequestCheckout}
            requestingCheckout={requestingCheckout}
          />

          {showPackagesSection ? (
            <div className="row g-3 mt-2">
              <div className="col-lg-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h2 className="h6 mb-3">Solicitar paquete</h2>
                    <p className="text-muted small mb-3">
                      Paquetes armados por el staff (servicios + productos incluidos). Solo elige fecha, bloque y cantidad.
                    </p>
                    <form className="row g-2" onSubmit={handleAddService}>
                      <div className="col-12">
                        <label className="form-label">Paquete</label>
                        <select
                          className="form-select"
                          value={serviceForm.serviceId}
                          onChange={(e) => setServiceForm((prev) => ({ ...prev, serviceId: e.target.value }))}
                        >
                          {servicesCatalog.map((svc) => (
                            <option key={svc.id} value={svc.id}>
                              {svc.nombre} (${Number(svc.precio || 0).toLocaleString()})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label">Fecha</label>
                        <input
                          type="date"
                          className="form-control"
                          value={serviceForm.fecha}
                          min={selectedBooking.start?.slice(0, 10)}
                          max={selectedBooking.end?.slice(0, 10)}
                          onChange={(e) => setServiceForm((prev) => ({ ...prev, fecha: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label">Bloque horario</label>
                        <select
                          className="form-select"
                          value={serviceForm.hora}
                          onChange={(e) => setServiceForm((prev) => ({ ...prev, hora: Number(e.target.value) }))}
                          required
                        >
                          {blockOptions.map((b) => (
                            <option key={b.value} value={b.value}>
                              {b.label}
                            </option>
                          ))}
                        </select>
                        <small className="text-muted">Se muestran solo los bloques permitidos por el paquete.</small>
                      </div>
                      <div className="col-6">
                        <label className="form-label">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={serviceForm.cantidad}
                          onChange={(e) =>
                            setServiceForm((prev) => ({ ...prev, cantidad: Number(e.target.value) || 1 }))
                          }
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Notas</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={serviceForm.nota}
                          onChange={(e) => setServiceForm((prev) => ({ ...prev, nota: e.target.value }))}
                          placeholder="Ej: horario preferido"
                        />
                      </div>
                      <div className="col-12">
                        <button className="btn btn-primary w-100" type="submit" disabled={savingService}>
                          {savingService ? "Guardando..." : "Agregar"}
                        </button>
                      </div>
                    </form>
                    <small className="text-muted d-block mt-2">
                      Solo puedes agendar dentro de las fechas de tu reserva.
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h2 className="h6 mb-0">Paquetes en la reserva</h2>
                      {loadingServices && <span className="text-muted small">Actualizando...</span>}
                    </div>
                    {reservationServices.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-striped align-middle">
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Hora</th>
                              <th>Paquete</th>
                              <th>Cant</th>
                              <th>Subtotal</th>
                              <th>Estado</th>
                              <th />
                            </tr>
                          </thead>
                          <tbody>
                            {reservationServices.map((item) => (
                              <tr key={item.id}>
                                <td>{(item.fecha || "").slice(0, 10)}</td>
                                <td>{String(item.hora).padStart(2, "0")}:00</td>
                                <td>
                                  <div className="fw-semibold">{item.servicioNombre}</div>
                                  <small className="text-muted">{item.nota || "Sin notas"}</small>
                                </td>
                                <td>{item.cantidad}</td>
                                <td>$ {Number(item.total || 0).toLocaleString()}</td>
                                <td>
                                  <span
                                    className={
                                      item.estado === "cancelado"
                                        ? "badge bg-danger-subtle text-danger border"
                                        : "badge bg-success-subtle text-success border"
                                    }
                                  >
                                    {item.estado}
                                  </span>
                                </td>
                                <td className="text-end">
                                  {item.estado !== "cancelado" && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleCancelService(item.id)}
                                    >
                                      Cancelar
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted mb-0">Aún no agregas servicios a esta reserva.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default CustomerBookings;
