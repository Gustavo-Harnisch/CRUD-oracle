import { useEffect, useMemo, useState } from "react";
import { fetchReservations, fetchReservationServices } from "../../services/bookingService";
import { fetchServiceProducts } from "../../services/serviceService";
import { PAGE_STATUS, getStatusClasses } from "../../utils/pageStatus";

const statusVariant = (status = "") => {
  const normalized = status.toLowerCase();
  if (normalized.includes("escala") || normalized.includes("vip"))
    return "badge bg-danger-subtle text-danger border";
  if (normalized.includes("progreso") || normalized.includes("ejec"))
    return "badge bg-info-subtle text-info border";
  if (normalized.includes("final") || normalized.includes("listo"))
    return "badge bg-success-subtle text-success border";
  if (normalized.includes("pend"))
    return "badge bg-warning-subtle text-warning border";
  return "badge bg-light text-secondary border";
};

const stageFromStatus = (status = "") => {
  const normalized = status.toLowerCase();
  if (normalized.includes("final") || normalized.includes("listo")) return "done";
  if (normalized.includes("escala") || normalized.includes("vip")) return "escalated";
  if (normalized.includes("ejec") || normalized.includes("progreso")) return "progress";
  return "pending";
};

const formatDate = (value) => {
  if (!value) return "N/D";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/D";
  return d.toLocaleDateString();
};

const formatHour = (value) => {
  if (!Number.isFinite(value)) return "--:--";
  const hh = String(value).padStart(2, "0");
  return `${hh}:00`;
};

const EmployeeRequests = () => {
  const [tickets, setTickets] = useState([]);
  const [serviceProducts, setServiceProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const resData = await fetchReservations({ all: 1 });
      const reservationMap = new Map(
        (Array.isArray(resData) ? resData : []).map((r) => [
          r.id,
          {
            roomNumber:
              r.numero || r.nro_habitacion || r.habitacion || (r.habitacionId ? `#${r.habitacionId}` : "N/D"),
            clienteId: r.clienteId || r.userId || r.usuarioId || r.cod_usuario || null,
            start: r.fechaInicio ?? r.start ?? r.fecha_inicio,
            end: r.fechaFin ?? r.end ?? r.fecha_fin,
          },
        ]),
      );

      const servicesByReservation = await Promise.all(
        (Array.isArray(resData) ? resData : []).map(async (res) => {
          try {
            const items = await fetchReservationServices(res.id);
            return (items || []).map((it) => ({
              ...it,
              roomNumber: reservationMap.get(res.id)?.roomNumber || "N/D",
              clienteId: reservationMap.get(res.id)?.clienteId || "N/D",
              start: reservationMap.get(res.id)?.start || null,
              end: reservationMap.get(res.id)?.end || null,
              stage: stageFromStatus(it.estado || ""),
            }));
          } catch (err) {
            console.error("Error cargando servicios de reserva", res.id, err);
            return [];
          }
        }),
      );

      const flatTickets = servicesByReservation.flat();
      setTickets(flatTickets);

      const uniqueServiceIds = [...new Set(flatTickets.map((t) => t.servicioId).filter(Boolean))];
      if (uniqueServiceIds.length > 0) {
        const entries = await Promise.all(
          uniqueServiceIds.map(async (sid) => {
            try {
              const prods = await fetchServiceProducts(sid);
              return [sid, prods || []];
            } catch (err) {
              console.error("Error cargando productos del servicio", sid, err);
              return [sid, []];
            }
          }),
        );
        setServiceProducts(Object.fromEntries(entries));
      } else {
        setServiceProducts({});
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "No se pudieron cargar las peticiones.";
      setError(message);
      setTickets([]);
      setServiceProducts({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const grouped = useMemo(() => {
    const base = {
      pending: [],
      progress: [],
      escalated: [],
      done: [],
    };
    tickets.forEach((t) => {
      const stage = t.stage || stageFromStatus(t.estado || "");
      if (stage === "escalated") base.escalated.push(t);
      else if (stage === "progress") base.progress.push(t);
      else if (stage === "done") base.done.push(t);
      else base.pending.push(t);
    });
    return base;
  }, [tickets]);

  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendedToday = grouped.done.filter((t) => {
      if (!t.updatedAt) return false;
      const d = new Date(t.updatedAt);
      if (Number.isNaN(d.getTime())) return false;
      return d >= today;
    }).length;
    return [
      { id: "open", label: "Solicitudes abiertas", value: tickets.length - grouped.done.length, helper: "Actualiza SLA" },
      { id: "vip", label: "VIP / Escaladas", value: grouped.escalated.length, helper: "Resolver antes de 30 min" },
      { id: "today", label: "Atendidas hoy", value: attendedToday, helper: `${grouped.progress.length} en progreso` },
    ];
  }, [grouped.done.length, grouped.escalated.length, grouped.progress.length, tickets.length]);

  const columns = useMemo(
    () => [
      { id: "pending", title: "Pendientes / nuevos", tone: "warning", items: grouped.pending },
      { id: "progress", title: "En ejecución", tone: "info", items: grouped.progress },
      { id: "escalated", title: "Escaladas / VIP", tone: "danger", items: grouped.escalated },
      { id: "done", title: "Finalizados", tone: "success", items: grouped.done },
    ],
    [grouped],
  );

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Empleado</p>
          <h1 className="h4 mb-1">Peticiones de huéspedes</h1>
          <p className="text-muted small mb-0">
            Tablero operativo con prioridades, estados y productos asociados a servicios de reservas.
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
          <button type="button" className="btn btn-primary btn-sm" disabled>
            Nuevo ticket
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
            Ver historial
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <div className="row g-3 mb-4">
        {summary.map((card) => (
          <div className="col-12 col-md-4" key={card.id}>
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

      <div className="row g-3">
        {columns.map((column) => (
          <div className="col-md-6 col-xl-3" key={column.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h6 mb-0">{column.title}</h2>
                  <span className={`badge bg-${column.tone}-subtle text-${column.tone} border`}>
                    {loading ? "..." : `${column.items.length} en cola`}
                  </span>
                </div>
                <div className="d-flex flex-column gap-3">
                  {loading ? (
                    <p className="text-muted small mb-0">Cargando solicitudes...</p>
                  ) : column.items.length === 0 ? (
                    <p className="text-muted small mb-0">Sin tickets en esta columna.</p>
                  ) : (
                    column.items.map((req) => {
                      const productos = serviceProducts[req.servicioId] || [];
                      return (
                        <div key={req.id} className="border rounded-3 p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <p className="text-muted small mb-1">
                                Hab. {req.roomNumber} · Reserva #{req.reservaId}
                              </p>
                              <h3 className="h6 mb-0">{req.servicioNombre}</h3>
                            </div>
                            <span className={statusVariant(req.estado)}>{req.estado || "Pendiente"}</span>
                          </div>
                          <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                            <span className="badge bg-light text-muted border">{req.tipo || "Sin tipo"}</span>
                            {productos.length > 0 && (
                              <span className="badge bg-secondary-subtle text-secondary border">
                                {productos.length} prod.
                              </span>
                            )}
                            {Number.isFinite(req.hora) && (
                              <span className="badge bg-light text-muted border">Hora: {formatHour(req.hora)}</span>
                            )}
                            {req.fecha && (
                              <span className="badge bg-light text-muted border">
                                Fecha: {formatDate(req.fecha)}
                              </span>
                            )}
                          </div>
                          <p className="text-muted small mb-2">
                            Cliente ID: {req.clienteId || "N/D"} · Estancia: {formatDate(req.start)} -{" "}
                            {formatDate(req.end)}
                          </p>
                          {req.nota && <p className="text-muted small mb-2">Nota: {req.nota}</p>}
                          <div className="d-flex gap-2">
                            <button type="button" className="btn btn-outline-success btn-sm" disabled>
                              Marcar finalizado
                            </button>
                            <button type="button" className="btn btn-outline-primary btn-sm" disabled>
                              Reasignar / editar
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-muted small mt-3 mb-0">
        Flujo de estados (empleado): Pendiente → En ejecución → Finalizado. Flujo visible para el cliente: Creado →
        En cola → En ejecución → Listo. Vincula productos al servicio (por tipo Spa/Exterior/etc.) para saber insumos
        requeridos por ticket.
      </p>
      {lastUpdated && (
        <p className="text-muted small mb-0">Última actualización: {lastUpdated.toLocaleString()}</p>
      )}
    </div>
  );
};

export default EmployeeRequests;
