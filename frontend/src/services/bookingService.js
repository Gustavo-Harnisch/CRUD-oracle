import api from "./api";

export const fetchReservations = (params = {}) =>
  api.get("/reservations", { params }).then((res) => res.data);

export const createReservation = (payload) =>
  api.post("/reservations", payload).then((res) => res.data);

export const fetchReservationEvents = (reservationId) =>
  api.get(`/reservations/${reservationId}/events`).then((res) => res.data);

export const addReservationEvent = (reservationId, payload) =>
  api.post(`/reservations/${reservationId}/events`, payload).then((res) => res.data);

export default {
  fetchReservations,
  createReservation,
  fetchReservationEvents,
  addReservationEvent,
};
