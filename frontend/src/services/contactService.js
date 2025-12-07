import api from "./api";

export const createContact = (payload) => api.post("/contact", payload);

// List contacts respecting backend permissions:
// - Admin/employee: all or assigned
// - User: only own contacts
export const listContacts = (params = {}) => api.get("/contact", { params });

export const getContact = (id) => api.get(`/contact/${id}`);

export const assignContact = (id, empleadoId) =>
  api.post(`/contact/${id}/assign`, { empleadoId });

export const respondContact = (id, payload) => api.post(`/contact/${id}/respond`, payload);

export const changeContactState = (id, estado, notas) =>
  api.patch(`/contact/${id}/state`, { estado, notas });

export default {
  createContact,
  listContacts,
  getContact,
  assignContact,
  respondContact,
  changeContactState,
};
