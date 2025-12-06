import { useEffect, useState } from "react";
import { fetchExperiences } from "../../services/experienceService";

const AdminExperiences = () => {
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
        setError("No se pudieron cargar las experiencias.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted small mb-1">Admin · Experiencias</p>
          <h1 className="h4 mb-0">Ofertas y paquetes</h1>
          <p className="text-muted small mb-0">Lectura directa desde la base real.</p>
        </div>
        <span className="badge bg-success-subtle text-success border">Live</span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p className="text-muted">Cargando experiencias...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Tag</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {experiences.map((exp) => (
                <tr key={exp.id}>
                  <td>{exp.id}</td>
                  <td>{exp.nombre}</td>
                  <td>$ {Number(exp.precio || 0).toLocaleString()}</td>
                  <td>{exp.tag || "N/D"}</td>
                  <td>{exp.estado || "Activo"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminExperiences;
