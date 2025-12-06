import api from "./api";

export const createReservation = (payload) => api.post("/reservas", payload);
export const payReservation = (id, payload) => api.post(`/reservas/${id}/pagar`, payload);
