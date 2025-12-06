import { useEffect, useState } from "react";
import {
  fetchUsers,
  deleteUser,
  fetchReservations,
  updateReservationDates,
  fetchProveedores,
  createProveedor,
  fetchProductos,
  createProducto,
  fetchPedidos,
  createPedido,
  fetchDetallePedidos,
  createDetallePedido,
  fetchVentas,
  fetchEmployees,
  createEmployee,
  fetchOccupancy,
  releaseRoom,
  fetchRegiones,
  createRegion,
  fetchCiudades,
  createCiudad,
  fetchComunas,
  createComuna,
  fetchCalles,
  createCalle,
  fetchRoles,
  createRol,
  deleteRol,
  fetchUsuarioRoles,
  assignUsuarioRol,
  deleteUsuarioRol,
  fetchStockMovs,
  createStockMov,
  fetchPagosVentas,
  createPagoVenta,
  fetchDetalleVentas,
  fetchDetallePagoHab,
} from "../services/adminService";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [regiones, setRegiones] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [calles, setCalles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [usuarioRoles, setUsuarioRoles] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [pagosVenta, setPagosVenta] = useState([]);
  const [detalleVentas, setDetalleVentas] = useState([]);
  const [detallePagoHab, setDetallePagoHab] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [resForm, setResForm] = useState({ id: "", fecha_estadia: "", fecha_salida: "" });
  const [provForm, setProvForm] = useState({ nombre: "", direccion: "", telefono: "", cod_region: "" });
  const [productoForm, setProductoForm] = useState({
    nombre: "",
    tipo: "",
    precio: "",
    cantidad: "",
    stock: "",
  });
  const [empleadoForm, setEmpleadoForm] = useState({
    cargo: "",
    fecha_contratacion: "",
    salario: "",
    comision: "",
    cod_usuario: "",
  });
  const [pedidoForm, setPedidoForm] = useState({ fecha_pedido: "", cod_empleado: "", cod_proveedor: "" });
  const [detalleForm, setDetalleForm] = useState({
    cod_pedido: "",
    cod_producto: "",
    nombre_producto: "",
    cantidad_producto: "",
    precio_compra: "",
  });
  const [regionForm, setRegionForm] = useState({ cod_region: "", region: "" });
  const [ciudadForm, setCiudadForm] = useState({ cod_ciudad: "", ciudad: "", cod_region: "" });
  const [comunaForm, setComunaForm] = useState({ cod_comuna: "", comuna: "", cod_ciudad: "" });
  const [calleForm, setCalleForm] = useState({ cod_calle: "", calle: "", nro: "", cod_comuna: "" });
  const [rolForm, setRolForm] = useState({ nombre: "" });
  const [usuarioRolForm, setUsuarioRolForm] = useState({ cod_usuario: "", cod_rol: "" });
  const [stockForm, setStockForm] = useState({
    cod_producto: "",
    tipo_movimiento: "ENTRADA",
    cantidad: "",
    fecha_movimiento: "",
    motivo: "",
  });
  const [pagoVentaForm, setPagoVentaForm] = useState({
    cod_venta: "",
    modo_pago: "EFECTIVO",
    monto: "",
    fecha_pago: "",
  });

  const loadData = async () => {
    const calls = [
      fetchUsers(),
      fetchReservations(),
      fetchProveedores(),
      fetchProductos(),
      fetchPedidos(),
      fetchDetallePedidos(),
      fetchEmployees(),
      fetchOccupancy(),
      fetchVentas(),
      fetchRegiones(),
      fetchCiudades(),
      fetchComunas(),
      fetchCalles(),
      fetchRoles(),
      fetchUsuarioRoles(),
      fetchStockMovs(),
      fetchPagosVentas(),
      fetchDetalleVentas(),
      fetchDetallePagoHab(),
    ];

    const results = await Promise.allSettled(calls);

    const take = (idx) =>
      results[idx].status === "fulfilled" ? results[idx].value?.data?.data || [] : [];

    setUsers(take(0));
    setReservations(take(1));
    setProveedores(take(2));
    setProductos(take(3));
    setPedidos(take(4));
    setDetalles(take(5));
    setEmployees(take(6));
    setOccupancy(take(7));
    setVentas(take(8));
    setRegiones(take(9));
    setCiudades(take(10));
    setComunas(take(11));
    setCalles(take(12));
    setRoles(take(13));
    setUsuarioRoles(take(14));
    setMovimientos(take(15));
    setPagosVenta(take(16));
    setDetalleVentas(take(17));
    setDetallePagoHab(take(18));

    const failed = results.find((r) => r.status === "rejected");
    if (failed) {
      console.error("Error cargando panel admin", failed.reason);
      setError("No se pudo cargar todo el panel (revisa consola/network)");
    } else {
      setError(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const notify = (msg) => {
    setMessage(msg);
    setError(null);
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      notify("Usuario eliminado");
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo eliminar el usuario");
    }
  };

  const handleReleaseRoom = async (id) => {
    try {
      await releaseRoom(id);
      notify("Habitación liberada");
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo liberar la habitación");
    }
  };

  const handleReservationDates = async (e) => {
    e.preventDefault();
    if (!resForm.id || !resForm.fecha_estadia || !resForm.fecha_salida) {
      setError("Selecciona reserva y fechas");
      return;
    }
    try {
      await updateReservationDates(resForm.id, {
        fecha_estadia: resForm.fecha_estadia,
        fecha_salida: resForm.fecha_salida,
      });
      notify("Fechas de reserva actualizadas");
      setResForm({ id: "", fecha_estadia: "", fecha_salida: "" });
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron actualizar las fechas");
    }
  };

  const handleProveedorSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProveedor({
        nombre: provForm.nombre,
        direccion: provForm.direccion,
        telefono: provForm.telefono,
        cod_region: provForm.cod_region ? Number(provForm.cod_region) : null,
      });
      notify("Proveedor creado");
      setProvForm({ nombre: "", direccion: "", telefono: "", cod_region: "" });
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el proveedor");
    }
  };

  const handleProductoSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProducto({
        nombre: productoForm.nombre,
        tipo: productoForm.tipo,
        precio: Number(productoForm.precio || 0),
        cantidad: Number(productoForm.cantidad || 0),
        stock: Number(productoForm.stock || 0),
      });
      notify("Producto creado");
      setProductoForm({ nombre: "", tipo: "", precio: "", cantidad: "", stock: "" });
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el producto");
    }
  };

  const handleEmpleadoSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEmployee({
        cargo: empleadoForm.cargo,
        fecha_contratacion: empleadoForm.fecha_contratacion,
        salario: Number(empleadoForm.salario || 0),
        comision: Number(empleadoForm.comision || 0),
        cod_usuario: empleadoForm.cod_usuario ? Number(empleadoForm.cod_usuario) : null,
      });
      notify("Empleado creado");
      setEmpleadoForm({ cargo: "", fecha_contratacion: "", salario: "", comision: "", cod_usuario: "" });
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el empleado");
    }
  };

  const handlePedidoSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPedido({
        fecha_pedido: pedidoForm.fecha_pedido,
        cod_empleado: Number(pedidoForm.cod_empleado),
        cod_proveedor: Number(pedidoForm.cod_proveedor),
      });
      notify("Pedido creado");
      setPedidoForm({ fecha_pedido: "", cod_empleado: "", cod_proveedor: "" });
      loadData();
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
      notify("Detalle de pedido creado");
      setDetalleForm({
        cod_pedido: "",
        cod_producto: "",
        nombre_producto: "",
        cantidad_producto: "",
        precio_compra: "",
      });
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el detalle");
    }
  };

  const handleRegionSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRegion({
        cod_region: Number(regionForm.cod_region),
        region: regionForm.region,
      });
      notify("Region creada");
      setRegionForm({ cod_region: "", region: "" });
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear la region");
    }
  };

  const handleCiudadSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCiudad({
        cod_ciudad: Number(ciudadForm.cod_ciudad),
        ciudad: ciudadForm.ciudad,
        cod_region: ciudadForm.cod_region ? Number(ciudadForm.cod_region) : null,
      });
      notify("Ciudad creada");
      setCiudadForm({ cod_ciudad: "", ciudad: "", cod_region: "" });
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear la ciudad");
    }
  };

  const handleComunaSubmit = async (e) => {
    e.preventDefault();
    try {
      await createComuna({
        cod_comuna: Number(comunaForm.cod_comuna),
        comuna: comunaForm.comuna,
        cod_ciudad: comunaForm.cod_ciudad ? Number(comunaForm.cod_ciudad) : null,
      });
      notify("Comuna creada");
      setComunaForm({ cod_comuna: "", comuna: "", cod_ciudad: "" });
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear la comuna");
    }
  };

  const handleCalleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCalle({
        cod_calle: Number(calleForm.cod_calle),
        calle: calleForm.calle,
        nro: calleForm.nro,
        cod_comuna: calleForm.cod_comuna ? Number(calleForm.cod_comuna) : null,
      });
      notify("Calle creada");
      setCalleForm({ cod_calle: "", calle: "", nro: "", cod_comuna: "" });
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear la calle");
    }
  };

  const handleRolSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRol({ nombre: rolForm.nombre });
      notify("Rol creado");
      setRolForm({ nombre: "" });
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el rol");
    }
  };

  const handleDeleteRol = async (id) => {
    try {
      await deleteRol(id);
      notify("Rol eliminado");
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo eliminar el rol");
    }
  };

  const handleUsuarioRolSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignUsuarioRol({
        cod_usuario: Number(usuarioRolForm.cod_usuario),
        cod_rol: Number(usuarioRolForm.cod_rol),
      });
      notify("Rol asignado");
      setUsuarioRolForm({ cod_usuario: "", cod_rol: "" });
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo asignar el rol");
    }
  };

  const handleDeleteUsuarioRol = async (usuarioId, rolId) => {
    try {
      await deleteUsuarioRol(usuarioId, rolId);
      notify("Rol quitado");
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo quitar el rol");
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      await createStockMov({
        cod_producto: Number(stockForm.cod_producto),
        tipo_movimiento: stockForm.tipo_movimiento,
        cantidad: Number(stockForm.cantidad),
        fecha_movimiento: stockForm.fecha_movimiento,
        motivo: stockForm.motivo,
      });
      notify("Movimiento de stock creado");
      setStockForm({ cod_producto: "", tipo_movimiento: "ENTRADA", cantidad: "", fecha_movimiento: "", motivo: "" });
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el movimiento");
    }
  };

  const handlePagoVentaSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPagoVenta({
        cod_venta: Number(pagoVentaForm.cod_venta),
        modo_pago: pagoVentaForm.modo_pago,
        monto: Number(pagoVentaForm.monto),
        fecha_pago: pagoVentaForm.fecha_pago,
      });
      notify("Pago de venta registrado");
      setPagoVentaForm({ cod_venta: "", modo_pago: "EFECTIVO", monto: "", fecha_pago: "" });
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo registrar el pago");
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Panel de administración</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* Resumen compacto */}
      <div className="row g-3 mb-4">
        {[
          { label: "Usuarios", value: users.length },
          { label: "Empleados", value: employees.length },
          { label: "Habitaciones libres", value: occupancy.filter((h) => h.ESTADO === "LIBRE").length },
          { label: "Ventas", value: ventas.length },
          {
            label: "Total ventas",
            value: ventas.reduce((acc, v) => acc + (Number(v.VALOR_TOTAL) || 0), 0),
            prefix: "$",
          },
        ].map((card) => (
          <div className="col-sm-6 col-lg-3" key={card.label}>
            <div className="border rounded p-3 h-100 shadow-sm bg-light">
              <div className="text-muted small">{card.label}</div>
              <div className="fw-bold fs-5">
                {card.prefix || ""}
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ventas de usuarios con reserva */}
      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Compras de usuarios con reserva</h5>
          <div className="table-responsive" style={{ maxHeight: "240px" }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th># Venta</th>
                  <th>Usuario</th>
                  <th>Empleado</th>
                  <th>Fecha</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.COD_VENTA}>
                    <td>{v.COD_VENTA}</td>
                    <td>{v.COD_USUARIO}</td>
                    <td>{v.COD_EMPLEADO || "-"}</td>
                    <td>{v.FECHA_VENTA}</td>
                    <td>{v.VALOR_TOTAL || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Usuarios y empleados */}
      <div className="row g-3 mb-3">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Usuarios</h5>
              <div className="table-responsive" style={{ maxHeight: "220px" }}>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.COD_USUARIO}>
                        <td>{u.COD_USUARIO}</td>
                        <td>{u.NOMBRE_USUARIO}</td>
                        <td>{u.EMAIL_USUARIO}</td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteUser(u.COD_USUARIO)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Empleados</h5>
              <div className="table-responsive" style={{ maxHeight: "220px" }}>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cargo</th>
                      <th>Cod usuario</th>
                      <th>Salario</th>
                      <th>Comisión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((e) => (
                      <tr key={e.COD_EMPLEADO}>
                        <td>{e.COD_EMPLEADO}</td>
                        <td>{e.CARGO_EMPLEADO}</td>
                        <td>{e.COD_USUARIO}</td>
                        <td>{e.SALARIO}</td>
                        <td>{e.COMISION}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ocupación y cambio de fechas */}
      <div className="row g-3 mb-3">
        <div className="col-lg-7">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Ocupación de habitaciones</h5>
              <div className="table-responsive" style={{ maxHeight: "240px" }}>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Hab.</th>
                      <th>Estado</th>
                      <th>Usuario</th>
                      <th>Pago</th>
                      <th>Desocupa</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {occupancy.map((h) => (
                      <tr key={`${h.COD_HABITACION}-${h.COD_PAGO_HABITACION || "x"}`}>
                        <td>{h.NRO_HABITACION}</td>
                        <td>{h.ESTADO}</td>
                        <td>{h.EMAIL_USUARIO || "-"}</td>
                        <td>
                          {h.COD_PAGO_HABITACION
                            ? `#${h.COD_PAGO_HABITACION} (${h.ESTADO_PAGO || "-"})`
                            : "-"}
                        </td>
                        <td>{h.FECHA_DESOCUPACION ? h.FECHA_DESOCUPACION.slice(0, 10) : "-"}</td>
                        <td>
                          {h.ESTADO !== "LIBRE" && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleReleaseRoom(h.COD_HABITACION)}
                            >
                              Liberar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Cambiar fechas de reserva</h5>
              <form className="row g-2" onSubmit={handleReservationDates}>
                <div className="col-12">
                  <select
                    className="form-select"
                    value={resForm.id}
                    onChange={(e) => setResForm((prev) => ({ ...prev, id: e.target.value }))}
                  >
                    <option value="">Selecciona reserva</option>
                    {reservations.map((r) => (
                      <option key={r.COD_PAGO_HABITACION} value={r.COD_PAGO_HABITACION}>
                        #{r.COD_PAGO_HABITACION} - Hab {r.NRO_HABITACION} - {r.EMAIL_USUARIO || "-"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <input
                    type="date"
                    className="form-control"
                    value={resForm.fecha_estadia}
                    onChange={(e) => setResForm((prev) => ({ ...prev, fecha_estadia: e.target.value }))}
                  />
                </div>
                <div className="col-6">
                  <input
                    type="date"
                    className="form-control"
                    value={resForm.fecha_salida}
                    onChange={(e) => setResForm((prev) => ({ ...prev, fecha_salida: e.target.value }))}
                  />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary w-100" type="submit">
                    Actualizar fechas
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Crear proveedor</h5>
          <form className="row g-2" onSubmit={handleProveedorSubmit}>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Nombre"
                value={provForm.nombre}
                onChange={(e) => setProvForm((prev) => ({ ...prev, nombre: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Dirección"
                value={provForm.direccion}
                onChange={(e) => setProvForm((prev) => ({ ...prev, direccion: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <input
                className="form-control"
                placeholder="Teléfono"
                value={provForm.telefono}
                onChange={(e) => setProvForm((prev) => ({ ...prev, telefono: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Cod región"
                value={provForm.cod_region}
                onChange={(e) => setProvForm((prev) => ({ ...prev, cod_region: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" type="submit">
                Crear proveedor
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Crear empleado</h5>
          <form className="row g-2" onSubmit={handleEmpleadoSubmit}>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Cargo"
                value={empleadoForm.cargo}
                onChange={(e) => setEmpleadoForm((prev) => ({ ...prev, cargo: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={empleadoForm.fecha_contratacion}
                onChange={(e) => setEmpleadoForm((prev) => ({ ...prev, fecha_contratacion: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Salario"
                value={empleadoForm.salario}
                onChange={(e) => setEmpleadoForm((prev) => ({ ...prev, salario: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Comisión"
                value={empleadoForm.comision}
                onChange={(e) => setEmpleadoForm((prev) => ({ ...prev, comision: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Cod usuario (opcional)"
                value={empleadoForm.cod_usuario}
                onChange={(e) => setEmpleadoForm((prev) => ({ ...prev, cod_usuario: e.target.value }))}
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

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Productos</h5>
          <form className="row g-2" onSubmit={handleProductoSubmit}>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Nombre"
                value={productoForm.nombre}
                onChange={(e) => setProductoForm((prev) => ({ ...prev, nombre: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                className="form-control"
                placeholder="Tipo"
                value={productoForm.tipo}
                onChange={(e) => setProductoForm((prev) => ({ ...prev, tipo: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Precio"
                value={productoForm.precio}
                onChange={(e) => setProductoForm((prev) => ({ ...prev, precio: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Cantidad"
                value={productoForm.cantidad}
                onChange={(e) => setProductoForm((prev) => ({ ...prev, cantidad: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Stock"
                value={productoForm.stock}
                onChange={(e) => setProductoForm((prev) => ({ ...prev, stock: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-1">
              <button className="btn btn-primary w-100" type="submit">
                Crear
              </button>
            </div>
          </form>
          <div className="table-responsive mt-3" style={{ maxHeight: "200px" }}>
            <table className="table table-sm">
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

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Pedido y detalle</h5>
          <form className="row g-2 align-items-end" onSubmit={handlePedidoSubmit}>
            <div className="col-md-4">
              <input
                type="date"
                className="form-control"
                value={pedidoForm.fecha_pedido}
                onChange={(e) => setPedidoForm((prev) => ({ ...prev, fecha_pedido: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                placeholder="Cod empleado"
                value={pedidoForm.cod_empleado}
                onChange={(e) => setPedidoForm((prev) => ({ ...prev, cod_empleado: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                placeholder="Cod proveedor"
                value={pedidoForm.cod_proveedor}
                onChange={(e) => setPedidoForm((prev) => ({ ...prev, cod_proveedor: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100" type="submit">
                Crear pedido
              </button>
            </div>
          </form>
          <div className="table-responsive mt-3" style={{ maxHeight: "150px" }}>
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Valor total</th>
                  <th>Fecha</th>
                  <th>Cod empleado</th>
                  <th>Cod proveedor</th>
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

          <hr className="my-4" />

          <h5 className="card-title">Agregar detalle al pedido</h5>
          <form className="row g-2 align-items-end" onSubmit={handleDetalleSubmit}>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Cod pedido"
                value={detalleForm.cod_pedido}
                onChange={(e) => setDetalleForm((prev) => ({ ...prev, cod_pedido: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Cod producto"
                value={detalleForm.cod_producto}
                onChange={(e) => setDetalleForm((prev) => ({ ...prev, cod_producto: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                className="form-control"
                placeholder="Nombre producto"
                value={detalleForm.nombre_producto}
                onChange={(e) => setDetalleForm((prev) => ({ ...prev, nombre_producto: e.target.value }))}
              />
            </div>
            <div className="col-md-1">
              <input
                type="number"
                className="form-control"
                placeholder="Cant"
                value={detalleForm.cantidad_producto}
                onChange={(e) => setDetalleForm((prev) => ({ ...prev, cantidad_producto: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Precio compra"
                value={detalleForm.precio_compra}
                onChange={(e) => setDetalleForm((prev) => ({ ...prev, precio_compra: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-1">
              <button className="btn btn-primary w-100" type="submit">
                Agregar
              </button>
            </div>
          </form>
          <div className="table-responsive mt-3" style={{ maxHeight: "200px" }}>
            <table className="table table-sm">
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

      {/* Ubicaciones */}
      <div className="row g-3 mb-3">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Regiones y ciudades</h5>
              <form className="row g-2 align-items-end" onSubmit={handleRegionSubmit}>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Cod region"
                    value={regionForm.cod_region}
                    onChange={(e) => setRegionForm((prev) => ({ ...prev, cod_region: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder="Nombre region"
                    value={regionForm.region}
                    onChange={(e) => setRegionForm((prev) => ({ ...prev, region: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <button className="btn btn-primary w-100" type="submit">
                    Crear region
                  </button>
                </div>
              </form>
              <div className="table-responsive mt-3" style={{ maxHeight: "150px" }}>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regiones.map((r) => (
                      <tr key={r.COD_REGION}>
                        <td>{r.COD_REGION}</td>
                        <td>{r.REGION}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <hr className="my-3" />

              <form className="row g-2 align-items-end" onSubmit={handleCiudadSubmit}>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Cod ciudad"
                    value={ciudadForm.cod_ciudad}
                    onChange={(e) => setCiudadForm((prev) => ({ ...prev, cod_ciudad: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    className="form-control"
                    placeholder="Nombre ciudad"
                    value={ciudadForm.ciudad}
                    onChange={(e) => setCiudadForm((prev) => ({ ...prev, ciudad: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={ciudadForm.cod_region}
                    onChange={(e) => setCiudadForm((prev) => ({ ...prev, cod_region: e.target.value }))}
                    required
                  >
                    <option value="">Cod region</option>
                    {regiones.map((r) => (
                      <option key={r.COD_REGION} value={r.COD_REGION}>
                        {r.COD_REGION} - {r.REGION}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-primary w-100" type="submit">
                    Crear ciudad
                  </button>
                </div>
              </form>
              <div className="table-responsive mt-3" style={{ maxHeight: "150px" }}>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ciudad</th>
                      <th>Region</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ciudades.map((c) => (
                      <tr key={c.COD_CIUDAD}>
                        <td>{c.COD_CIUDAD}</td>
                        <td>{c.CIUDAD}</td>
                        <td>{c.COD_REGION}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Comunas y calles</h5>
              <form className="row g-2 align-items-end" onSubmit={handleComunaSubmit}>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Cod comuna"
                    value={comunaForm.cod_comuna}
                    onChange={(e) => setComunaForm((prev) => ({ ...prev, cod_comuna: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    className="form-control"
                    placeholder="Nombre comuna"
                    value={comunaForm.comuna}
                    onChange={(e) => setComunaForm((prev) => ({ ...prev, comuna: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={comunaForm.cod_ciudad}
                    onChange={(e) => setComunaForm((prev) => ({ ...prev, cod_ciudad: e.target.value }))}
                    required
                  >
                    <option value="">Cod ciudad</option>
                    {ciudades.map((c) => (
                      <option key={c.COD_CIUDAD} value={c.COD_CIUDAD}>
                        {c.COD_CIUDAD} - {c.CIUDAD}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-primary w-100" type="submit">
                    Crear comuna
                  </button>
                </div>
              </form>

              <div className="table-responsive mt-3" style={{ maxHeight: "130px" }}>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Comuna</th>
                      <th>Ciudad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comunas.map((c) => (
                      <tr key={c.COD_COMUNA}>
                        <td>{c.COD_COMUNA}</td>
                        <td>{c.COMUNA}</td>
                        <td>{c.COD_CIUDAD}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <hr className="my-3" />

              <form className="row g-2 align-items-end" onSubmit={handleCalleSubmit}>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Cod calle"
                    value={calleForm.cod_calle}
                    onChange={(e) => setCalleForm((prev) => ({ ...prev, cod_calle: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    className="form-control"
                    placeholder="Nombre calle"
                    value={calleForm.calle}
                    onChange={(e) => setCalleForm((prev) => ({ ...prev, calle: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control"
                    placeholder="Nro"
                    value={calleForm.nro}
                    onChange={(e) => setCalleForm((prev) => ({ ...prev, nro: e.target.value }))}
                  />
                </div>
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={calleForm.cod_comuna}
                    onChange={(e) => setCalleForm((prev) => ({ ...prev, cod_comuna: e.target.value }))}
                    required
                  >
                    <option value="">Cod comuna</option>
                    {comunas.map((c) => (
                      <option key={c.COD_COMUNA} value={c.COD_COMUNA}>
                        {c.COD_COMUNA} - {c.COMUNA}
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

              <div className="table-responsive mt-3" style={{ maxHeight: "130px" }}>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Calle</th>
                      <th>Nro</th>
                      <th>Comuna</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calles.map((c) => (
                      <tr key={c.COD_CALLE}>
                        <td>{c.COD_CALLE}</td>
                        <td>{c.CALLE}</td>
                        <td>{c.NRO}</td>
                        <td>{c.COD_COMUNA}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roles y asignaciones */}
      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Roles y asignaciones</h5>
          <form className="row g-2 align-items-end" onSubmit={handleRolSubmit}>
            <div className="col-md-8">
              <input
                className="form-control"
                placeholder="Nombre del rol"
                value={rolForm.nombre}
                onChange={(e) => setRolForm((prev) => ({ ...prev, nombre: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100" type="submit">
                Crear rol
              </button>
            </div>
          </form>
          <div className="table-responsive mt-3" style={{ maxHeight: "200px" }}>
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Rol</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.COD_ROL}>
                    <td>{r.COD_ROL}</td>
                    <td>{r.NOMBRE_ROL}</td>
                    <td>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteRol(r.COD_ROL)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <hr className="my-4" />

          <h6>Asignar rol a usuario</h6>
          <form className="row g-2 align-items-end" onSubmit={handleUsuarioRolSubmit}>
            <div className="col-md-5">
              <select
                className="form-select"
                value={usuarioRolForm.cod_usuario}
                onChange={(e) => setUsuarioRolForm((prev) => ({ ...prev, cod_usuario: e.target.value }))}
                required
              >
                <option value="">Usuario</option>
                {users.map((u) => (
                  <option key={u.COD_USUARIO} value={u.COD_USUARIO}>
                    {u.COD_USUARIO} - {u.NOMBRE_USUARIO}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-5">
              <select
                className="form-select"
                value={usuarioRolForm.cod_rol}
                onChange={(e) => setUsuarioRolForm((prev) => ({ ...prev, cod_rol: e.target.value }))}
                required
              >
                <option value="">Rol</option>
                {roles.map((r) => (
                  <option key={r.COD_ROL} value={r.COD_ROL}>
                    {r.COD_ROL} - {r.NOMBRE_ROL}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" type="submit">
                Asignar
              </button>
            </div>
          </form>
          <div className="table-responsive mt-3" style={{ maxHeight: "180px" }}>
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usuarioRoles.map((ur) => (
                  <tr key={`${ur.COD_USUARIO}-${ur.COD_ROL}`}>
                    <td>{ur.COD_USUARIO}</td>
                    <td>{ur.COD_ROL}</td>
                    <td>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteUsuarioRol(ur.COD_USUARIO, ur.COD_ROL)}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stock y pagos de venta */}
      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Movimientos de stock</h5>
          <form className="row g-2 align-items-end" onSubmit={handleStockSubmit}>
            <div className="col-md-2">
              <select
                className="form-select"
                value={stockForm.cod_producto}
                onChange={(e) => setStockForm((prev) => ({ ...prev, cod_producto: e.target.value }))}
                required
              >
                <option value="">Producto</option>
                {productos.map((p) => (
                  <option key={p.COD_PRODUCTO} value={p.COD_PRODUCTO}>
                    {p.COD_PRODUCTO} - {p.NOMBRE_PRODUCTO}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={stockForm.tipo_movimiento}
                onChange={(e) => setStockForm((prev) => ({ ...prev, tipo_movimiento: e.target.value }))}
              >
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Cantidad"
                value={stockForm.cantidad}
                onChange={(e) => setStockForm((prev) => ({ ...prev, cantidad: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={stockForm.fecha_movimiento}
                onChange={(e) => setStockForm((prev) => ({ ...prev, fecha_movimiento: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Motivo"
                value={stockForm.motivo}
                onChange={(e) => setStockForm((prev) => ({ ...prev, motivo: e.target.value }))}
              />
            </div>
            <div className="col-md-1">
              <button className="btn btn-primary w-100" type="submit">
                Guardar
              </button>
            </div>
          </form>
          <div className="table-responsive mt-3" style={{ maxHeight: "200px" }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cant</th>
                  <th>Fecha</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => (
                  <tr key={m.COD_MOVIMIENTO}>
                    <td>{m.COD_MOVIMIENTO}</td>
                    <td>{m.COD_PRODUCTO}</td>
                    <td>{m.TIPO_MOVIMIENTO}</td>
                    <td>{m.CANTIDAD}</td>
                    <td>{m.FECHA_MOVIMIENTO}</td>
                    <td>{m.MOTIVO}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <hr className="my-4" />

          <h5 className="card-title">Pagos de venta</h5>
          <form className="row g-2 align-items-end" onSubmit={handlePagoVentaSubmit}>
            <div className="col-md-3">
              <select
                className="form-select"
                value={pagoVentaForm.cod_venta}
                onChange={(e) => setPagoVentaForm((prev) => ({ ...prev, cod_venta: e.target.value }))}
                required
              >
                <option value="">Cod venta</option>
                {ventas.map((v) => (
                  <option key={v.COD_VENTA} value={v.COD_VENTA}>
                    {v.COD_VENTA} - {v.VALOR_TOTAL || 0}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={pagoVentaForm.modo_pago}
                onChange={(e) => setPagoVentaForm((prev) => ({ ...prev, modo_pago: e.target.value }))}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Monto"
                value={pagoVentaForm.monto}
                onChange={(e) => setPagoVentaForm((prev) => ({ ...prev, monto: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={pagoVentaForm.fecha_pago}
                onChange={(e) => setPagoVentaForm((prev) => ({ ...prev, fecha_pago: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" type="submit">
                Registrar pago
              </button>
            </div>
          </form>
          <div className="table-responsive mt-3" style={{ maxHeight: "200px" }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Venta</th>
                  <th>Modo</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pagosVenta.map((p) => (
                  <tr key={p.COD_PAGO}>
                    <td>{p.COD_PAGO}</td>
                    <td>{p.COD_VENTA}</td>
                    <td>{p.MODO_PAGO}</td>
                    <td>{p.MONTO}</td>
                    <td>{p.FECHA_PAGO}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <hr className="my-4" />

          <h6>Detalle de ventas</h6>
          <div className="table-responsive" style={{ maxHeight: "220px" }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Venta</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detalleVentas.map((d) => (
                  <tr key={`${d.COD_VENTA}-${d.COD_PRODUCTO}`}>
                    <td>{d.COD_VENTA}</td>
                    <td>{d.COD_PRODUCTO}</td>
                    <td>{d.CANTIDAD}</td>
                    <td>{d.PRECIO_PRODUCTO}</td>
                    <td>{d.PRECIO_TOTAL}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detalle pago de habitacion */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Detalle pago de habitacion</h5>
          <div className="table-responsive" style={{ maxHeight: "260px" }}>
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Pago</th>
                  <th>Habitacion</th>
                  <th>Fecha estadia</th>
                  <th>Precio</th>
                  <th>Dias</th>
                </tr>
              </thead>
              <tbody>
                {detallePagoHab.map((d) => (
                  <tr key={`${d.COD_PAGO_HABITACION}-${d.COD_HABITACION}`}>
                    <td>{d.COD_PAGO_HABITACION}</td>
                    <td>{d.COD_HABITACION}</td>
                    <td>{d.FECHA_ESTADIA}</td>
                    <td>{d.PRECIO_HABITACION}</td>
                    <td>{d.DIAS}</td>
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

export default AdminPage;
