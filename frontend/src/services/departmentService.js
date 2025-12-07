import api from "./api";

export const listDepartments = () => api.get("/departments").then((res) => res.data);
export const getDepartment = (id) => api.get(`/departments/${id}`).then((res) => res.data);
export const createDepartment = (payload) => api.post("/departments", payload).then((res) => res.data);
export const updateDepartment = (id, payload) => api.put(`/departments/${id}`, payload).then((res) => res.data);
export const deleteDepartment = (id) => api.delete(`/departments/${id}`).then((res) => res.data);
export const assignEmployees = (id, employees) =>
  api.put(`/departments/${id}/employees`, employees).then((res) => res.data);

export default {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignEmployees,
};
