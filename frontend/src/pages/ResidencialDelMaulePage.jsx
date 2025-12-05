// src/pages/ResidencialDelMaulePage.jsx
const ResidencialDelMaulePage = () => {
  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Residencial del Maule</h1>
      <p className="text-muted">
        Información general sobre la residencial, entorno y características.
      </p>

      <section className="mb-3">
        <h2 className="h5">Ubicación</h2>
        <p>
          Situada en la región del Maule, la residencial ofrece un espacio cómodo y
          accesible para estudiantes, trabajadores y visitantes.
        </p>
      </section>

      <section className="mb-3">
        <h2 className="h5">Características</h2>
        <ul>
          <li>Habitaciones individuales y compartidas.</li>
          <li>Áreas comunes para estudio y descanso.</li>
          <li>Cercanía a servicios básicos y transporte público.</li>
        </ul>
      </section>

      <section>
        <h2 className="h5">Próximos pasos</h2>
        <p>
          Más adelante puedes conectar esta página con información dinámica desde la base de
          datos (fotos, precios, disponibilidad, etc.).
        </p>
      </section>
    </div>
  );
};

export default ResidencialDelMaulePage;
