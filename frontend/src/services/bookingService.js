import api from "./api";

export const fetchReservations = (params = {}) =>
  api.get("/reservations", { params }).then((res) => res.data);

export const createReservation = (payload) =>
  api.post("/reservations", payload).then((res) => res.data);

export const fetchReservationEvents = (reservationId) =>
  api.get(`/reservations/${reservationId}/events`).then((res) => res.data);

export const addReservationEvent = (reservationId, payload) =>
  api.post(`/reservations/${reservationId}/events`, payload).then((res) => res.data);

export const cancelReservation = (reservationId) =>
  api.post(`/reservations/${reservationId}/cancel`).then((res) => res.data);

export const fetchReservationServices = (reservationId) =>
  api.get(`/reservations/${reservationId}/services`).then((res) => res.data);

export const addReservationService = (reservationId, payload) =>
  api.post(`/reservations/${reservationId}/services`, payload).then((res) => res.data);

export const updateReservationService = (reservationId, itemId, payload) =>
  api.put(`/reservations/${reservationId}/services/${itemId}`, payload).then((res) => res.data);

export const cancelReservationService = (reservationId, itemId) =>
  api.delete(`/reservations/${reservationId}/services/${itemId}`).then((res) => res.data);

export const checkinReservation = (reservationId, payload) =>
  api.patch(`/reservations/${reservationId}/checkin`, payload).then((res) => res.data);

export const requestCheckout = (reservationId) =>
  api.post(`/reservations/${reservationId}/request-checkout`).then((res) => res.data);

export const checkoutReservation = (reservationId, payload) =>
  api.patch(`/reservations/${reservationId}/checkout`, payload).then((res) => res.data);

export default {
  fetchReservations,
  createReservation,
  fetchReservationEvents,
  addReservationEvent,
  cancelReservation,
  fetchReservationServices,
  addReservationService,
  updateReservationService,
  cancelReservationService,
  checkinReservation,
  requestCheckout,
  checkoutReservation,
};
