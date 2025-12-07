import api from "./api";

export const listProviders = () => api.get("/providers").then((res) => res.data);
export const createProvider = (payload) => api.post("/providers", payload).then((res) => res.data);
export const updateProvider = (id, payload) => api.put(`/providers/${id}`, payload).then((res) => res.data);
export const deleteProvider = (id) => api.delete(`/providers/${id}`).then((res) => res.data);

export default {
  listProviders,
  createProvider,
  updateProvider,
  deleteProvider,
};
