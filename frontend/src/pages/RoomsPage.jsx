// src/pages/RoomsPage.jsx
import { useEffect, useState } from "react";
import { fetchRooms } from "../services/roomService";
import { PAGE_STATUS, getStatusClasses } from "../utils/pageStatus";

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchRooms();
        setRooms(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las habitaciones");
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
          <p className="text-uppercase text-muted mb-1 small">Habitaciones</p>
          <h1 className="h4 mb-0">Catálogo de habitaciones</h1>
          <p className="text-muted small mb-0">Datos en línea desde la base real.</p>
        </div>
        <span className={`badge ${getStatusClasses(PAGE_STATUS.LIVE)}`}>{PAGE_STATUS.LIVE}</span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p className="text-muted">Cargando habitaciones...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Número</th>
                <th>Tipo</th>
                <th>Capacidad</th>
                <th>Precio base / noche</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.id}</td>
                  <td>{room.numero}</td>
                  <td>{room.tipo}</td>
                  <td>{room.capacidad} huésped(es)</td>
                  <td>$ {Number(room.precioBase || 0).toLocaleString()}</td>
                  <td>{room.estado || "N/D"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
