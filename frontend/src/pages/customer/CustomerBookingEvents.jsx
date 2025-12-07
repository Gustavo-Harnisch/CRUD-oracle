import { useEffect, useMemo, useState } from "react";
import {
  fetchReservations,
  fetchReservationServices,
  addReservationService,
  cancelReservationService,
} from "../../services/bookingService";
import { listServices } from "../../services/serviceService";
import { PAGE_STATUS, getStatusClasses } from "../../utils/pageStatus";

const formatTime = (num) => {
  if (num === null || num === undefined) return "";
  const totalMinutes = Math.round(Number(num) * 60);
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const CustomerBookingEvents = () => {
  const [reservations, setReservations] = useState([]);
  const [servicesCatalog, setServicesCatalog] = useState([]);
  const [reservationServices, setReservationServices] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [serviceForm, setServiceForm] = useState({
    serviceId: "",
    fecha: "",
    hora: "",
    cantidad: 1,
    nota: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [resData, svcData] = await Promise.all([fetchReservations(), listServices()]);
        setReservations(resData);
        setServicesCatalog(svcData);
        setServiceForm((prev) => ({
          ...prev,
          serviceId: svcData[0]?.id || "",
        }));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las reservas o servicios.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedService = useMemo(
    () => servicesCatalog.find((s) => String(s.id) === String(serviceForm.serviceId)),
    [servicesCatalog, serviceForm.serviceId]
  );

  const blockOptions = useMemo(() => {
    if (selectedService && Array.isArray(selectedService.horarios) && selectedService.horarios.length > 0) {
      return selectedService.horarios.map((h) => {
        const start = Number(h.inicio ?? h.horaInicio ?? 0);
        const end = Number(h.fin ?? h.horaFin ?? start);
        return { value: start, label: `${formatTime(start)} - ${formatTime(end)}` };
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

  useEffect(() => {
    const loadServices = async () => {
      if (!selectedId) {
        setReservationServices([]);
        return;
      }
      setLoadingServices(true);
      setError("");
      try {
        const data = await fetchReservationServices(selectedId);
        setReservationServices(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los servicios de la reserva.");
        setReservationServices([]);
      } finally {
        setLoadingServices(false);
      }
    };
    loadServices();
  }, [selectedId]);

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!selectedId) {
      setError("Selecciona una reserva.");
      return;
    }
    if (!serviceForm.serviceId || !serviceForm.fecha) {
      setError("Selecciona servicio y fecha.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addReservationService(selectedId, {
        serviceId: Number(serviceForm.serviceId),
        fechaServicio: serviceForm.fecha,
        hora: Number(serviceForm.hora || 0),
        cantidad: Number(serviceForm.cantidad || 1),
        nota: serviceForm.nota,
      });
      const updated = await fetchReservationServices(selectedId);
      setReservationServices(updated);
      setServiceForm((prev) => ({
        ...prev,
        hora: blockOptions[0]?.value ?? "",
        cantidad: 1,
        nota: "",
      }));
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "No se pudo agregar el servicio.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelService = async (itemId) => {
    if (!selectedId) return;
    if (!window.confirm("¿Cancelar este servicio de la reserva?")) return;
    setError("");
    try {
      await cancelReservationService(selectedId, itemId);
      const updated = await fetchReservationServices(selectedId);
      setReservationServices(updated);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "No se pudo cancelar el servicio.";
      setError(msg);
    }
  };

  const selectedReservation = useMemo(
    () => reservations.find((r) => String(r.id) === String(selectedId)),
    [reservations, selectedId]
  );

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Servicios de reserva</p>
          <h1 className="h4 mb-0">Agrega extras a tus reservas</h1>
          <p className="text-muted small mb-0">Selecciona la reserva, el servicio y la fecha para programarlo.</p>
        </div>
        <span className={`badge ${getStatusClasses(PAGE_STATUS.LIVE)}`}>{PAGE_STATUS.LIVE}</span>
      </div>

      {loading && <p className="text-muted">Cargando reservas y servicios...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && (
        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h2 className="h6 mb-3">Programar servicio</h2>
                <form className="row g-3" onSubmit={handleAddService}>
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
                    {selectedReservation && (
                      <small className="text-muted">
                        {selectedReservation.fechaInicio?.slice(0, 10)} → {selectedReservation.fechaFin?.slice(0, 10)}
                      </small>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Servicio</label>
                    <select
                      className="form-select"
                      value={serviceForm.serviceId}
                      onChange={(e) => setServiceForm((prev) => ({ ...prev, serviceId: e.target.value }))}
                    >
                      {servicesCatalog.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} · $ {Number(s.precio || 0).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Fecha</label>
                    <input
                      type="date"
                      className="form-control"
                      value={serviceForm.fecha}
                      onChange={(e) => setServiceForm((prev) => ({ ...prev, fecha: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Horario</label>
                    <select
                      className="form-select"
                      value={serviceForm.hora}
                      onChange={(e) => setServiceForm((prev) => ({ ...prev, hora: e.target.value }))}
                    >
                      {blockOptions.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={serviceForm.cantidad}
                      onChange={(e) =>
                        setServiceForm((prev) => ({ ...prev, cantidad: Number(e.target.value) || 1 }))
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Nota (opcional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={serviceForm.nota}
                      onChange={(e) => setServiceForm((prev) => ({ ...prev, nota: e.target.value }))}
                      placeholder="Ej: sin gluten, traslado aeropuerto, etc."
                    />
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary" type="submit" disabled={saving || !selectedId}>
                      {saving ? "Guardando..." : "Agregar servicio"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <p className="text-uppercase text-muted small mb-1">Servicios programados</p>
                    <h2 className="h6 mb-0">Reserva seleccionada</h2>
                  </div>
                  <span className={`badge ${getStatusClasses(PAGE_STATUS.LIVE)}`}>{PAGE_STATUS.LIVE}</span>
                </div>
                {loadingServices ? (
                  <p className="text-muted small mb-0">Cargando servicios...</p>
                ) : reservationServices.length === 0 ? (
                  <p className="text-muted small mb-0">
                    {selectedId ? "No hay servicios aún. Agrega el primero." : "Selecciona una reserva."}
                  </p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {reservationServices.map((item) => (
                      <li key={item.id} className="list-group-item d-flex justify-content-between align-items-start">
                        <div className="me-3">
                          <p className="mb-1 fw-semibold">{item.nombreServicio || item.servicioNombre}</p>
                          <small className="text-muted">
                            {item.fechaServicio?.slice(0, 10)} · {formatTime(item.hora)} · Cant. {item.cantidad}
                          </small>
                          {item.nota && (
                            <>
                              <br />
                              <small className="text-muted">Nota: {item.nota}</small>
                            </>
                          )}
                        </div>
                        <div className="d-flex flex-column align-items-end gap-2">
                          <span className="badge bg-light text-secondary border">
                            $ {Number(item.precio || 0).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleCancelService(item.id)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookingEvents;
