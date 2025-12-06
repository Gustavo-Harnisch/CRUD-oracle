// src/pages/ServicesPage.jsx
const ServicesPage = () => {
  const services = [
    { id: 1, name: "Desayuno incluido", description: "Servicio de desayuno continental." },
    { id: 2, name: "WiFi", description: "Conexión WiFi en todas las áreas comunes." },
    { id: 3, name: "Estacionamiento", description: "Estacionamiento privado para huéspedes." },
  ];

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Servicios</h1>
      <p className="text-muted">
        Detalle de los servicios disponibles en la Residencial del Maule.
      </p>

      <div className="row g-3">
        {services.map((service) => (
          <div className="col-md-4" key={service.id}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{service.name}</h5>
                <p className="card-text">{service.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;
