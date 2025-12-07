import api from "./api";

export const listServices = (params = {}) =>
  api.get("/services", { params }).then((res) => res.data);

export const createService = (payload) =>
  api.post("/services", payload).then((res) => res.data);

export const updateService = (id, payload) =>
  api.put(`/services/${id}`, payload).then((res) => res.data);

export const deleteService = (id) =>
  api.delete(`/services/${id}`).then((res) => res.data);

export const changeServiceStatus = (id, estado) =>
  api.patch(`/services/${id}/status`, { estado }).then((res) => res.data);

export const fetchServiceProducts = (serviceId) =>
  api.get(`/services/${serviceId}/products`).then((res) => res.data);

export const fetchServiceCategories = () => api.get("/services/categories").then((res) => res.data);

export default {
  listServices,
  createService,
  updateService,
  deleteService,
  changeServiceStatus,
  fetchServiceProducts,
  fetchServiceCategories,
};
