import { useEffect, useState } from "react";
import { fetchProductos, createProducto } from "../services/adminService";

const AdminProductosPage = () => {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ nombre: "", tipo: "", precio: "", cantidad: "", stock: "" });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const res = await fetchProductos();
      setProductos(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar los productos");
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProducto({
        nombre: form.nombre,
        tipo: form.tipo,
        precio: Number(form.precio || 0),
        cantidad: Number(form.cantidad || 0),
        stock: Number(form.stock || 0),
      });
      setMessage("Producto creado");
      setForm({ nombre: "", tipo: "", precio: "", cantidad: "", stock: "" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el producto");
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Productos</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Crear producto</h5>
          <form className="row g-2 align-items-end" onSubmit={handleSubmit}>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                className="form-control"
                placeholder="Tipo"
                value={form.tipo}
                onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Precio"
                value={form.precio}
                onChange={(e) => setForm((p) => ({ ...p, precio: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Cantidad"
                value={form.cantidad}
                onChange={(e) => setForm((p) => ({ ...p, cantidad: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-1">
              <button className="btn btn-primary w-100" type="submit">
                Crear
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Listado</h5>
          <div className="table-responsive" style={{ maxHeight: "400px" }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.COD_PRODUCTO}>
                    <td>{p.COD_PRODUCTO}</td>
                    <td>{p.NOMBRE_PRODUCTO}</td>
                    <td>{p.TIPO_PRODUCTO}</td>
                    <td>{p.PRECIO_PRODUCTO}</td>
                    <td>{p.CANTIDAD_PRODUCTO}</td>
                    <td>{p.STOCK_PRODUCTO}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductosPage;
