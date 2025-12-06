import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRooms } from "../services/roomService";
import { createReservation, payReservation } from "../services/bookingService";
import { fetchProductos, createVentaUsuario } from "../services/ventaService";

const RoomsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservingId, setReservingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [purchaseMessage, setPurchaseMessage] = useState(null);
  const [purchaseError, setPurchaseError] = useState(null);
  const [buying, setBuying] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("EFECTIVO");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomsRes = await getRooms();
        setRooms(roomsRes.data.data || []);

        if (isAuthenticated) {
          const prodsRes = await fetchProductos();
          setProductos(prodsRes.data.data || []);
        } else {
          setProductos([]);
        }
      } catch (err) {
        setError("No se pudieron cargar las habitaciones");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const openReserve = (room) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/rooms" }, mode: "register" } });
      return;
    }
    setSelectedRoom(room);
    setCheckIn("");
    setCheckOut("");
    setMessage(null);
    setError(null);
  };

  const handleAddToCart = (prod) => {
    const qty = Number(quantities[prod.COD_PRODUCTO] || 0);
    if (!qty || qty <= 0) return;
    setPurchaseError(null);
    setPurchaseMessage(null);
    setCart((prev) => {
      const existing = prev.find((p) => p.COD_PRODUCTO === prod.COD_PRODUCTO);
      if (existing) {
        return prev.map((p) =>
          p.COD_PRODUCTO === prod.COD_PRODUCTO ? { ...p, cantidad: qty } : p
        );
      }
      return [...prev, { ...prod, cantidad: qty }];
    });
  };

  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/rooms" } } });
      return;
    }
    if (cart.length === 0) {
      setPurchaseError("Agrega productos al carrito");
      return;
    }
    try {
      setBuying(true);
      setPurchaseError(null);
      setPurchaseMessage(null);
      const payload = {
        detalles: cart.map((p) => ({
          cod_producto: p.COD_PRODUCTO,
          cantidad: p.cantidad,
          precio_producto: p.PRECIO_PRODUCTO
        }))
      };
      await createVentaUsuario(payload);
      setPurchaseMessage("Compra realizada");
      setCart([]);
      setQuantities({});
    } catch (err) {
      setPurchaseError(err?.response?.data?.message || "No se pudo completar la compra");
    } finally {
      setBuying(false);
    }
  };

  const calcNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleSubmitReserve = async () => {
    if (!selectedRoom) return;
    if (!checkIn || !checkOut) {
      setError("Selecciona fecha de entrada y salida.");
      return;
    }
    const nights = calcNights();
    if (nights <= 0) {
      setError("Elige un rango de fechas válido (mínimo 1 noche).");
      return;
    }
    try {
      setError(null);
      setMessage(null);
      setReservingId(selectedRoom.COD_HABITACION);
      const { data } = await createReservation({
        cod_habitacion: selectedRoom.COD_HABITACION,
        fecha_estadia: checkIn,
        fecha_salida: checkOut,
        cod_usuario: user?.COD_USUARIO,
      });
      const reservaId = data?.pago;
      if (!reservaId) {
        setError("Reserva creada pero no se obtuvo ID de pago.");
        return;
      }
      // Confirmar pago
      await payReservation(reservaId, { modo_pago: paymentMethod });
      setMessage("Reserva pagada y confirmada.");
      setSelectedRoom(null);
      // actualizar listado para reflejar estado ocupada
      setRooms((prev) =>
        prev.map((r) =>
          r.COD_HABITACION === selectedRoom.COD_HABITACION
            ? { ...r, ESTADO: "OCUPADA" }
            : r
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear la reserva");
    } finally {
      setReservingId(null);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Habitaciones</h1>
      <p className="text-muted">
        Esta sección mostrará el listado real de habitaciones desde la base de datos.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      {purchaseError && <div className="alert alert-danger">{purchaseError}</div>}
      {purchaseMessage && <div className="alert alert-success">{purchaseMessage}</div>}

      {isLoading ? (
        <div className="text-muted">Cargando habitaciones...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Habitación</th>
                <th>Capacidad</th>
                <th>Estado</th>
                <th>Precio</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.COD_HABITACION}>
                  <td>{room.COD_HABITACION}</td>
                  <td>{room.NRO_HABITACION}</td>
                  <td>{room.NRO_PERSONAS}</td>
                  <td>{room.ESTADO}</td>
                  <td>{room.PRECIO_HABITACION ? `$${room.PRECIO_HABITACION}` : "-"}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={room.ESTADO !== "LIBRE"}
                      onClick={() => openReserve(room)}
                    >
                      Reservar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedRoom && (
        <div className="card shadow-sm mt-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="card-title mb-1">Reservar habitación {selectedRoom.NRO_HABITACION}</h5>
                <p className="text-muted mb-2">
                  Capacidad: {selectedRoom.NRO_PERSONAS} | Precio por noche: ${selectedRoom.PRECIO_HABITACION}
                </p>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedRoom(null)}>
                Cancelar
              </button>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Fecha entrada</label>
                <input
                  type="date"
                  className="form-control"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Fecha salida</label>
                <input
                  type="date"
                  className="form-control"
                  value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split("T")[0]}
              />
              </div>
              <div className="col-md-6">
                <label className="form-label">Resumen</label>
                <div className="border rounded p-2 bg-light">
                  <div>Entrada: {checkIn || "-"}</div>
                  <div>Salida: {checkOut || "-"}</div>
                  <div>Noches: {calcNights()}</div>
                  <div>
                    Total: $
                    {selectedRoom.PRECIO_HABITACION && calcNights()
                      ? selectedRoom.PRECIO_HABITACION * calcNights()
                      : 0}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Método de pago</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmitReserve}
                disabled={reservingId === selectedRoom.COD_HABITACION}
              >
                {reservingId === selectedRoom.COD_HABITACION ? "Reservando..." : "Confirmar reserva"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sección de compra de productos */}
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Comprar productos (requiere reserva pagada)</h5>
          <div className="table-responsive">
            <table className="table table-sm table-striped align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Cantidad</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.COD_PRODUCTO}>
                    <td>{p.COD_PRODUCTO}</td>
                    <td>{p.NOMBRE_PRODUCTO}</td>
                    <td>{p.TIPO_PRODUCTO}</td>
                    <td>{p.PRECIO_PRODUCTO}</td>
                    <td>{p.STOCK_PRODUCTO}</td>
                    <td style={{ maxWidth: 100 }}>
                      <input
                        type="number"
                        min="1"
                        className="form-control form-control-sm"
                        value={quantities[p.COD_PRODUCTO] || ""}
                        onChange={(e) =>
                          setQuantities((prev) => ({ ...prev, [p.COD_PRODUCTO]: e.target.value }))
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleAddToCart(p)}
                      >
                        Agregar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h6 className="mt-3">Carrito</h6>
          {cart.length === 0 ? (
            <div className="text-muted">Sin productos.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((p) => (
                    <tr key={p.COD_PRODUCTO}>
                      <td>{p.NOMBRE_PRODUCTO}</td>
                      <td>{p.cantidad}</td>
                      <td>{p.PRECIO_PRODUCTO}</td>
                      <td>{(p.PRECIO_PRODUCTO || 0) * (p.cantidad || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleBuy}
            disabled={buying}
          >
            {buying ? "Comprando..." : "Confirmar compra"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;
