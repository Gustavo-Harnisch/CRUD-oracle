import { useEffect, useMemo, useState } from "react";
import { fetchOccupancy, updateReservaFechas, liberarHabitacion } from "../services/adminService";

const AdminHabitacionesPage = () => {
  const [ocupacion, setOcupacion] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  // Solo habitaciones no libres
  const ocupadas = useMemo(
    () => ocupacion.filter((h) => h.ESTADO && h.ESTADO !== "LIBRE"),
    [ocupacion]
  );

  const formatDate = (val) => {
    if (!val) return "-";
    return String(val).slice(0, 10);
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchOccupancy();
        const list = res?.data?.data || res?.data || [];
        setOcupacion(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err?.response?.data?.message || "No se pudo cargar ocupación");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Actualiza fechas de estadía y desocupe en BD y refresca la tabla
  const handleUpdateFechas = async (pagoId, fecha_estadia, fecha_salida) => {
    setSavingId(pagoId);
    setError(null);
    try {
      await updateReservaFechas(pagoId, { fecha_estadia, fecha_salida });
      const res = await fetchOccupancy();
      const list = res?.data?.data || res?.data || [];
      setOcupacion(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron actualizar las fechas");
    } finally {
      setSavingId(null);
    }
  };

  const handleLiberar = async (habId) => {
    setSavingId(`liberar-${habId}`);
    setError(null);
    try {
      // Endpoint backend pone estado LIBRE y borra desocupe
      await liberarHabitacion(habId);
      const res = await fetchOccupancy();
      const list = res?.data?.data || res?.data || [];
      setOcupacion(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo liberar la habitación");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Habitaciones ocupadas</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {isLoading ? (
        <div className="text-muted">Cargando...</div>
      ) : (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">
              Total ocupadas/reservadas: {ocupadas.length} de {ocupacion.length}
            </h5>
            <div className="table-responsive" style={{ maxHeight: "520px" }}>
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Hab.</th>
                    <th>Estado</th>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Pago</th>
                    <th>Estado pago</th>
                    <th>Fecha estadía</th>
                    <th>Fecha desocupa</th>
                    <th>Precio noche</th>
                    <th>Capacidad</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ocupadas.map((h) => (
                    <tr key={`${h.COD_HABITACION}-${h.COD_PAGO_HABITACION || "x"}`}>
                      <td>{h.NRO_HABITACION}</td>
                      <td>{h.ESTADO}</td>
                      <td>{h.NOMBRE_USUARIO || h.COD_USUARIO || "-"}</td>
                      <td>{h.EMAIL_USUARIO || "-"}</td>
                      <td>{h.COD_PAGO_HABITACION ? `#${h.COD_PAGO_HABITACION}` : "-"}</td>
                      <td>{h.ESTADO_PAGO || "-"}</td>
                      <td>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          defaultValue={formatDate(h.FECHA_ESTADIA || h.FECHA_PAGO)}
                          onChange={(e) => (h._newFechaEstadia = e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          defaultValue={formatDate(h.FECHA_DESOCUPACION)}
                          onChange={(e) => (h._newFechaSalida = e.target.value)}
                        />
                      </td>
                      <td>{h.PRECIO_HABITACION || "-"}</td>
                      <td>{h.NRO_PERSONAS || "-"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          disabled={!h.COD_PAGO_HABITACION || savingId === h.COD_PAGO_HABITACION}
                          onClick={() =>
                            handleUpdateFechas(
                              h.COD_PAGO_HABITACION,
                              h._newFechaEstadia || formatDate(h.FECHA_ESTADIA || h.FECHA_PAGO),
                              h._newFechaSalida || formatDate(h.FECHA_DESOCUPACION)
                            )
                          }
                        >
                          {savingId === h.COD_PAGO_HABITACION ? "Guardando..." : "Actualizar"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm ms-2"
                          disabled={savingId === `liberar-${h.COD_HABITACION}`}
                          onClick={() => handleLiberar(h.COD_HABITACION)}
                        >
                          {savingId === `liberar-${h.COD_HABITACION}` ? "Liberando..." : "Liberar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ocupadas.length === 0 && (
                    <tr>
                      <td colSpan="10" className="text-muted">
                        No hay habitaciones ocupadas o reservadas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHabitacionesPage;
