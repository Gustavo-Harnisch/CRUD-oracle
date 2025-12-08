import { useEffect, useMemo, useState } from "react";
import { fetchRooms } from "../../services/roomService";
import { PAGE_STATUS, getStatusClasses } from "../../utils/pageStatus";

const fallbackRooms = [
  { id: 1, numero: "204", tipo: "Doble", capacidad: 2, estado: "LIBRE", tarifa: 68000, turno: "Limpieza en curso", nota: "Cuna solicitada" },
  { id: 2, numero: "305", tipo: "Suite", capacidad: 3, estado: "OCUPADA", tarifa: 125000, turno: "Huésped en casa", nota: "Check-out 12:30" },
  { id: 3, numero: "108", tipo: "Single", capacidad: 1, estado: "MANTENCION", tarifa: 52000, turno: "Mantenimiento 16:00", nota: "Cambio de ampolleta" },
  { id: 4, numero: "110", tipo: "Doble", capacidad: 2, estado: "LIBRE", tarifa: 70000, turno: "Inventario", nota: "Reservada grupo" },
];

const statusBadge = (estado = "") => {
  const normalized = estado.toLowerCase();
  if (normalized.includes("ocup")) return "badge bg-success-subtle text-success border";
  if (normalized.includes("libre")) return "badge bg-primary-subtle text-primary border";
  if (normalized.includes("manten")) return "badge bg-warning-subtle text-warning border";
  return "badge bg-light text-secondary border";
};

const EmployeeRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchRooms();
        if (Array.isArray(data) && data.length > 0) {
          setRooms(data);
        } else {
          setRooms(fallbackRooms);
        }
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las habitaciones. Usando datos mock.");
        setRooms(fallbackRooms);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const roomsToShow = rooms.length > 0 ? rooms : fallbackRooms;

  const metrics = useMemo(() => {
    const acc = roomsToShow.reduce(
      (memo, room) => {
        const state = (room.estado || "").toLowerCase();
        if (state.includes("ocup")) memo.occupied += 1;
        else if (state.includes("libre")) memo.available += 1;
        else if (state.includes("manten")) memo.maintenance += 1;
        else memo.other += 1;
        return memo;
      },
      { occupied: 0, available: 0, maintenance: 0, other: 0 },
    );
    return [
      { id: "occupied", label: "Ocupadas", value: acc.occupied },
      { id: "available", label: "Libres", value: acc.available },
      { id: "maintenance", label: "Mantenimiento", value: acc.maintenance },
      { id: "other", label: "Otras", value: acc.other },
    ];
  }, [roomsToShow]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Empleado</p>
          <h1 className="h4 mb-1">Habitaciones (operación)</h1>
          <p className="text-muted small mb-0">Visibilidad de ocupación y notas operativas de cada habitación.</p>
        </div>
        <span className={`badge ${getStatusClasses(PAGE_STATUS.LIVE)}`}>{PAGE_STATUS.LIVE}</span>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="row g-3 mb-4">
        {metrics.map((metric) => (
          <div className="col-6 col-lg-3 col-xl-2" key={metric.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <p className="text-uppercase text-muted small mb-1">{metric.label}</p>
                <h3 className="h5 mb-0">{metric.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <div>
              <h2 className="h6 mb-1">Disponibilidad</h2>
              <p className="text-muted small mb-0">Estados reales desde la base (LIBRE, OCUPADA, MANTENCION).</p>
            </div>
          </div>

          {loading ? (
            <p className="text-muted mb-0">Cargando habitaciones...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Habitación</th>
                    <th>Tipo</th>
                    <th>Capacidad</th>
                    <th>Estado</th>
                    <th>Notas de operación</th>
                    <th>Tarifa base</th>
                  </tr>
                </thead>
                <tbody>
                  {roomsToShow.map((room) => {
                    const nightly = room.precioBase || room.tarifa || 0;
                    return (
                      <tr key={room.id || room.numero}>
                        <td>{room.id || "N/D"}</td>
                        <td className="fw-semibold">{room.numero || "N/D"}</td>
                        <td>{room.tipo || "N/D"}</td>
                        <td>{room.capacidad ? `${room.capacidad} huésped(es)` : "N/D"}</td>
                        <td>
                          <span className={statusBadge(room.estado)}>{room.estado || "Sin estado"}</span>
                        </td>
                        <td className="text-muted small">{room.nota || room.turno || "Sin notas"}</td>
                        <td>$ {Number(nightly).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeRooms;
