// src/pages/ContactPage.jsx
const ContactPage = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    // Aquí luego conectarás con tu backend o servicio de envío.
    alert("Formulario de contacto enviado (demo).");
  };

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Contacto</h1>
      <p className="text-muted">
        Déjanos tu mensaje y nos pondremos en contacto contigo lo antes posible.
      </p>

      <div className="row">
        <div className="col-md-6">
          <form onSubmit={handleSubmit} className="card card-body">
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input type="text" className="form-control" required />
            </div>

            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input type="email" className="form-control" required />
            </div>

            <div className="mb-3">
              <label className="form-label">Mensaje</label>
              <textarea className="form-control" rows="4" required />
            </div>

            <button type="submit" className="btn btn-primary">
              Enviar mensaje
            </button>
          </form>
        </div>

        <div className="col-md-6 mt-4 mt-md-0">
          <div className="card card-body h-100">
            <h5 className="card-title">Información de contacto</h5>
            <p className="mb-1">
              <strong>Dirección:</strong> Residencial del Maule, Talca, Chile
            </p>
            <p className="mb-1">
              <strong>Teléfono:</strong> +56 9 1234 5678
            </p>
            <p className="mb-0">
              <strong>Email:</strong> contacto@residencialdelmaule.cl
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
