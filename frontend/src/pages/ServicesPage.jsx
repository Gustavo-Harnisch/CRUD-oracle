// src/pages/ServicesPage.jsx
import { useEffect, useState } from "react";
import { fetchExperiences } from "../services/experienceService";

const baseServices = [
  { title: "Desayuno local", text: "Incluido en la mayoría de las estadías. Café de grano, pan amasado y mermeladas caseras." },
  { title: "WiFi estable", text: "Cobertura en habitaciones y áreas comunes para trabajo remoto." },
  { title: "Estacionamiento", text: "Cupos limitados. Reserva anticipada sin costo en estadías premium." },
  { title: "Limpieza diaria", text: "Cambio de toallas y repaso diario en habitaciones." },
  { title: "Asistencia 24/7", text: "Recepción siempre disponible para solicitudes y emergencias." },
  { title: "Amenities", text: "Set de baño, secador y agua de cortesía en cada habitación." },
];

const ServicesPage = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const data = await fetchExperiences();
        setExperiences(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las experiencias");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <p className="text-uppercase text-muted small mb-1">Experiencias y ofertas</p>
          <h1 className="h3 mb-1">Servicios para cada tipo de viaje</h1>
          <p className="text-muted mb-0">Curamos paquetes y extras para descanso, aventura o trabajo remoto.</p>
        </div>
        <span className="badge bg-success-subtle text-success border">Live</span>
      </div>

      <div className="row g-3 mb-4">
        {baseServices.map((service) => (
          <div className="col-md-4" key={service.title}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-2">{service.title}</h5>
                <p className="card-text text-muted small mb-0">{service.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? <p className="text-muted">Cargando experiencias...</p> : null}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <h2 className="h5 mb-0">Experiencias destacadas</h2>
        <small className="text-muted">Valores referenciales — ajustables según temporada.</small>
      </div>
      <div className="row g-3 mb-4">
        {experiences.map((exp) => (
          <div className="col-md-6" key={exp.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title mb-0">{exp.nombre}</h5>
                  <span className="badge bg-light text-secondary border">{exp.tag || "Disponible"}</span>
                </div>
                <p className="text-muted mb-2">{exp.descripcion || "Sin descripción"}</p>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">$ {Number(exp.precio || 0).toLocaleString()}</span>
                  <span className="badge bg-success-subtle text-success border">{exp.estado || "Activo"}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;
