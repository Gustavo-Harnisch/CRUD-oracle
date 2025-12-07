import api from "./api";

export const listProducts = () => api.get("/products").then((res) => res.data);
export const createProduct = (payload) => api.post("/products", payload).then((res) => res.data);
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload).then((res) => res.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((res) => res.data);

export const listServiceProducts = (serviceId) =>
  api.get(`/services/${serviceId}/products`).then((res) => res.data);
export const replaceServiceProducts = (serviceId, items) =>
  api.put(`/services/${serviceId}/products`, items).then((res) => res.data);

export default {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listServiceProducts,
  replaceServiceProducts,
};
