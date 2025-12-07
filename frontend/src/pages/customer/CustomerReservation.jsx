// src/pages/customer/CustomerReservation.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchRooms } from "../../services/roomService";
import { createReservation } from "../../services/bookingService";

const parseDateInput = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const CustomerReservation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRoomId = searchParams.get("room");
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchRooms();
        setRooms(data);
        const match = preselectedRoomId && data.find((r) => String(r.id) === String(preselectedRoomId));
        setRoomId(match ? match.id : data[0]?.id || "");
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las habitaciones.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [preselectedRoomId]);

  const selectedRoom = useMemo(
    () => rooms.find((r) => String(r.id) === String(roomId)),
    [rooms, roomId],
  );

  const nights = useMemo(() => {
    const s = parseDateInput(startDate);
    const e = parseDateInput(endDate);
    if (!s || !e) return 0;
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const total = useMemo(() => {
    if (!selectedRoom || !nights) return 0;
    return Number(selectedRoom.precioBase || 0) * nights;
  }, [selectedRoom, nights]);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(
      2,
      "0",
    )}`;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!roomId) {
      setError("Selecciona una habitación.");
      return;
    }
    if (!startDate || !endDate || nights <= 0) {
      setError("Revisa las fechas. Deben ser válidas y con al menos 1 noche.");
      return;
    }
    if (selectedRoom && guests > Number(selectedRoom.capacidad || 0)) {
      setError("La habitación no soporta esa cantidad de huéspedes.");
      return;
    }

    try {
      await createReservation({
        habitacionId: Number(roomId),
        fechaInicio: startDate,
        fechaFin: endDate,
        huespedes: guests,
      });
      setSuccess("Reserva creada correctamente.");
      navigate("/customer/bookings");
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "No se pudo crear la reserva.";
      setError(message);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Reservas</p>
          <h1 className="h4 mb-0">Reservar habitación</h1>
          <p className="text-muted small mb-0">Selecciona habitación, fechas y huéspedes.</p>
        </div>
        <a className="btn btn-outline-secondary btn-sm mt-3 mt-md-0" href="/rooms">
          Ver catálogo
        </a>
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}
      {success && <div className="alert alert-success mb-3">{success}</div>}
      {loading ? (
        <p className="text-muted">Cargando habitaciones...</p>
      ) : (
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h2 className="h6 mb-3">Detalles de la reserva</h2>
                <form className="row g-3" onSubmit={handleSubmit}>
                  <div className="col-md-8">
                    <label className="form-label">Habitación</label>
                    <select
                      className="form-select"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          #{r.numero} · {r.tipo} · cap {r.capacidad}
                        </option>
                      ))}
                    </select>
                    {selectedRoom && (
                      <small className="text-muted">
                        Precio base: $ {Number(selectedRoom.precioBase || 0).toLocaleString()} / noche
                      </small>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Huéspedes</label>
                    <input
                      type="number"
                      min={1}
                      className="form-control"
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value) || 1)}
                    />
                  </div>

                    <div className="col-md-6">
                      <label className="form-label">Fecha inicio</label>
                      <input
                        type="date"
                        className="form-control"
                        min={todayStr}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Fecha fin</label>
                      <input
                        type="date"
                        className="form-control"
                        min={startDate || todayStr}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>

                  <div className="col-12">
                    <button className="btn btn-primary" type="submit">
                      Reservar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm h-100 position-sticky" style={{ top: "100px" }}>
              <div className="card-body d-flex flex-column">
                <h2 className="h6 mb-3">Resumen</h2>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Habitación</span>
                  <span className="fw-semibold">
                    {selectedRoom ? `#${selectedRoom.numero} · ${selectedRoom.tipo}` : "—"}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Noches</span>
                  <span className="fw-semibold">{nights}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Huéspedes</span>
                  <span className="fw-semibold">{guests}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Precio por noche</span>
                  <span className="fw-semibold">
                    $ {Number(selectedRoom?.precioBase || 0).toLocaleString()}
                  </span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-semibold">Total estimado</span>
                  <span className="fw-bold fs-5">$ {Number(total).toLocaleString()}</span>
                </div>
                <p className="text-muted small mb-0">
                  Se valida disponibilidad al confirmar. El monto final puede variar por políticas o promociones.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerReservation;
