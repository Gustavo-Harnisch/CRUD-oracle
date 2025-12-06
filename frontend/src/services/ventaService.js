import api from "./api";

export const fetchProductos = () => api.get("/productos");

export const createVentaUsuario = (payload) => api.post("/ventas/comprar", payload);

