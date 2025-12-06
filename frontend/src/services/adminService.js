import api from "./api";

export const fetchUsers = () => api.get("/usuarios");
export const fetchOccupancy = () => api.get("/habitaciones/admin/ocupacion/todas");
export const releaseRoom = (id) => api.patch(`/habitaciones/${id}/liberar`);
export const fetchEmployees = () => api.get("/empleados");
export const createEmployee = (payload) => api.post("/empleados", payload);
export const fetchProductos = () => api.get("/productos");
export const createProducto = (payload) => api.post("/productos", payload);
export const deleteProducto = (id) => api.delete(`/productos/${id}`);
export const fetchRooms = () => api.get("/habitaciones");
export const createRoom = (payload) => api.post("/habitaciones", payload);
export const updateRoom = (id, payload) => api.put(`/habitaciones/${id}`, payload);
export const deleteRoom = (id) => api.delete(`/habitaciones/${id}`);
export const fetchVentas = () => api.get("/ventas");
export const updateReservationDates = (id, payload) => api.patch(`/reservas/${id}/fechas`, payload);
export const deleteUser = (id) => api.delete(`/usuarios/${id}`);
export const fetchProveedores = () => api.get("/proveedores");
export const createProveedor = (payload) => api.post("/proveedores", payload);
export const fetchPedidos = () => api.get("/pedidos");
export const createPedido = (payload) => api.post("/pedidos", payload);
export const fetchDetallePedidos = () => api.get("/detalle-pedidos");
export const createDetallePedido = (payload) => api.post("/detalle-pedidos", payload);

// Ubicaciones (catálogos)
export const fetchRegiones = () => api.get("/regiones");
export const createRegion = (payload) => api.post("/regiones", payload);

export const fetchCiudades = () => api.get("/ciudades");
export const createCiudad = (payload) => api.post("/ciudades", payload);

export const fetchComunas = () => api.get("/comunas");
export const createComuna = (payload) => api.post("/comunas", payload);

export const fetchCalles = () => api.get("/calles");
export const createCalle = (payload) => api.post("/calles", payload);

// Roles y asignaciones (seguridad app)
export const fetchRoles = () => api.get("/roles");
export const createRol = (payload) => api.post("/roles", payload);
export const deleteRol = (id) => api.delete(`/roles/${id}`);

export const fetchUsuarioRoles = () => api.get("/usuario-roles");
export const assignUsuarioRol = (payload) => api.post("/usuario-roles", payload);
export const deleteUsuarioRol = (usuarioId, rolId) => api.delete(`/usuario-roles/${usuarioId}/${rolId}`);

// Stock y ventas
export const fetchStockMovs = () => api.get("/movimientos-stock");
export const createStockMov = (payload) => api.post("/movimientos-stock", payload);

export const fetchPagosVentas = () => api.get("/pago-ventas");
export const createPagoVenta = (payload) => api.post("/pago-ventas", payload);

export const fetchDetalleVentas = () => api.get("/detalle-ventas");

// Detalle de pago habitacion (para auditar reservas)
export const fetchDetallePagoHab = () => api.get("/detalle-pago-habitacion");
export const updateReservaFechas = (id, payload) => api.patch(`/reservas/${id}/fechas`, payload);
export const liberarHabitacion = (id) => api.patch(`/habitaciones/${id}/liberar`);

// Pagos de habitación (reservas completas)
export const fetchReservations = () => api.get("/reservas");
