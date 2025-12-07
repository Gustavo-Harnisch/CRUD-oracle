import api from "./api";

export const listEmployees = () => api.get("/employees").then((res) => res.data);
export const createEmployee = (payload) => api.post("/employees", payload).then((res) => res.data);
export const updateEmployee = (id, payload) => api.put(`/employees/${id}`, payload).then((res) => res.data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`).then((res) => res.data);

export default { listEmployees, createEmployee, updateEmployee, deleteEmployee };
