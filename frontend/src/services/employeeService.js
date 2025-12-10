import api from "./api";

export const listEmployees = () => api.get("/employees").then((res) => res.data);
export const listTeam = () => api.get("/employees/team").then((res) => res.data);
export const listDirectory = () => api.get("/employees/directory").then((res) => res.data);
export const fetchEmployeeDashboardStats = () =>
  api.get("/employee/dashboard-stats").then((res) => res.data);
export const createEmployee = (payload) => api.post("/employees", payload).then((res) => res.data);
export const updateEmployee = (id, payload) => api.put(`/employees/${id}`, payload).then((res) => res.data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`).then((res) => res.data);

export default {
  listEmployees,
  listTeam,
  listDirectory,
  fetchEmployeeDashboardStats,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
