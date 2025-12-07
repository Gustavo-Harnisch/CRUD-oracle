// src/components/Footer.jsx
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-4 mt-4">
      <div className="container">
        <div className="row gy-3">
          <div className="col-12 col-md">
            <small>© {year} Residencial Maule - Linares, Chile</small>
            <div>
              <small className="text-secondary">Contacto: contacto@residencialdelmaule.cl</small>
            </div>
          </div>

          <div className="col-12 col-md-auto text-md-end">
            <small className="text-secondary">
              Powered by UCM_DB · React + Bootstrap
            </small>
          </div>

          <div className="col-12">
            <hr className="border-secondary opacity-25" />
          </div>

          <div className="col-12 col-md">
            <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-md-start small">
              <a className="text-decoration-none text-white-50" href="/">Inicio</a>
              <a className="text-decoration-none text-white-50" href="/rooms">Habitaciones</a>
              <a className="text-decoration-none text-white-50" href="/services">Servicios</a>
              <a className="text-decoration-none text-white-50 fw-semibold" href="/login">
                Iniciar sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
