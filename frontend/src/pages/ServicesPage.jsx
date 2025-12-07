// src/pages/ServicesPage.jsx
import { useEffect, useState } from "react";
import { listServices } from "../services/serviceService";
import { PAGE_STATUS, getStatusClasses } from "../utils/pageStatus";

const baseServices = [
  { title: "Desayuno local", text: "Incluido en la mayoría de las estadías. Café de grano, pan amasado y mermeladas caseras." },
  { title: "WiFi estable", text: "Cobertura en habitaciones y áreas comunes para trabajo remoto." },
  { title: "Estacionamiento", text: "Cupos limitados. Reserva anticipada sin costo en estadías premium." },
  { title: "Limpieza diaria", text: "Cambio de toallas y repaso diario en habitaciones." },
  { title: "Asistencia 24/7", text: "Recepción siempre disponible para solicitudes y emergencias." },
  { title: "Amenities", text: "Set de baño, secador y agua de cortesía en cada habitación." },
];

const formatTime = (num) => {
  if (num === null || num === undefined) return "";
  const totalMinutes = Math.round(Number(num) * 60);
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const formatPrice = (value) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const data = await listServices();
        setServices(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los servicios");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <section className="services-hero mb-4">
        <div className="container position-relative">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="services-pill text-uppercase">Servicios y experiencias</span>
              <h1 className="display-6 fw-bold text-white mb-3">Arma tu estadía con extras curados</h1>
              <p className="lead text-white-50 mb-4">
                Suma transporte, desayunos tempranos, guías locales y detalles premium. Coordinamos horarios y proveedores por ti.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <a className="btn btn-light fw-semibold px-4" href="/rooms">
                  Reservar con extras
                </a>
                <a className="btn btn-outline-light px-4" href="/customer/booking-events">
                  Agregar servicios a mi reserva
                </a>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="services-panel text-white">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <p className="small text-uppercase mb-1 opacity-75">Atención a huéspedes</p>
                    <p className="mb-0 fw-semibold">Equipo en línea 24/7</p>
                  </div>
                  <span className={`badge ${getStatusClasses(PAGE_STATUS.LIVE)} shadow-sm`}>{PAGE_STATUS.LIVE}</span>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="services-kpi">
                      <p className="mb-1 small text-white-50">Confirmación</p>
                      <p className="mb-0 fw-bold text-white">Menos de 15 min</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="services-kpi">
                      <p className="mb-1 small text-white-50">Horarios</p>
                      <p className="mb-0 fw-bold text-white">Coordinados por el staff</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="services-kpi">
                      <p className="mb-1 small text-white-50">Pagos</p>
                      <p className="mb-0 fw-bold text-white">Se añaden al checkout</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="services-kpi">
                      <p className="mb-1 small text-white-50">Proveedores</p>
                      <p className="mb-0 fw-bold text-white">Locales y verificados</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container pb-5">
        <section className="mb-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <div>
              <p className="text-uppercase text-muted small mb-1">Incluido en tu estadía</p>
              <h2 className="h4 mb-1">Lo esencial, siempre listo</h2>
              <p className="text-muted mb-0">Servicios base que preparamos para que sólo te preocupes de disfrutar.</p>
            </div>
            <small className="text-muted text-md-end">Cobertura en planes estándar y premium</small>
          </div>

          <div className="row g-3">
            {baseServices.map((service) => (
              <div className="col-sm-6 col-lg-4" key={service.title}>
                <div className="service-tile h-100">
                  <div className="service-tile__dot" />
                  <div>
                    <h5 className="mb-1">{service.title}</h5>
                    <p className="text-muted small mb-0">{service.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <div>
              <p className="text-uppercase text-muted small mb-1">Catálogo a la carta</p>
              <h2 className="h5 mb-1">Servicios destacados</h2>
              <p className="text-muted small mb-0">Valores referenciales — ajustables según temporada.</p>
            </div>
            <div className="d-flex flex-column text-md-end">
              <span className="badge bg-primary-subtle text-primary border align-self-start align-self-md-end">
                {loading ? "Actualizando..." : `${services.length} disponibles`}
              </span>
              <small className="text-muted">Coordinamos agenda y proveedores por ti.</small>
            </div>
          </div>

          {error && <div className="alert alert-danger mb-3">{error}</div>}
          {loading && !error ? <div className="alert alert-secondary mb-3">Cargando experiencias...</div> : null}

          {!loading && !error && services.length === 0 ? (
            <div className="alert alert-info">Por ahora no hay servicios adicionales cargados. Escríbenos y armamos algo a medida.</div>
          ) : null}

          {!loading && !error && services.length > 0 ? (
            <div className="row g-4">
              {services.map((svc) => {
                const hasSchedule = Array.isArray(svc.horarios) && svc.horarios.length > 0;
                return (
                  <div className="col-lg-6" key={svc.id}>
                    <div className="service-card h-100">
                      <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                        <div>
                          <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                            <span className="service-type-pill">{svc.tipo || "Servicio activo"}</span>
                            <span className={`service-state ${svc.estado ? "is-live" : ""}`}>{svc.estado || "Activo"}</span>
                          </div>
                          <h3 className="h5 mb-1">{svc.nombre}</h3>
                          <p className="text-muted small mb-0">{svc.descripcion || "Sin descripción"}</p>
                        </div>
                        <div className="text-end">
                          <div className="service-price">{formatPrice(svc.precio)}</div>
                          <small className="text-muted">referencial</small>
                        </div>
                      </div>

                      {hasSchedule ? (
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          {svc.horarios.map((h) => (
                            <span key={`${svc.id}-${h.id || h.inicio}`} className="services-schedule">
                              {`${formatTime(h.inicio)} - ${formatTime(h.fin)}`}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <small className="text-muted mb-3 d-block">Horario flexible según tu itinerario.</small>
                      )}

                      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-3 border-top">
                        <div className="d-flex flex-wrap gap-2 align-items-center">
                          <span className="badge bg-light text-secondary border">Coordinación inmediata</span>
                          <span className="badge bg-light text-secondary border">Equipo local</span>
                        </div>
                        <a className="btn btn-outline-primary btn-sm" href="/customer/booking-events">
                          Gestionar
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </section>

        <section className="services-help rounded-4 p-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
            <div>
              <h4 className="mb-1">¿Necesitas algo especial?</h4>
              <p className="text-muted mb-0 small">Coordinamos desayunos tempranos, traslado al aeropuerto o experiencias privadas. Cuéntanos tu plan.</p>
            </div>
            <div className="ms-md-auto d-flex flex-wrap gap-2">
              <a className="btn btn-primary" href="/customer/booking-events">
                Agregar a mi reserva
              </a>
              <a className="btn btn-outline-secondary" href="/rooms">
                Ver habitaciones
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ServicesPage;
