// src/pages/public/HomePage.jsx
import HeroSection from "../../components/HeroSection.jsx";
import CardImageShow from "../../components/CardImageShow.jsx";

const homePhoto = "/home_foto.jpg";
const roomImg = "/room.png";
const serviceImg = "/service.png";

const highlights = [
  {
    title: "Hospitalidad local",
    text: "Equipo residente que conoce la zona y te ayuda a vivirla como un local.",
  },
  {
    title: "Ubicación estratégica",
    text: "A pasos de rutas patrimoniales, viñedos y la mejor gastronomía regional.",
  },
  {
    title: "Experiencias a medida",
    text: "Tours, maridajes, caminatas y actividades curadas para cada temporada.",
  },
];

const spotlight = [
  {
    image: roomImg,
    alt: "Habitaciones",
    title: "Habitaciones",
    text: "Tipos single, doble y familiar con detalles cálidos y camas premium.",
    linkHref: "/rooms",
    linkLabel: "Explorar habitaciones",
  },
  {
    image: serviceImg,
    alt: "Servicios",
    title: "Servicios",
    text: "Desayunos caseros, lavandería ágil, transporte y guías locales verificados.",
    linkHref: "/services",
    linkLabel: "Ver servicios",
  },
];

const HomePage = () => {
  return (
    <>
      <HeroSection
        backgroundImage={homePhoto}
        title="Residencial Maule"
        subtitle="Descubre el valle, su vino y su cultura desde un refugio auténtico."
        primaryLabel="Explorar habitaciones"
        primaryHref="/rooms"
        secondaryLabel="Ver servicios"
        secondaryHref="/services"
        overlayOpacity={0.55}
      />

      <div className="home-gradient border-0 border-bottom">
        <div className="container py-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <span className="home-pill text-uppercase">Hecho en el Maule</span>
              <h2 className="display-6 fw-bold mb-3">Un hospedaje con alma regional</h2>
              <p className="text-muted lead mb-4">
                Comienza tu viaje con descanso real, gastronomía local y anfitriones que conocen cada secreto del valle.
              </p>
              <div className="row g-3">
                {highlights.map((item) => (
                  <div className="col-sm-6" key={item.title}>
                    <div className="home-panel h-100">
                      <h5 className="fw-semibold mb-2">{item.title}</h5>
                      <p className="text-muted mb-0 small">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="home-quote shadow-lg rounded-4">
                <p className="fs-5 mb-3">
                  “Nos quedamos dos noches y terminamos extendiendo la estadía: camas cómodas, desayuno con productos de la zona y recomendaciones que sólo un local te daría.”
                </p>
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-placeholder">CL</div>
                  <div>
                    <p className="mb-0 fw-semibold">Claudia y Matías</p>
                    <small className="text-muted">Viajeros de Santiago · 2024</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <span className="home-pill text-uppercase">Planifica tu estadía</span>
            <h3 className="h2 fw-bold mb-1">Habitaciones, servicios y soporte</h3>
            <p className="text-muted mb-0">
              Elige tu habitación, agrega experiencias y habla directo con el equipo antes de llegar.
            </p>
          </div>
          <a className="btn btn-outline-primary btn-sm mt-3 mt-md-0" href="/rooms">
            Ver disponibilidad
          </a>
        </div>

        <section className="row g-4">
          {spotlight.map((item) => (
            <div className="col-md-4" key={item.title}>
              <CardImageShow
                image={item.image}
                alt={item.alt}
                title={item.title}
                text={item.text}
                linkHref={item.linkHref}
                linkLabel={item.linkLabel}
              />
            </div>
          ))}
        </section>
      </div>

      <section className="home-cta text-white py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <p className="text-uppercase small mb-2 opacity-75">Listo para reservar</p>
              <h3 className="h1 fw-bold mb-3">Conecta con el Maule en tu próxima escapada</h3>
              <p className="mb-0 text-white-50">
                Cuéntanos si viajas en grupo, necesitas transporte o buscas una experiencia temática.
              </p>
            </div>
            <div className="col-lg-5 d-flex flex-column flex-sm-row gap-2 justify-content-lg-end">
              <a href="/rooms" className="btn btn-light fw-semibold w-100 w-sm-auto">
                Reservar ahora
              </a>
              <a href="/services" className="btn btn-outline-light w-100 w-sm-auto">
                Ver servicios
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
