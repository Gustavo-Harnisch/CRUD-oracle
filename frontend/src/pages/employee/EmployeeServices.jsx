// src/pages/employee/EmployeeServices.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { listServices } from "../../services/serviceService";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";

const formatTime = (num) => {
  if (num === null || num === undefined) return "";
  const totalMinutes = Math.round(Number(num) * 60);
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const EmployeeServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState("");
  const [productError, setProductError] = useState("");
  const [filters, setFilters] = useState({ search: "", tipo: "", hour: "" });
  const [productFilters, setProductFilters] = useState({ search: "", tipo: "" });
  const [productForm, setProductForm] = useState({
    nombre: "",
    tipo: "",
    precio: 0,
    stock: 0,
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [productSaving, setProductSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const data = await listServices();
        setServices(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los servicios.");
      } finally {
        setLoading(false);
      }
    };
    const loadProducts = async () => {
      setProductError("");
      setProductsLoading(true);
      try {
        const data = await listProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setProductError("No se pudieron cargar los productos.");
      } finally {
        setProductsLoading(false);
      }
    };
    load();
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const hourVal = filters.hour === "" ? null : Number(filters.hour);
    return services.filter((svc) => {
      const nameMatch = filters.search
        ? svc.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
          (svc.descripcion || "").toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const typeMatch = filters.tipo ? (svc.tipo || "").toLowerCase() === filters.tipo.toLowerCase() : true;
      const hourMatch =
        hourVal === null ||
        !svc.horarios ||
        svc.horarios.length === 0 ||
        svc.horarios.some((h) => hourVal >= h.inicio && hourVal <= h.fin);
      return nameMatch && typeMatch && hourMatch;
    });
  }, [services, filters]);

  const summary = useMemo(() => {
    const active = services.filter((s) => (s.estado || "").toLowerCase() === "activo").length;
    const featured = services.filter((s) => s.destacado).length;
    const alwaysOn = services.filter((s) => !s.horarios || s.horarios.length === 0).length;
    return [
      { id: "active", label: "Activos", value: active, helper: "Se muestran solo servicios activos" },
      { id: "featured", label: "Destacados", value: featured, helper: "Priorizar upsell en recepción" },
      { id: "anytime", label: "Sin horario", value: alwaysOn, helper: "Disponibles en cualquier hora" },
    ];
  }, [services]);

  const filteredProducts = useMemo(() => {
    const search = productFilters.search.trim().toLowerCase();
    const type = productFilters.tipo.trim().toLowerCase();
    return products.filter((p) => {
      const s = search
        ? `${p.nombre} ${p.tipo}`.toLowerCase().includes(search) || String(p.id).includes(search)
        : true;
      const t = type ? (p.tipo || "").toLowerCase() === type : true;
      return s && t;
    });
  }, [products, productFilters]);

  const resetProductForm = () => {
    setProductForm({ nombre: "", tipo: "", precio: 0, stock: 0 });
    setEditingProductId(null);
    setProductError("");
  };

  const handleEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setProductForm({
      nombre: prod.nombre,
      tipo: prod.tipo || "",
      precio: prod.precio || 0,
      stock: prod.stock || 0,
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setProductSaving(true);
    setProductError("");
    try {
      const payload = {
        nombre: productForm.nombre.trim(),
        tipo: productForm.tipo.trim(),
        precio: Number(productForm.precio || 0),
        cantidad: Number(productForm.stock || 0),
        stock: Number(productForm.stock || 0),
      };
      if (!payload.nombre) throw new Error("Nombre requerido");
      if (editingProductId) {
        await updateProduct(editingProductId, payload);
      } else {
        await createProduct(payload);
      }
      const data = await listProducts();
      setProducts(data);
      resetProductForm();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || err?.message || "No se pudo guardar el producto.";
      setProductError(message);
    } finally {
      setProductSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await deleteProduct(id);
      const data = await listProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setProductError(err?.response?.data?.message || "No se pudo eliminar el producto.");
    }
  };

  const roleCategories = useMemo(() => {
    const roleSet = new Set((user?.roles || []).map((r) => String(r).toUpperCase()));
    if (roleSet.has("ADMIN")) {
      return {
        title: "Categorías sugeridas (ADMIN)",
        items: ["PAQUETE", "SPA", "EXTERIOR", "ROOM SERVICE", "HOUSEKEEPING", "MANTENCION", "EVENTOS", "TRANSFER"],
      };
    }
    if (roleSet.has("EMPLOYEE")) {
      return {
        title: "Categorías según tu rol",
        items: ["HOUSEKEEPING", "ROOM SERVICE", "MANTENCION", "SPA (solo si aplica)"],
      };
    }
    return null;
  }, [user]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
        <div>
          <p className="text-uppercase text-muted small mb-1">Empleado</p>
          <h1 className="h4 mb-1">Servicios disponibles para huéspedes</h1>
          <p className="text-muted small mb-0">
            Consulta rápida de horarios y precios. CRUD habilitado solo para roles autorizados.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setFilters({ search: "", tipo: "", hour: "" })}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {summary.map((card) => (
          <div className="col-12 col-md-4" key={card.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
              <p className="text-uppercase text-muted small mb-1">{card.label}</p>
              <h3 className="h5 mb-1">{card.value}</h3>
              <p className="text-muted small mb-0">{card.helper}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-5 col-lg-6">
              <label className="form-label small text-muted mb-1">Buscar</label>
              <input
                type="search"
                className="form-control"
                placeholder="Nombre o descripción"
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              />
            </div>
            <div className="col-6 col-md-3 col-lg-3">
              <label className="form-label small text-muted mb-1">Tipo</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: spa"
                value={filters.tipo}
                onChange={(e) => setFilters((p) => ({ ...p, tipo: e.target.value }))}
              />
            </div>
            <div className="col-6 col-md-2 col-lg-2">
              <label className="form-label small text-muted mb-1">Hora (0-23)</label>
              <input
                type="number"
                min="0"
                max="23"
                className="form-control"
                placeholder="Ej: 14"
                value={filters.hour}
                onChange={(e) => setFilters((p) => ({ ...p, hour: e.target.value }))}
              />
            </div>
            <div className="col-12 col-md-2 col-lg-1 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({ search: "", tipo: "", hour: "" })}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {roleCategories && (
        <div className="alert alert-info d-flex flex-column flex-md-row justify-content-between align-items-md-center">
          <div>
            <div className="fw-semibold mb-1">{roleCategories.title}</div>
            <div className="d-flex flex-wrap gap-2">
              {roleCategories.items.map((cat) => (
                <span key={cat} className="badge bg-light text-primary border">
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <small className="text-muted">
            Define el tipo del servicio según el cargo; así sabrás qué servicios le corresponden a tu rol.
          </small>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p className="text-muted">Cargando servicios...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Servicio</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Horarios</th>
                <th>Destacado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((svc) => (
                <tr key={svc.id}>
                  <td>{svc.id}</td>
                  <td>
                    <div className="fw-semibold">{svc.nombre}</div>
                    <small className="text-muted">{svc.descripcion || "Sin descripción"}</small>
                  </td>
                  <td>{svc.tipo || "—"}</td>
                  <td>$ {Number(svc.precio || 0).toLocaleString()}</td>
                  <td>
                    {svc.horarios?.length ? (
                      <div className="d-flex flex-wrap gap-1">
                        {svc.horarios.map((h) => (
                          <span key={`${svc.id}-${h.id || h.inicio}`} className="badge bg-light text-secondary border">
                            {`${formatTime(h.inicio)}-${formatTime(h.fin)}`}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <small className="text-muted">Cualquier hora</small>
                    )}
                  </td>
                  <td>
                    {svc.destacado ? (
                      <span className="badge bg-primary-subtle text-primary border">Sí</span>
                    ) : (
                      <span className="badge bg-light text-secondary border">No</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted text-center py-3">
                    No hay servicios que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <hr className="my-4" />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
        <div>
          <h2 className="h6 mb-1">Productos asociados a servicios</h2>
          <p className="text-muted small mb-0">Consulta y CRUD rápido de productos e insumos.</p>
        </div>
        <div className="d-flex gap-2">
          <input
            type="search"
            className="form-control form-control-sm"
            placeholder="Buscar producto"
            value={productFilters.search}
            onChange={(e) => setProductFilters((p) => ({ ...p, search: e.target.value }))}
          />
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Tipo"
            value={productFilters.tipo}
            onChange={(e) => setProductFilters((p) => ({ ...p, tipo: e.target.value }))}
          />
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setProductFilters({ search: "", tipo: "" })}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <form className="row g-2" onSubmit={handleSaveProduct}>
            <div className="col-12 col-md-4">
              <label className="form-label small text-muted mb-1">Nombre</label>
              <input
                type="text"
                className="form-control"
                value={productForm.nombre}
                onChange={(e) => setProductForm((p) => ({ ...p, nombre: e.target.value }))}
                required
              />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small text-muted mb-1">Tipo</label>
              <input
                type="text"
                className="form-control"
                value={productForm.tipo}
                onChange={(e) => setProductForm((p) => ({ ...p, tipo: e.target.value }))}
              />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small text-muted mb-1">Precio</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={productForm.precio}
                onChange={(e) => setProductForm((p) => ({ ...p, precio: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small text-muted mb-1">Stock</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={productForm.stock}
                onChange={(e) => setProductForm((p) => ({ ...p, stock: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="col-12 col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100" disabled={productSaving}>
                {productSaving ? "Guardando..." : editingProductId ? "Actualizar" : "Crear"}
              </button>
            </div>
            {productError && (
              <div className="col-12">
                <div className="alert alert-danger mb-0">{productError}</div>
              </div>
            )}
          </form>
        </div>
      </div>

      {productsLoading ? (
        <p className="text-muted">Cargando productos...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Stock</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td className="fw-semibold">{p.nombre}</td>
                  <td>{p.tipo || "—"}</td>
                  <td>$ {Number(p.precio || 0).toLocaleString()}</td>
                  <td>{p.stock}</td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm" role="group">
                      <button type="button" className="btn btn-outline-primary" onClick={() => handleEditProduct(p)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-outline-danger" onClick={() => handleDeleteProduct(p.id)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-3">
                    Sin productos que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeServices;
