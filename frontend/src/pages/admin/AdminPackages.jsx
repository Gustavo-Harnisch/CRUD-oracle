import { useEffect, useMemo, useState } from "react";
import {
  listServices,
  createService,
  updateService,
  deleteService,
  changeServiceStatus,
} from "../../services/serviceService";
import {
  listProducts,
  listServiceProducts,
  replaceServiceProducts,
} from "../../services/productService";
import { PAGE_STATUS, getStatusClasses } from "../../utils/pageStatus";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  nombre: "",
  descripcion: "",
  tipo: "",
  precio: 0,
  estado: "activo",
  destacado: false,
  orden: "",
  productos: [],
};

const isPackage = (service = {}) => {
  const t = (service.tipo || "").toLowerCase();
  return t.includes("paquet") || t.includes("combo") || t.includes("pack");
};

const badgeEstado = (estado = "") => {
  const n = estado.toLowerCase();
  if (n.includes("inac")) return "badge bg-secondary-subtle text-secondary border";
  return "badge bg-success-subtle text-success border";
};

const AdminPackages = () => {
  const { user } = useAuth();
  const roles = useMemo(
    () => (Array.isArray(user?.roles) ? user.roles.map((r) => String(r).toUpperCase()) : []),
    [user],
  );
  const isAdmin = roles.includes("ADMIN");
  const allowedTypes = isAdmin ? null : ["HOUSEKEEPING", "ROOM SERVICE", "MANTENCION", "SPA"];
  const [packages, setPackages] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [productMap, setProductMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", estado: "" });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const computeTotal = (svc, items = []) => {
    const base = Number(svc?.precio || 0);
    const extra = items.reduce((acc, item) => {
      const prod = productMap.get(item.productoId);
      const qty = Number(item.cantidadBase || item.cantidad || 1);
      const precioProd = Number(prod?.precio || 0);
      const precioExtra = item.precioExtra !== undefined && item.precioExtra !== null ? Number(item.precioExtra) : 0;
      return acc + qty * (precioProd + precioExtra);
    }, 0);
    return base + extra;
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [svcData, prodData] = await Promise.all([
        listServices({ includeInactive: 1 }),
        listProducts(),
      ]);
      const filteredProds =
        allowedTypes === null
          ? prodData || []
          : (prodData || []).filter((p) => allowedTypes.includes((p.tipo || "").trim().toUpperCase()));
      const map = new Map((filteredProds || []).map((p) => [p.id, p]));
      setProducts(filteredProds || []);
      setProductMap(map);

      const filteredServices =
        allowedTypes === null
          ? svcData || []
          : (svcData || []).filter((s) => allowedTypes.includes((s.tipo || "").trim().toUpperCase()));
      setAllServices(filteredServices);

      const pkgServices = (svcData || []).filter((s) => {
        const type = (s.tipo || "").trim().toUpperCase();
        const matchesAllowed = allowedTypes === null || allowedTypes.includes(type);
        return matchesAllowed && (isPackage(s) || type.length > 0);
      });
      const relations = await Promise.all(
        pkgServices.map((s) =>
          listServiceProducts(s.id).catch((err) => {
            console.error("Error cargando productos del paquete", s.id, err);
            return [];
          }),
        ),
      );
      const enriched = pkgServices.map((s, idx) => ({
        ...s,
        productos: relations[idx] || [],
        totalEstimado: computeTotal(s, relations[idx] || []),
      }));
      setPackages(enriched);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los paquetes.");
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const estado = filters.estado.trim().toLowerCase();
    return packages.filter((p) => {
      const s = search
        ? `${p.nombre} ${p.tipo}`.toLowerCase().includes(search) || String(p.id).includes(search)
        : true;
      const e = estado ? (p.estado || "").toLowerCase() === estado : true;
      return s && e;
    });
  }, [packages, filters]);

  const resetForm = () => {
    setForm({ ...emptyForm, tipo: allowedTypes?.[0] || "" });
    setEditingId(null);
  };

  const handleEdit = async (pkg) => {
    setEditingId(pkg.id);
      setForm({
        nombre: pkg.nombre || "",
        descripcion: pkg.descripcion || "",
        tipo: pkg.tipo || (allowedTypes?.[0] || "PAQUETE"),
        precio: pkg.precio || 0,
        estado: pkg.estado || "activo",
        destacado: Boolean(pkg.destacado),
        orden: pkg.orden || "",
        productos: [],
        serviciosIncluidos: [],
      });
    try {
      const items = await listServiceProducts(pkg.id);
      const svcIncl = await fetchPackageServices(pkg.id);
      setForm((prev) => ({ ...prev, productos: items || [], serviciosIncluidos: svcIncl || [] }));
    } catch (err) {
      console.error("No se pudieron cargar productos del paquete", err);
      setForm((prev) => ({ ...prev, productos: [], serviciosIncluidos: [] }));
    }
  };

  const addProductToForm = () => {
    if (!form.productoSeleccion) return;
    const prodId = Number(form.productoSeleccion);
    const already = form.productos.find((p) => Number(p.productoId) === prodId);
    if (already) return;
    setForm((prev) => ({
      ...prev,
      productos: [
        ...prev.productos,
        { productoId: prodId, cantidadBase: 1, precioExtra: null, nombreProducto: productMap.get(prodId)?.nombre },
      ],
      productoSeleccion: "",
    }));
  };

  const updateProductRow = (productoId, key, value) => {
    setForm((prev) => ({
      ...prev,
      productos: prev.productos.map((p) =>
        Number(p.productoId) === Number(productoId) ? { ...p, [key]: value } : p,
      ),
    }));
  };

  const removeProductRow = (productoId) => {
    setForm((prev) => ({
      ...prev,
      productos: prev.productos.filter((p) => Number(p.productoId) !== Number(productoId)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio || 0),
        tipo: form.tipo.trim() || (allowedTypes?.[0] || "PAQUETE"),
        estado: (form.estado || "activo").toLowerCase(),
        destacado: Boolean(form.destacado),
        orden: form.orden === "" ? null : Number(form.orden),
        horarios: [],
      };

      if (!payload.nombre) throw new Error("Nombre requerido");
      if (allowedTypes && !allowedTypes.includes(payload.tipo.toUpperCase())) {
        throw new Error("Tipo fuera de las categorías permitidas para tu rol.");
      }
      if (!form.serviciosIncluidos || form.serviciosIncluidos.length === 0) {
        throw new Error("Agrega al menos un servicio incluido al paquete.");
      }
      if (!form.productos || form.productos.length === 0) {
        throw new Error("Agrega al menos un producto al paquete.");
      }
      let serviceId = editingId;
      if (editingId) {
        await updateService(editingId, payload);
      } else {
        const created = await createService(payload);
        serviceId = created?.id;
      }

      if (serviceId) {
        await replacePackageServices(
          serviceId,
          (form.serviciosIncluidos || []).map((s) => ({ servicioId: s.servicioId || s })),
        );
        const items = (form.productos || []).map((p) => ({
          productoId: Number(p.productoId),
          cantidadBase: Number(p.cantidadBase || p.cantidad || 1),
          precioExtra:
            p.precioExtra === null || p.precioExtra === "" || p.precioExtra === undefined
              ? null
              : Number(p.precioExtra),
        }));
        await replaceServiceProducts(serviceId, items);
      }

      await load();
      resetForm();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || err?.message || "No se pudo guardar el paquete.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este paquete?")) return;
    try {
      await deleteService(id);
      await load();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "No se pudo eliminar el paquete.");
    }
  };

  const toggleStatus = async (pkg) => {
    const next = pkg.estado?.toLowerCase() === "activo" ? "inactivo" : "activo";
    try {
      await changeServiceStatus(pkg.id, next);
      await load();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "No se pudo cambiar el estado.");
    }
  };

  const totalPreview = useMemo(
    () => computeTotal(form, form.productos || []),
    [form, form.productos, productMap],
  );

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">{isAdmin ? "Admin" : "Empleado"}</p>
          <h1 className="h4 mb-1">Paquetes de servicio + productos</h1>
          <p className="text-muted small mb-0">
            Arma combos con servicios y productos asociados; calcula el total sugerido automáticamente.
          </p>
        </div>
        <span className={`badge ${getStatusClasses(PAGE_STATUS.LIVE)}`}>{PAGE_STATUS.LIVE}</span>
      </div>

      {allowedTypes && (
        <div className="alert alert-info d-flex flex-column flex-md-row justify-content-between align-items-md-center">
          <div>
            <div className="fw-semibold mb-1">Tus tipos permitidos</div>
            <div className="d-flex flex-wrap gap-2">
              {allowedTypes.map((t) => (
                <span key={t} className="badge bg-light text-primary border">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <small className="text-muted">
            Solo puedes crear/editar paquetes y elegir productos dentro de estos tipos.
          </small>
        </div>
      )}

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
              <h2 className="h6 mb-0">{editingId ? "Editar paquete" : "Crear paquete"}</h2>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetForm} disabled={saving}>
                Limpiar
              </button>
            </div>
            <form className="row g-3" onSubmit={handleSubmit}>
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.nombre}
                  onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  required
                />
              </div>
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="h6 mb-0">Servicios incluidos</h3>
                  <div className="d-flex gap-2">
                    <select
                      className="form-select form-select-sm"
                      value={form.servicioSeleccion || ""}
                      onChange={(e) => setForm((p) => ({ ...p, servicioSeleccion: e.target.value }))}
                    >
                      <option value="">Selecciona servicio</option>
                      {allServices
                        .filter((s) => !isPackage(s))
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombre} (${Number(s.precio || 0).toLocaleString()})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        if (!form.servicioSeleccion) return;
                        const sid = Number(form.servicioSeleccion);
                        if (form.serviciosIncluidos?.some((s) => Number(s.servicioId || s) === sid)) return;
                        setForm((prev) => ({
                          ...prev,
                          serviciosIncluidos: [
                            ...(prev.serviciosIncluidos || []),
                            {
                              servicioId: sid,
                              nombre:
                                allServices.find((s) => Number(s.id) === sid)?.nombre || `Servicio ${sid}`,
                              precio: allServices.find((s) => Number(s.id) === sid)?.precio || 0,
                            },
                          ],
                          servicioSeleccion: "",
                        }));
                      }}
                    >
                      Añadir
                    </button>
                  </div>
                </div>
                {form.serviciosIncluidos && form.serviciosIncluidos.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Servicio</th>
                          <th>Tipo</th>
                          <th>Precio</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {form.serviciosIncluidos.map((s) => {
                          const svc = allServices.find((it) => Number(it.id) === Number(s.servicioId || s));
                          return (
                            <tr key={s.servicioId || s}>
                              <td>{svc?.nombre || s.nombre || s.servicioId}</td>
                              <td>{svc?.tipo || "—"}</td>
                              <td>$ {Number(svc?.precio || s.precio || 0).toLocaleString()}</td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() =>
                                    setForm((prev) => ({
                                      ...prev,
                                      serviciosIncluidos: (prev.serviciosIncluidos || []).filter(
                                        (x) => Number(x.servicioId || x) !== Number(s.servicioId || s),
                                      ),
                                    }))
                                  }
                                >
                                  Quitar
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted small mb-0">Sin servicios incluidos.</p>
                )}
              </div>
            <div className="col-md-3">
              <label className="form-label">Tipo / categoría</label>
              {allowedTypes ? (
                <select
                  className="form-select"
                  value={form.tipo || allowedTypes[0]}
                  onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}
                >
                  {allowedTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control"
                  value={form.tipo || "PAQUETE"}
                  onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}
                />
              )}
            </div>
            <div className="col-md-3">
              <label className="form-label">Precio base servicio</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={form.precio}
                onChange={(e) => setForm((p) => ({ ...p, precio: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="col-md-12">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={form.estado}
                onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value }))}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Orden</label>
              <input
                type="number"
                className="form-control"
                value={form.orden}
                onChange={(e) => setForm((p) => ({ ...p, orden: e.target.value }))}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <div className="form-check">
                <input
                  id="pkgDestacado"
                  type="checkbox"
                  className="form-check-input"
                  checked={form.destacado}
                  onChange={(e) => setForm((p) => ({ ...p, destacado: e.target.checked }))}
                />
                <label className="form-check-label" htmlFor="pkgDestacado">
                  Destacado
                </label>
              </div>
            </div>

              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="h6 mb-0">Productos incluidos</h3>
                  <div className="d-flex gap-2">
                    <select
                      className="form-select form-select-sm"
                      value={form.productoSeleccion || ""}
                      onChange={(e) => setForm((p) => ({ ...p, productoSeleccion: e.target.value }))}
                    >
                      <option value="">Selecciona producto</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} (${Number(p.precio || 0).toLocaleString()})
                        </option>
                      ))}
                    </select>
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={addProductToForm}>
                      Añadir
                    </button>
                  </div>
                </div>
                {form.productos.length === 0 ? (
                  <p className="text-muted small mb-0">Sin productos añadidos.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio extra</th>
                          <th>Subtotal</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {form.productos.map((p) => {
                          const prod = productMap.get(p.productoId);
                          const qty = Number(p.cantidadBase || p.cantidad || 1);
                          const precioProd = Number(prod?.precio || 0);
                          const extra =
                            p.precioExtra === null || p.precioExtra === "" || p.precioExtra === undefined
                              ? 0
                              : Number(p.precioExtra);
                          const subtotal = qty * (precioProd + extra);
                          return (
                            <tr key={p.productoId}>
                              <td>{prod?.nombre || p.nombreProducto || p.productoId}</td>
                              <td style={{ maxWidth: "100px" }}>
                                <input
                                  type="number"
                                  min="1"
                                  className="form-control form-control-sm"
                                  value={qty}
                                  onChange={(e) =>
                                    updateProductRow(p.productoId, "cantidadBase", Number(e.target.value) || 1)
                                  }
                                />
                              </td>
                              <td style={{ maxWidth: "140px" }}>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={p.precioExtra ?? ""}
                                  onChange={(e) => updateProductRow(p.productoId, "precioExtra", e.target.value)}
                                  placeholder="+$ extra opcional"
                                />
                              </td>
                              <td>$ {subtotal.toLocaleString()}</td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => removeProductRow(p.productoId)}
                                >
                                  Quitar
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            <div className="col-12 d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Total sugerido: <strong>$ {Number(totalPreview).toLocaleString()}</strong> (servicio + productos)
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Guardando..." : editingId ? "Actualizar paquete" : "Crear paquete"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <div>
              <h2 className="h6 mb-1">Paquetes configurados</h2>
              <p className="text-muted small mb-0">Solo se listan servicios tipo “paquete/pack/combo”.</p>
            </div>
            <div className="d-flex gap-2">
              <input
                type="search"
                className="form-control form-control-sm"
                placeholder="Buscar por nombre o ID"
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              />
              <select
                className="form-select form-select-sm"
                value={filters.estado}
                onChange={(e) => setFilters((p) => ({ ...p, estado: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
          </div>
          {loading ? (
            <p className="text-muted mb-0">Cargando paquetes...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted mb-0">Sin paquetes registrados.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Precio base</th>
                    <th>Productos</th>
                    <th>Total sugerido</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((pkg) => (
                    <tr key={pkg.id}>
                      <td>{pkg.id}</td>
                      <td className="fw-semibold">{pkg.nombre}</td>
                      <td>{pkg.tipo}</td>
                      <td>
                        <span className={badgeEstado(pkg.estado)}>{pkg.estado}</span>
                      </td>
                      <td>$ {Number(pkg.precio || 0).toLocaleString()}</td>
                      <td>{pkg.productos?.length || 0}</td>
                      <td>$ {Number(pkg.totalEstimado || pkg.precio || 0).toLocaleString()}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm" role="group">
                          <button type="button" className="btn btn-outline-primary" onClick={() => handleEdit(pkg)}>
                            Editar
                          </button>
                          <button type="button" className="btn btn-outline-secondary" onClick={() => toggleStatus(pkg)}>
                            {pkg.estado?.toLowerCase() === "activo" ? "Inactivar" : "Activar"}
                          </button>
                          <button type="button" className="btn btn-outline-danger" onClick={() => handleDelete(pkg.id)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPackages;
