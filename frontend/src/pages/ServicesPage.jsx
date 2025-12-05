// src/pages/ServicesPage.jsx
import CardGrid from "../components/CardGrid";

const services = [
  { id: 1, name: "Desayuno incluido", description: "Servicio de desayuno continental." },
  { id: 2, name: "WiFi", description: "Conexión WiFi en todas las áreas comunes." },
  { id: 3, name: "Estacionamiento", description: "Estacionamiento privado para huéspedes." },
];

const ServicesPage = () => {
  const serviceCards = services.map((service) => ({
    id: service.id,
    title: service.name,
    text: service.description,
  }));

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Servicios</h1>
      <p className="text-muted">
        Detalle de los servicios disponibles en la Residencial del Maule.
      </p>

      <CardGrid items={serviceCards} />
    </div>
  );
};

export default ServicesPage;
