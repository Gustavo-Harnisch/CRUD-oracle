import api from "./api";

const resource = "/usuarios";

export const getUsers = () => api.get(resource);

export const getUserById = (id) => api.get(`${resource}/${id}`);

export const createUser = (payload) => api.post(resource, payload);

export const updateUser = (id, payload) => api.put(`${resource}/${id}`, payload);

export const deleteUser = (id) => api.delete(`${resource}/${id}`);
