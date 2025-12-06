import { useEffect, useState } from "react";
import {
  fetchPedidos,
  createPedido,
  fetchDetallePedidos,
  createDetallePedido,
  fetchEmployees,
  fetchProveedores,
  fetchProductos,
} from "../services/adminService";

const AdminPedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedidoForm, setPedidoForm] = useState({ fecha_pedido: "", cod_empleado: "", cod_proveedor: "" });
  const [detalleForm, setDetalleForm] = useState({
    cod_pedido: "",
    cod_producto: "",
    nombre_producto: "",
    cantidad_producto: "",
    precio_compra: "",
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    const calls = [
      fetchPedidos(),
      fetchDetallePedidos(),
      fetchEmployees(),
      fetchProveedores(),
      fetchProductos(),
    ];
    const results = await Promise.allSettled(calls);
    const take = (idx) => (results[idx].status === "fulfilled" ? results[idx].value?.data?.data || [] : []);

    setPedidos(take(0));
    setDetalles(take(1));
    setEmpleados(take(2));
    setProveedores(take(3));
    setProductos(take(4));

    const failed = results.find((r) => r.status === "rejected");
    setError(failed ? "No se pudieron cargar pedidos/detalles" : null);
    if (failed) console.error("Admin pedidos error", failed.reason);
  };

  useEffect(() => {
    load();
  }, []);

  const handlePedidoSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPedido({
        fecha_pedido: pedidoForm.fecha_pedido,
        cod_empleado: Number(pedidoForm.cod_empleado),
        cod_proveedor: Number(pedidoForm.cod_proveedor),
      });
      setMessage("Pedido creado");
      setPedidoForm({ fecha_pedido: "", cod_empleado: "", cod_proveedor: "" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el pedido");
    }
  };

  const handleDetalleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDetallePedido({
        cod_pedido: Number(detalleForm.cod_pedido),
        cod_producto: Number(detalleForm.cod_producto),
        nombre_producto: detalleForm.nombre_producto,
        cantidad_producto: Number(detalleForm.cantidad_producto),
        precio_compra: Number(detalleForm.precio_compra),
      });
      setMessage("Detalle agregado");
      setDetalleForm({ cod_pedido: "", cod_producto: "", nombre_producto: "", cantidad_producto: "", precio_compra: "" });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el detalle");
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Pedidos y detalles</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Crear pedido</h5>
          <form className="row g-2 align-items-end" onSubmit={handlePedidoSubmit}>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={pedidoForm.fecha_pedido}
                onChange={(e) => setPedidoForm((p) => ({ ...p, fecha_pedido: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={pedidoForm.cod_empleado}
                onChange={(e) => setPedidoForm((p) => ({ ...p, cod_empleado: e.target.value }))}
                required
              >
                <option value="">Empleado</option>
                {empleados.map((e) => (
                  <option key={e.COD_EMPLEADO} value={e.COD_EMPLEADO}>
                    {e.COD_EMPLEADO} - {e.CARGO_EMPLEADO}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={pedidoForm.cod_proveedor}
                onChange={(e) => setPedidoForm((p) => ({ ...p, cod_proveedor: e.target.value }))}
                required
              >
                <option value="">Proveedor</option>
                {proveedores.map((p) => (
                  <option key={p.COD_PROVEEDOR} value={p.COD_PROVEEDOR}>
                    {p.COD_PROVEEDOR} - {p.NOMBRE_PROVEEDOR}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-1">
              <button className="btn btn-primary w-100" type="submit">
                Crear
              </button>
            </div>
          </form>

          <div className="table-responsive mt-3" style={{ maxHeight: "200px" }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Valor total</th>
                  <th>Fecha</th>
                  <th>Empleado</th>
                  <th>Proveedor</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.COD_PEDIDO}>
                    <td>{p.COD_PEDIDO}</td>
                    <td>{p.VALOR_TOTAL}</td>
                    <td>{p.FECHA_PEDIDO}</td>
                    <td>{p.COD_EMPLEADO}</td>
                    <td>{p.COD_PROVEEDOR}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Detalle de pedido</h5>
          <form className="row g-2 align-items-end" onSubmit={handleDetalleSubmit}>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Cod pedido"
                value={detalleForm.cod_pedido}
                onChange={(e) => setDetalleForm((p) => ({ ...p, cod_pedido: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={detalleForm.cod_producto}
                onChange={(e) => setDetalleForm((p) => ({ ...p, cod_producto: e.target.value }))}
                required
              >
                <option value="">Producto</option>
                {productos.map((prod) => (
                  <option key={prod.COD_PRODUCTO} value={prod.COD_PRODUCTO}>
                    {prod.COD_PRODUCTO} - {prod.NOMBRE_PRODUCTO}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Nombre producto"
                value={detalleForm.nombre_producto}
                onChange={(e) => setDetalleForm((p) => ({ ...p, nombre_producto: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Cantidad"
                value={detalleForm.cantidad_producto}
                onChange={(e) => setDetalleForm((p) => ({ ...p, cantidad_producto: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Precio compra"
                value={detalleForm.precio_compra}
                onChange={(e) => setDetalleForm((p) => ({ ...p, precio_compra: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-1">
              <button className="btn btn-primary w-100" type="submit">
                Agregar
              </button>
            </div>
          </form>

          <div className="table-responsive mt-3" style={{ maxHeight: "280px" }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Producto</th>
                  <th>Nombre</th>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((d) => (
                  <tr key={`${d.COD_PEDIDO}-${d.COD_PRODUCTO}`}>
                    <td>{d.COD_PEDIDO}</td>
                    <td>{d.COD_PRODUCTO}</td>
                    <td>{d.NOMBRE_PRODUCTO}</td>
                    <td>{d.CANTIDAD_PRODUCTO}</td>
                    <td>{d.PRECIO_COMPRA}</td>
                    <td>{d.PRECIO_TOTAL}</td>
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

export default AdminPedidosPage;
