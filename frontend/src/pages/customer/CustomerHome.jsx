// src/pages/customer/CustomerHome.jsx
import HeroSection from "../../components/HeroSection";
import CustomerOverview from "../../components/CustomerOverview";
import { useAuth } from "../../context/AuthContext";

const customerHero = "/customer-hero.jpg";

const quickActions = [
  { title: "Mis reservas", text: "Revisa o cancela tus reservas activas.", href: "/customer/bookings", variant: "primary" },
  { title: "Nueva reserva", text: "Cotiza fechas y extras en pocos pasos.", href: "/customer/reservations", variant: "outline-primary" },
  { title: "Eventos de reserva", text: "Agrega cenas, traslados o decoraciones.", href: "/customer/booking-events", variant: "outline-secondary" },
  { title: "Perfil", text: "Actualiza datos de contacto y preferencias.", href: "/customer/profile", variant: "outline-secondary" },
  { title: "Ofertas y experiencias", text: "Descubre paquetes y actividades.", href: "/services", variant: "outline-secondary" },
];

const CustomerHome = () => {
  const { user } = useAuth();
  const greeting = user?.name ? `Hola, ${user.name}` : "Hola!";
  const subtitle = "Preparado para tu próxima aventura en el Maule?";

  return (
    <>
      <HeroSection
        backgroundImage={customerHero}
        title={greeting}
        subtitle={subtitle}
        primaryLabel="Mis reservas"
        primaryHref="/customer/bookings"
        secondaryLabel="Contacto rápido"
        secondaryHref="/contact"
        overlayOpacity={0.55}
      />

      <div className="container py-4">
        <CustomerOverview />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
          <div>
            <p className="text-uppercase text-muted small mb-1">Panel rápido</p>
            <h2 className="h5 mb-0">Accesos para cliente</h2>
            <p className="text-muted small mb-0">Accede a reservas, eventos y servicios con datos reales.</p>
          </div>
          <span className="badge bg-success-subtle text-success border">Live</span>
        </div>

        <div className="row g-3">
          {quickActions.map((item) => (
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
      </div>
    </>
  );
};

export default CustomerHome;
