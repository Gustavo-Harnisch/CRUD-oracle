import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createContact, getContact, listContacts } from "../services/contactService";

const CONTACT_TYPES = [
  { value: "CONSULTA", label: "Consulta" },
  { value: "RECLAMO", label: "Reclamo" },
  { value: "RESERVA", label: "Reserva" },
  { value: "TRABAJO", label: "Trabajo" },
];

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const ContactPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    tipo: "CONSULTA",
    asunto: "",
    mensaje: "",
    canalRespuesta: "EMAIL",
  });
  const [isSending, setIsSending] = useState(false);
  const [alert, setAlert] = useState(null);
  const [myContacts, setMyContacts] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [listError, setListError] = useState(null);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      nombre: user?.name || prev.nombre,
      email: user?.email || prev.email,
      telefono: user?.telefono || prev.telefono,
    }));
  }, [user]);

  const canSeeHistory = useMemo(() => isAuthenticated, [isAuthenticated]);

  const loadMyContacts = async () => {
    if (!canSeeHistory) return;
    setLoadingList(true);
    setListError(null);
    try {
      const { data } = await listContacts();
      setMyContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      const msg = error?.response?.data?.message || "No se pudo cargar tus contactos";
      setListError(msg);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadMyContacts();
  }, [canSeeHistory]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSending(true);
    setAlert(null);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono?.trim() || null,
        tipo: form.tipo,
        asunto: form.asunto?.trim() || null,
        mensaje: form.mensaje.trim(),
        canalRespuesta: form.canalRespuesta,
      };
      const { data } = await createContact(payload);
      setAlert({ type: "success", message: "Mensaje enviado. Te avisaremos cuando sea respondido." });
      setForm((prev) => ({ ...prev, asunto: "", mensaje: "" }));
      if (canSeeHistory) {
        await loadMyContacts();
        if (data?.contacto?.id) {
          await handleSelectContact(data.contacto.id);
        }
      }
    } catch (error) {
      const message = error?.response?.data?.message || "No pudimos enviar tu mensaje. Intenta de nuevo.";
      setAlert({ type: "danger", message });
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectContact = async (id) => {
    setSelectedId(id);
    setLoadingDetail(true);
    setDetail(null);
    try {
      const { data } = await getContact(id);
      setDetail(data);
    } catch (error) {
      const message = error?.response?.data?.message || "No se pudo cargar el detalle";
      setAlert({ type: "danger", message });
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 mb-1">Contacto</h1>
          <p className="text-muted mb-0">
            Envíanos tus dudas, reclamos o solicitudes. Si tienes sesión iniciada, podrás hacer seguimiento.
          </p>
        </div>
        <span className="badge bg-primary-subtle text-primary fw-semibold">Soporte</span>
      </div>

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="card card-body shadow-sm">
            <h5 className="mb-3">Envíanos un mensaje</h5>
            {alert && (
              <div className={`alert alert-${alert.type}`} role="alert">
                {alert.message}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  name="nombre"
                  type="text"
                  className="form-control"
                  required
                  value={form.nombre}
                  onChange={handleChange}
                  disabled={isSending}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Correo electrónico</label>
                <input
                  name="email"
                  type="email"
                  className="form-control"
                  required
                  value={form.email}
                  onChange={handleChange}
                  disabled={isSending || Boolean(user?.email)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Teléfono (opcional)</label>
                <input
                  name="telefono"
                  type="tel"
                  className="form-control"
                  value={form.telefono}
                  onChange={handleChange}
                  disabled={isSending}
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Tipo</label>
                  <select
                    name="tipo"
                    className="form-select"
                    value={form.tipo}
                    onChange={handleChange}
                    disabled={isSending}
                  >
                    {CONTACT_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Canal de respuesta</label>
                  <select
                    name="canalRespuesta"
                    className="form-select"
                    value={form.canalRespuesta}
                    onChange={handleChange}
                    disabled={isSending}
                  >
                    <option value="EMAIL">Email</option>
                    <option value="TEL">Teléfono</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Asunto</label>
                <input
                  name="asunto"
                  type="text"
                  className="form-control"
                  value={form.asunto}
                  onChange={handleChange}
                  disabled={isSending}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Mensaje</label>
                <textarea
                  name="mensaje"
                  className="form-control"
                  rows="4"
                  required
                  value={form.mensaje}
                  onChange={handleChange}
                  disabled={isSending}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={isSending}>
                {isSending ? "Enviando..." : "Enviar mensaje"}
              </button>
              {isAuthenticated && (
                <p className="text-muted small mt-2 mb-0">
                  Usaremos tu cuenta para identificar tus solicitudes y mantener el historial.
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card card-body h-100 shadow-sm">
            <h5 className="mb-3">Información de contacto</h5>
            <div className="row">
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Dirección:</strong> Residencial del Maule, Talca, Chile
                </p>
                <p className="mb-1">
                  <strong>Teléfono:</strong> +56 9 1234 5678
                </p>
                <p className="mb-1">
                  <strong>Email:</strong> contacto@residencialdelmaule.cl
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Horarios:</strong> Lunes a Viernes 9:00 - 18:00
                </p>
                <p className="mb-0 text-muted">
                  Te responderemos por el canal que elijas. Para emergencias, llama al número directo.
                </p>
              </div>
            </div>

            {canSeeHistory ? (
              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Mis solicitudes</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={loadMyContacts}
                    disabled={loadingList}
                  >
                    {loadingList ? "Actualizando..." : "Actualizar"}
                  </button>
                </div>
                {listError && <div className="alert alert-warning">{listError}</div>}
                {!listError && (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Asunto</th>
                          <th>Tipo</th>
                          <th>Estado</th>
                          <th>Respuestas</th>
                          <th>Creado</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {myContacts.length === 0 && !loadingList && (
                          <tr>
                            <td colSpan="6" className="text-muted text-center py-3">
                              Aún no tienes solicitudes.
                            </td>
                          </tr>
                        )}
                        {loadingList && (
                          <tr>
                            <td colSpan="6" className="text-center text-muted py-3">
                              Cargando...
                            </td>
                          </tr>
                        )}
                        {myContacts.map((item) => (
                          <tr key={item.id}>
                            <td>{item.asunto || "Sin asunto"}</td>
                            <td>
                              <span className="badge text-bg-light">{item.tipo}</span>
                            </td>
                            <td>
                              <span className="badge bg-secondary">{item.estado}</span>
                            </td>
                            <td>{item.respuestas || 0}</td>
                            <td className="text-nowrap">{formatDate(item.fechaCreacion)}</td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleSelectContact(item.id)}
                                disabled={loadingDetail && selectedId === item.id}
                              >
                                {selectedId === item.id && loadingDetail ? "Cargando..." : "Ver detalle"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {detail && detail.contacto && (
                  <div className="mt-3 border rounded p-3 bg-light">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1">{detail.contacto.asunto || "Solicitud"}</h6>
                        <div className="text-muted small">
                          {detail.contacto.tipo} · {formatDate(detail.contacto.fechaCreacion)}
                        </div>
                      </div>
                      <span className="badge bg-secondary">{detail.contacto.estado}</span>
                    </div>
                    <p className="mb-2">{detail.contacto.mensaje}</p>
                    <div className="mb-2">
                      <strong>Canal preferido:</strong> {detail.contacto.canalRespuesta}
                    </div>
                    <div className="mb-1">
                      <strong>Asignado a:</strong>{" "}
                      {detail.contacto.empleadoNombre || "Sin asignar"}
                    </div>
                    <h6 className="mt-3">Respuestas</h6>
                    {detail.respuestas?.length ? (
                      <ul className="list-group list-group-flush">
                        {detail.respuestas.map((resp) => (
                          <li key={resp.id} className="list-group-item px-0">
                            <div className="d-flex justify-content-between">
                              <div>
                                <div className="fw-semibold">{resp.empleadoNombre}</div>
                                <div className="text-muted small">{formatDate(resp.fecha)}</div>
                              </div>
                              <span className="badge bg-light text-dark">
                                {resp.publica ? "Visible" : "Interna"}
                              </span>
                            </div>
                            <p className="mb-0 mt-2">{resp.mensaje}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted mb-0">Aún no hay respuestas.</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="alert alert-info mt-4 mb-0">
                Inicia sesión para hacer seguimiento de tus mensajes y ver el estado de respuesta.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
