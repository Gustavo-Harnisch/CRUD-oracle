import { useEffect, useMemo, useState } from "react";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";
import { fetchServiceCategories } from "../../services/serviceService";
import { useAuth } from "../../context/AuthContext";
import { PAGE_STATUS, getStatusClasses } from "../../utils/pageStatus";

const emptyForm = {
  nombre: "",
  tipo: "",
  precio: 0,
  stock: 0,
  umbral: "",
  estado: "ACTIVO",
};

const AdminInventory = () => {
  const { logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    tipo: "",
    minPrice: "",
    maxPrice: "",
    estado: "",
    alerta: false,
  });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const deriveCategories = (list = []) => {
    const seen = new Set();
    return list
      .map((p) => String(p.tipo || "").trim().toUpperCase())
      .filter((name) => {
        if (!name || seen.has(name)) return false;
        seen.add(name);
        return true;
      });
  };
  const typeOptions = useMemo(() => {
    const seen = new Set();
    const list = [];
    const pushName = (raw) => {
      const name = (raw || "").trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        list.push(name);
      }
    };
    (Array.isArray(categories) ? categories : []).forEach(pushName);
    deriveCategories(products).forEach(pushName);
    [form.tipo, filters.tipo].forEach(pushName);
    return list;
  }, [categories, products, form.tipo, filters.tipo]);

  const loadCategories = async (productsData = products) => {
    setCategoriesError("");
    setCategoriesLoading(true);
    try {
      const data = await fetchServiceCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setCategories(deriveCategories(productsData));
      setCategoriesError("No se pudieron cargar las categorías; usando valores existentes.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listProducts();
      setProducts(data);
      await loadCategories(data);
    } catch (err) {
      setError("No se pudo cargar el inventario.");
      await loadCategories(products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);
    return products.filter((p) => {
      const s = filters.search
        ? `${p.nombre} ${p.tipo}`.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const t = filters.tipo ? (p.tipo || "").toLowerCase() === filters.tipo.toLowerCase() : true;
      const e = filters.estado ? (p.estado || "").toUpperCase() === filters.estado.toUpperCase() : true;
      const min = minPrice !== null ? Number(p.precio || 0) >= minPrice : true;
      const max = maxPrice !== null ? Number(p.precio || 0) <= maxPrice : true;
      const alerta = filters.alerta ? Number(p.stock || 0) <= Number(p.umbral || 0 || -1) : true;
      return s && t && e && min && max && alerta;
    });
  }, [products, filters]);

  const handleEdit = (prod) => {
    setEditingId(prod.id);
    setForm({
      nombre: prod.nombre,
      tipo: (prod.tipo || "").toUpperCase(),
      precio: prod.precio,
      stock: prod.stock,
      umbral: prod.umbralAlerta ?? "",
      estado: prod.estado,
    });
  };

  const handleResetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleAddCategory = () => {
    const name = window.prompt("Nombre de la categoría (se guarda en MAYÚSCULAS):");
    if (name === null) return;
    const normalized = (name || "").trim().toUpperCase();
    if (!normalized) return;
    setCategories((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      if (!next.includes(normalized)) next.push(normalized);
      return next;
    });
    setForm((p) => ({ ...p, tipo: normalized }));
  };

  const handleCategoryChange = (value) => {
    if (value === "__add__") {
      handleAddCategory();
      return;
    }
    setForm((p) => ({ ...p, tipo: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        nombre: form.nombre,
        tipo: (form.tipo || "").trim().toUpperCase(),
        precio: Number(form.precio),
        cantidad: Number(form.cantidad || 0),
        stock: Number(form.stock),
        umbralAlerta: form.umbral === "" ? null : Number(form.umbral),
      };
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      await load();
      handleResetForm();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        logout();
        window.location.href = "/login";
      } else {
        setError(err?.response?.data?.message || "No se pudo guardar el producto.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    setError("");
    try {
      await deleteProduct(id);
      await load();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        logout();
        window.location.href = "/login";
      } else {
        setError(err?.response?.data?.message || "No se pudo eliminar.");
      }
    }
  };

  return (
    <div className="container-xxl py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <p className="text-uppercase text-muted small mb-1">Admin · Inventario</p>
          <h1 className="h4 mb-1">Productos y stock</h1>
          <p className="text-muted small mb-0">Conectado a procedimientos de productos.</p>
        </div>
        <span className={`badge ${getStatusClasses(PAGE_STATUS.LIVE)}`}>{PAGE_STATUS.LIVE}</span>
      </div>

      <div className="row g-3 g-xl-4 align-items-start">
        <div className="col-lg-5 col-xl-4">
          <div className="card shadow-sm h-100">
            <div className="card-body p-4 p-xl-5">
              <h2 className="h6 mb-4">{editingId ? "Editar producto" : "Nuevo producto"}</h2>
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
                  <label className="form-label">Categoría</label>
                  <div className="d-flex gap-2 flex-wrap align-items-center">
                    <select
                      className="form-select flex-grow-1"
                      style={{ minWidth: "220px" }}
                      value={form.tipo}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      disabled={categoriesLoading}
                    >
                      <option value="">{categoriesLoading ? "Cargando..." : "Selecciona"}</option>
                      {typeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                      {form.tipo && !typeOptions.includes(form.tipo) && (
                        <option value={form.tipo}>{form.tipo}</option>
                      )}
                      <option value="__add__">+ Agregar categoría...</option>
                    </select>
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-shrink-0"
                      style={{ minWidth: "130px" }}
                      onClick={handleAddCategory}
                      disabled={categoriesLoading}
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="d-flex flex-wrap justify-content-between align-items-center mt-1">
                    <div className="form-text mb-0">
                      {categoriesLoading && <span className="text-muted">Cargando categorías...</span>}
                      {categoriesError && <span className="text-danger">{categoriesError}</span>}
                      {!categoriesLoading && !categoriesError && (
                        <span className="text-muted">
                          Usa la lista o agrega una nueva categoría (se guarda en MAYÚSCULAS).
                        </span>
                      )}
                    </div>
                    {!categoriesLoading && (
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 ms-auto"
                        onClick={() => loadCategories(products)}
                      >
                        Recargar
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Precio</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.precio}
                    onChange={(e) => setForm((p) => ({ ...p, precio: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.stock}
                    onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Umbral alerta</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.umbral}
                    onChange={(e) => setForm((p) => ({ ...p, umbral: e.target.value }))}
                  />
                  <small className="text-muted">Muestra warning cuando stock ≤ umbral.</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={form.estado}
                    onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value }))}
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-outline-secondary" onClick={handleResetForm}>
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
                  <p className="text-muted small mb-0">Filtra por tipo, precio, estado o alertas.</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-sm btn-outline-secondary px-3"
                    type="button"
                    onClick={() =>
                      setFilters({ search: "", tipo: "", estado: "", minPrice: "", maxPrice: "", alerta: false })
                    }
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>

              <div className="row g-3 mb-4 align-items-end">
                <div className="col-12 col-lg-4">
                  <label className="form-label small text-muted mb-1">Buscar</label>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Nombre o tipo"
                    value={filters.search}
                    onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                  />
                </div>
                <div className="col-6 col-lg-2">
                  <label className="form-label small text-muted mb-1">Categoría</label>
                  <select
                    className="form-select"
                    value={filters.tipo}
                    onChange={(e) => setFilters((p) => ({ ...p, tipo: e.target.value }))}
                    disabled={categoriesLoading && typeOptions.length === 0}
                  >
                    <option value="">{categoriesLoading ? "Cargando..." : "Todas"}</option>
                    {typeOptions.map((t) => (
                      <option key={`f-${t}`} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6 col-lg-2">
                  <label className="form-label small text-muted mb-1">Estado</label>
                  <select
                    className="form-select"
                    value={filters.estado}
                    onChange={(e) => setFilters((p) => ({ ...p, estado: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
                <div className="col-6 col-lg-2">
                  <label className="form-label small text-muted mb-1">Precio mín</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))}
                  />
                </div>
                <div className="col-6 col-lg-2">
                  <label className="form-label small text-muted mb-1">Precio máx</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="100000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))}
                  />
                </div>
                <div className="col-6 col-lg-2">
                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="filterAlert"
                      checked={filters.alerta}
                      onChange={(e) => setFilters((p) => ({ ...p, alerta: e.target.checked }))}
                    />
                    <label className="form-check-label small" htmlFor="filterAlert">
                      Solo con alerta
                    </label>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Producto</th>
                      <th>Tipo</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Alerta</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={8} className="py-3 text-muted">Cargando...</td>
                      </tr>
                    )}
                    {!loading && filtered.map((p) => {
                      const alerta = Number(p.stock || 0) <= Number(p.umbralAlerta || 0 || -1);
                      return (
                        <tr key={p.id} className={alerta ? "table-warning" : ""}>
                          <td className="py-3">{p.id}</td>
                          <td className="py-3 fw-semibold">{p.nombre}</td>
                          <td className="py-3 text-muted">{p.tipo}</td>
                          <td className="py-3">$ {Number(p.precio || 0).toLocaleString()}</td>
                          <td className="py-3">{p.stock}</td>
                          <td className="py-3">
                            {p.umbralAlerta !== null && p.umbralAlerta !== undefined ? (
                              <span
                                className={
                                  alerta
                                    ? "badge bg-warning-subtle text-warning border"
                                    : "badge bg-success-subtle text-success border"
                                }
                              >
                                {alerta ? "Bajo stock" : "OK"}
                              </span>
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </td>
                          <td className="py-3">
                            <span
                              className={
                                (p.estado || "").toUpperCase() === "ACTIVO"
                                  ? "badge bg-success-subtle text-success border"
                                  : "badge bg-secondary-subtle text-secondary border"
                              }
                            >
                            {p.estado}
                            </span>
                          </td>
                          <td className="text-end py-3">
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary" type="button" onClick={() => handleEdit(p)}>
                                Editar
                              </button>
                              <button className="btn btn-outline-danger" type="button" onClick={() => handleDelete(p.id)}>
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-muted small py-3">
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

export default AdminInventory;
