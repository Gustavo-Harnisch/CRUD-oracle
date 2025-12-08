import "./HomePage.css";

const highlights = [
  {
    icon: "🛏️",
    title: "Reservas en pocos pasos",
    text: "Elige fechas, tipo de habitación y confirma para quedarte sin sorpresas.",
  },
  {
    icon: "📅",
    title: "Disponibilidad transparente",
    text: "Calendario actualizado y tarifas claras para planear la estadía con confianza.",
  },
  {
    icon: "🌙",
    title: "Ambiente cuidado",
    text: "Habitaciones luminosas, silencio profundo y ropa de cama suave para descansar sin ruido.",
  },
];

const serviceHighlights = [
  {
    title: "Habitaciones y suites",
    text: "Revisa cada tipo, tarifas y comodidades para dar con la opción ideal.",
  },
  {
    title: "Servicios bajo demanda",
    text: "Agrega desayunos, limpieza extra o experiencias diseñadas por nuestro equipo.",
  },
  {
    title: "Soporte antes del check-in",
    text: "Respondemos preguntas y confirmamos detalles al reservar.",
  },
];

const bookingSupport = [
  {
    title: "Mensaje en minutos",
    text: "WhatsApp, correo o llamada: elegís el canal y confirmamos disponibilidad al instante.",
  },
  {
    title: "Confirmaciones seguras",
    text: "Recibís número de reserva y recordatorios antes de llegar.",
  },
  {
    title: "Ajustes flexibles",
    text: "Modificamos fechas o servicios sin trámites pesados.",
  },
];

const HomePage = () => {
  return (
    <div className="home-shell">
      <section className="home-hero">
        <div className="home-hero__glow home-hero__glow--one" aria-hidden="true" />
        <div className="home-hero__glow home-hero__glow--two" aria-hidden="true" />
        <div className="home-hero__light home-hero__light--one" aria-hidden="true" />
        <div className="home-hero__light home-hero__light--two" aria-hidden="true" />

        <div className="home-hero__content">
          <span className="home-pill">Residencial Maule</span>
          <h1>Respira el Maule, vive un reposo hecho a medida</h1>
          <p className="home-hero__description">
            Habitaciones minimalistas y servicio amable para que reserves con confianza y te concentres en descansar.
          </p>
          <div className="home-hero__actions">
            <a className="home-btn home-btn--solid" href="/rooms">
              Explorar habitaciones
            </a>
            <a className="home-btn home-btn--ghost" href="/services">
              Ver servicios y experiencias
            </a>
          </div>
        </div>

      </section>

      <section className="home-gallery">
        <div className="home-gallery__content">
          <span className="home-pill">Detalles que inspiran calma</span>
          <h2>Colores suaves, texturas naturales y luz medida</h2>
          <p>
            Respirar el Maule también es dejar que tus ojos se relajan: cortinas translúcidas,
            mesas de madera clara y materiales pulidos se suman a cada reserva.
          </p>
          <div className="home-gallery__grid">
            {[
              {
                title: "Luz diaria",
                description: "Ventanas grandes con vistas abiertas y cortinas automáticas que regulan el brillo.",
              },
              {
                title: "Texturas orgánicas",
                description: "Alfombras artesanales, mantas de lino y madera certificada para un tacto cálido.",
              },
              {
                title: "Tiempo para ti",
                description: "Ritmos tranquilos, rituales de bienvenida y música ambiental cuando reservas el descanso.",
              },
            ].map((item) => (
              <article key={item.title} className="home-gallery__card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="home-gallery__glow" aria-hidden="true" />
      </section>

      <section className="home-section home-section--soft">
        <div className="home-section__content">
          <div>
            <span className="home-pill">Servicios listos para tu estadía</span>
            <h2>Descubre lo que puedes reservar</h2>
            <p>
              Habitaciones, servicios y detalles extras para que armes la estadía sin perder la calma.
            </p>
          </div>

          <div className="home-section__card">
            <h3>Opciones disponibles</h3>
            <ul className="home-section__card-list">
              {serviceHighlights.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="home-section home-section--support">
        <div className="home-section__header">
          <span className="home-pill">Reserva con compañía</span>
          <h2>Siempre estamos atentos</h2>
          <p>
            Respondemos rápido y actualizamos tu reserva sin trámites engorrosos.
          </p>
        </div>

        <div className="home-support">
          {bookingSupport.map((item) => (
            <article className="home-support__card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div>
          <p className="home-pill home-pill--light">Listos para recibirte</p>
          <h3>Reserva un refugio tranquilo y comienza la escapada</h3>
          <p>
            Escríbenos con tus fechas, peticiones y compañeros de viaje. Respondemos en minutos con opciones claras.
          </p>
        </div>
        <div className="home-cta__actions">
          <a className="home-btn home-btn--solid" href="/rooms">
            Reservar ahora
          </a>
          <a className="home-btn home-btn--ghost" href="/services">
            Contactar al equipo
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
