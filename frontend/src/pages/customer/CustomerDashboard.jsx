// src/pages/customer/CustomerDashboard.jsx
import CustomerOverview from "../../components/CustomerOverview";
import { useAuth } from "../../context/AuthContext";
import { PAGE_STATUS, getStatusClasses } from "../../utils/pageStatus";

const navCards = [
  {
    title: "Mis reservas",
    text: "Visualiza o cancela reservas activas. Seguimiento en línea.",
    href: "/customer/bookings",
    variant: "primary",
  },
  {
    title: "Nueva reserva",
    text: "Cotiza fechas y extras en pocos pasos.",
    href: "/customer/reservations",
    variant: "outline-primary",
  },
  {
    title: "Servicios de reserva",
    text: "Agrega cenas, traslados o decoraciones a tu estadía.",
    href: "/customer/booking-events",
    variant: "outline-secondary",
  },
  {
    title: "Servicios y experiencias",
    text: "Explora desayunos, transporte, tours y otros extras.",
    href: "/services",
    variant: "outline-secondary",
  },
  {
    title: "Mi perfil",
    text: "Actualiza contacto, idioma y preferencias.",
    href: "/customer/profile",
    variant: "outline-secondary",
  },
  {
    title: "Soporte rápido",
    text: "Escríbenos dudas o coordina cambios con el equipo.",
    href: "/contact",
    variant: "outline-secondary",
  },
];

const helpLinks = [
  { label: "Guía rápida: reservar en 3 pasos", href: "/customer/reservations" },
  { label: "Cómo agregar servicios a una reserva", href: "/customer/booking-events" },
  { label: "Políticas y contacto directo", href: "/contact" },
];

const CustomerDashboard = () => {
  const { user } = useAuth();
  const greeting = user?.name ? `Hola, ${user.name}` : "Hola!";

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
        <div>
          <p className="text-uppercase text-muted small mb-1">Dashboard de cliente</p>
          <h1 className="h4 mb-1">{greeting}, organiza tu estadía</h1>
          <p className="text-muted small mb-0">
            Usa los accesos para mover reservas, agregar servicios o pedir ayuda sin perderte.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <a className="btn btn-primary btn-sm" href="/customer/reservations">
            Nueva reserva
          </a>
          <a className="btn btn-outline-secondary btn-sm" href="/customer/bookings">
            Mis reservas
          </a>
          <span className={`badge ${getStatusClasses(PAGE_STATUS.LIVE)}`}>{PAGE_STATUS.LIVE}</span>
        </div>
      </div>

      <CustomerOverview />

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <div>
            <p className="text-uppercase text-muted small mb-1">Ruta recomendada</p>
            <h2 className="h6 mb-1">Reserva, agrega extras y confirma</h2>
            <p className="text-muted small mb-0">
              Empieza por “Nueva reserva”, luego suma servicios y revisa todo en “Mis reservas”.
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <span className="badge bg-primary-subtle text-primary border">Paso 1 · Reservar</span>
            <span className="badge bg-warning-subtle text-warning border">Paso 2 · Servicios</span>
            <span className="badge bg-success-subtle text-success border">Paso 3 · Confirmar</span>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted small mb-1">Accesos rápidos</p>
          <h2 className="h5 mb-0">Todo lo que necesitas a un clic</h2>
          <p className="text-muted small mb-0">Reservas, servicios, eventos y contacto agrupados.</p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {navCards.map((item) => (
          <div className="col-md-4" key={item.href}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{item.title}</h5>
                <p className="card-text text-muted flex-grow-1">{item.text}</p>
                <a className={`btn btn-${item.variant} btn-sm align-self-start`} href={item.href}>
                  Ir
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-uppercase text-muted small mb-1">Ayuda rápida</p>
                  <h3 className="h6 mb-0">No te pierdas</h3>
                </div>
                <span className={`badge ${getStatusClasses(PAGE_STATUS.EDITING)}`}>{PAGE_STATUS.EDITING}</span>
              </div>
              <ul className="list-unstyled mb-0">
                {helpLinks.map((link) => (
                  <li key={link.href} className="mb-2">
                    <a href={link.href} className="link-primary text-decoration-none">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-uppercase text-muted small mb-1">Atajos sugeridos</p>
              <h3 className="h6 mb-3">¿Qué quieres hacer ahora?</h3>
              <div className="d-flex flex-wrap gap-2">
                <a className="btn btn-outline-primary btn-sm" href="/customer/reservations">
                  Reservar con nuevas fechas
                </a>
                <a className="btn btn-outline-secondary btn-sm" href="/customer/booking-events">
                  Agregar servicio a una reserva
                </a>
                <a className="btn btn-outline-secondary btn-sm" href="/services">
                  Ver servicios disponibles
                </a>
                <a className="btn btn-outline-secondary btn-sm" href="/customer/profile">
                  Ajustar mi perfil
                </a>
                <a className="btn btn-outline-secondary btn-sm" href="/contact">
                  Hablar con el equipo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
