import { useEffect, useMemo, useState } from "react";
import { listProviders, createProvider, updateProvider, deleteProvider } from "../../services/providerService";
import { createPurchase } from "../../services/purchaseService";
import { useAuth } from "../../context/AuthContext";
import { PAGE_STATUS, getStatusClasses } from "../../utils/pageStatus";

const emptyForm = { nombre: "", contacto: "", telefono: "", region: "" };

const AdminDistributors = () => {
  const { logout, user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", region: "" });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const isAdmin = Array.isArray(user?.roles) && user.roles.map((r) => String(r).toUpperCase()).includes("ADMIN");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listProviders();
      setSuppliers(data);
    } catch (err) {
      setError("No se pudieron cargar los proveedores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      const txt = filters.search
        ? `${s.nombre} ${s.contacto} ${s.telefono}`.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const reg = filters.region ? (s.region || "").toLowerCase().includes(filters.region.toLowerCase()) : true;
      return txt && reg;
    });
  }, [suppliers, filters]);

  const handleEdit = (sup) => {
    setEditingId(sup.id);
    setForm({ nombre: sup.nombre, contacto: sup.contacto, telefono: sup.telefono, region: sup.region });
  };

  const handleReset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        nombre: form.nombre,
        direccion: null,
        telefono: form.telefono,
        regionId: null,
        correo: form.contacto,
      };
      if (editingId) {
        await updateProvider(editingId, payload);
      } else {
        await createProvider(payload);
      }
      await load();
      handleReset();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        logout();
        window.location.href = "/login";
      } else if (status === 403) {
        setError("Solo admin puede modificar proveedores.");
      } else {
        setError(err?.response?.data?.message || "No se pudo guardar el proveedor.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este proveedor?")) return;
    setError("");
    try {
      await deleteProvider(id);
      await load();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        logout();
        window.location.href = "/login";
      } else if (status === 403) {
        setError("Solo admin puede eliminar proveedores.");
      } else {
        setError(err?.response?.data?.message || "No se pudo eliminar.");
      }
    }
  };

  const handleRequestPurchase = async (supplierId) => {
    // Empleado puede registrar solicitud de compra mínima.
    setError("");
    try {
      await createPurchase({
        detalle: [
          {
            proveedorId: supplierId,
            productoId: null,
            nombreProducto: "Solicitud genérica",
            cantidad: 0,
            precioCompra: 0,
          },
        ],
      });
      alert("Solicitud registrada (pendiente detalle real).");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        logout();
        window.location.href = "/login";
      } else {
        setError(err?.response?.data?.message || "No se pudo registrar la solicitud.");
      }
    }
  };

  return (
    <div className="container-xxl py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <p className="text-uppercase text-muted small mb-1">Admin · Proveedores</p>
          <h1 className="h4 mb-1">Distribuidores y solicitudes</h1>
          <p className="text-muted small mb-0">
            Admin puede crear/comprar; empleados solo solicitan. Conectado a procs.
          </p>
        </div>
        <span className={`badge ${getStatusClasses(PAGE_STATUS.LIVE)}`}>{PAGE_STATUS.LIVE}</span>
      </div>

      <div className="row g-3 g-xl-4 align-items-start">
        <div className="col-lg-5 col-xl-4">
          <div className="card shadow-sm h-100">
            <div className="card-body p-4 p-xl-5">
              <h2 className="h6 mb-4">{editingId ? "Editar proveedor" : "Nuevo proveedor"}</h2>
              <form className="row g-3">
                <div className="col-12">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.nombre}
                    onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Correo de contacto</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.contacto}
                    onChange={(e) => setForm((p) => ({ ...p, contacto: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.telefono}
                    onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Región</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.region}
                    onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
                  />
                </div>
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7 col-xl-8">
          <div className="card shadow-sm h-100">
            <div className="card-body p-4 p-xl-5">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                  <h2 className="h6 mb-1">Listado</h2>
                  <p className="text-muted small mb-0">Filtra por nombre, correo o región.</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-sm btn-outline-secondary px-3"
                    type="button"
                    onClick={() => setFilters({ search: "", region: "" })}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>

              <div className="row g-3 mb-4 align-items-end">
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label small text-muted mb-1">Buscar</label>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Nombre, correo o fono"
                    value={filters.search}
                    onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label small text-muted mb-1">Región</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Maule, RM..."
                    value={filters.region}
                    onChange={(e) => setFilters((p) => ({ ...p, region: e.target.value }))}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Proveedor</th>
                      <th>Contacto</th>
                      <th>Teléfono</th>
                      <th>Región</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={6} className="py-3 text-muted">Cargando...</td>
                      </tr>
                    )}
                    {!loading && filtered.map((s) => (
                      <tr key={s.id}>
                        <td className="py-3">{s.id}</td>
                        <td className="py-3 fw-semibold">{s.nombre}</td>
                        <td className="py-3 text-muted">{s.contacto}</td>
                        <td className="py-3">{s.telefono}</td>
                        <td className="py-3">{s.region}</td>
                        <td className="text-end py-3">
                          <div className="btn-group btn-group-sm">
                            {isAdmin && (
                              <button className="btn btn-outline-primary" type="button" onClick={() => handleEdit(s)}>
                                Editar
                              </button>
                            )}
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => handleRequestPurchase(s.id)}
                            >
                              Solicitar compra
                            </button>
                            {isAdmin && (
                              <button className="btn btn-outline-danger" type="button" onClick={() => handleDelete(s.id)}>
                                Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-3 text-muted small">
                          Sin resultados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDistributors;
