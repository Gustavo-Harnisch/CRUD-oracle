// src/components/Footer.jsx
const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-4">
      <div className="container">
        <div className="row align-items-center text-center text-md-start gy-2">
          <div className="col-12 col-md">
            <small>© {new Date().getFullYear()} Residencial Maule - Linares, Chile</small>
          </div>
          <div className="col-12 col-md-auto">
            <small className="text-secondary">Todos los derechos reservados</small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
