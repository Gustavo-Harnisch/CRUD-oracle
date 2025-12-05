// src/pages/HomePage.jsx
import HeroSection from "../../components/HeroSection.jsx";
import CardImageShow from "../../components/CardImageShow.jsx";

const homePhoto = "/home_foto.jpg";
const roomImg = "/room.png";
const serviceImg = "/service.png";
const contactImg = "/contact.png";

const HomePage = () => {
  return (
    <>
      <HeroSection
        backgroundImage={homePhoto}
        title="Residencial Maule"
        subtitle="Un Tesoro Cultural en el Corazón de Chile"
        primaryLabel="Reservar ahora"
        primaryHref="/rooms"
        secondaryLabel="Ver habitaciones"
        secondaryHref="/rooms"
        overlayOpacity={0.5}
      />

      <div className="container py-5">
        <section className="row g-3">
          <div className="col-md-4">
            <CardImageShow
              image={roomImg}
              alt="Habitaciones"
              title="Habitaciones"
              text="Revisa la disponibilidad, tipos de habitación y detalles principales."
              linkHref="/rooms"
              linkLabel="Ir a habitaciones"
            />
          </div>

          <div className="col-md-4">
            <CardImageShow
              image={serviceImg}
              alt="Servicios"
              title="Servicios"
              text="Conoce los servicios que ofrece la Residencial del Maule a sus huéspedes."
              linkHref="/services"
              linkLabel="Ver servicios"
            />
          </div>

          <div className="col-md-4">
            <CardImageShow
              image={contactImg}
              alt="Contacto"
              title="Contacto"
              text="¿Dudas, reportes, reservas especiales o grupos? Escríbenos directamente."
              linkHref="/contact"
              linkLabel="Ir a contacto"
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
