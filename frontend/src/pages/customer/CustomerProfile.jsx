// src/pages/customer/CustomerProfile.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DemoActionToast from "../../components/DemoActionToast";
import { PAGE_STATUS, getStatusClasses } from "../../utils/pageStatus";

const CustomerProfile = () => {
  const { user } = useAuth();
  const baseProfile = useMemo(
    () => ({
      name: user?.name || "",
      email: user?.email || "",
      telefono: user?.telefono || "",
      documento: user?.documento || "",
      preferences: "",
      marketing: false,
      notifyEmail: true,
      notifySms: false,
      bookingReminders: true,
      sessionAlerts: true,
      idioma: "es-CL",
      timezone: "America/Santiago",
    }),
    [user],
  );

  const [formData, setFormData] = useState(baseProfile);
  const [actionKey, setActionKey] = useState(null);

  useEffect(() => {
    setFormData(baseProfile);
  }, [baseProfile]);

  const isDirty = useMemo(
    () => Object.keys(baseProfile).some((key) => formData[key] !== baseProfile[key]),
    [formData, baseProfile],
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setActionKey(Date.now());
  };

  const handleReset = () => {
    setFormData(baseProfile);
    setActionKey(null);
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Cliente</p>
          <h1 className="h4 mb-0">Perfil y preferencias</h1>
          <p className="text-muted small mb-0">Mantén tus datos al día para acelerar reservas y coordinar servicios.</p>
        </div>
        <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
          <span
            className={`badge ${isDirty ? "bg-warning-subtle text-warning border border-warning-subtle" : "bg-success-subtle text-success border border-success-subtle"}`}
          >
            {isDirty ? "Cambios sin guardar" : "Perfil al día"}
          </span>
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
            Seguridad (próximamente)
          </button>
        </div>
      </div>

      <form className="row g-4" onSubmit={handleSubmit}>
        <div className="col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-uppercase text-muted small mb-1">Datos de la cuenta</p>
                  <h2 className="h6 mb-0">Contacto y facturación</h2>
                </div>
                <span className={`badge ${getStatusClasses(PAGE_STATUS.EDITING)}`}>
                  {PAGE_STATUS.EDITING}
                </span>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nombre completo</label>
                  <input
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Correo</label>
                  <input
                    className="form-control"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <input
                    className="form-control"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+56 9 ..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Documento</label>
                  <input
                    className="form-control"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    placeholder="Rut / pasaporte"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Preferencias</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    name="preferences"
                    value={formData.preferences}
                    onChange={handleChange}
                    placeholder="Ej: almohadas extra, piso alto, etc."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-uppercase text-muted small mb-1">Configuración</p>
              <h2 className="h6 mb-3">Preferencias del usuario</h2>

              <div className="border rounded-3 p-3 bg-light-subtle mb-3">
                <p className="mb-1 fw-semibold small text-uppercase">Notificaciones</p>
                <p className="text-muted small mb-3">Elige cómo te avisamos sobre reservas y cambios.</p>
                <div className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="notifyEmail"
                    name="notifyEmail"
                    checked={formData.notifyEmail}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="notifyEmail">
                    Correos de actividad (confirmaciones y recibos)
                  </label>
                </div>
                <div className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="notifySms"
                    name="notifySms"
                    checked={formData.notifySms}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="notifySms">
                    Alertas por SMS/WhatsApp
                  </label>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="marketing"
                    name="marketing"
                    checked={formData.marketing}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="marketing">
                    Recibir novedades y promociones
                  </label>
                </div>
              </div>

              <div className="border rounded-3 p-3">
                <p className="mb-1 fw-semibold small text-uppercase">Preferencias de uso</p>
                <p className="text-muted small mb-3">Ajusta idioma, zona horaria y seguridad de acceso.</p>
                <div className="mb-3">
                  <label className="form-label">Idioma</label>
                  <select
                    className="form-select"
                    name="idioma"
                    value={formData.idioma}
                    onChange={handleChange}
                  >
                    <option value="es-CL">Español (Chile)</option>
                    <option value="es-ES">Español (España)</option>
                    <option value="en-US">English (US)</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Zona horaria</label>
                  <select
                    className="form-select"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                  >
                    <option value="America/Santiago">(GMT-3) Santiago</option>
                    <option value="America/Bogota">(GMT-5) Bogotá / Lima</option>
                    <option value="Europe/Madrid">(GMT+1) Madrid</option>
                  </select>
                </div>
                <div className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="bookingReminders"
                    name="bookingReminders"
                    checked={formData.bookingReminders}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="bookingReminders">
                    Recordatorios de check-in y check-out
                  </label>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="sessionAlerts"
                    name="sessionAlerts"
                    checked={formData.sessionAlerts}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="sessionAlerts">
                    Alertarme si se inicia sesión desde otro dispositivo
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <span className="text-muted small">
              Los cambios se guardarán cuando se conecte el backend. Por ahora puedes simular ajustes.
            </span>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleReset} disabled={!isDirty}>
                Deshacer cambios
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={!isDirty}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </form>
      <DemoActionToast
        actionKey={actionKey}
        actionLabel="Guardar perfil"
        result={{ state: "success", message: "Tus preferencias se guardarán cuando conectes el backend." }}
        onClose={() => setActionKey(null)}
      />
    </div>
  );
};

export default CustomerProfile;
