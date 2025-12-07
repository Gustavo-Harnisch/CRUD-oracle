import api from "./api";

export const fetchRooms = () => api.get("/rooms").then((res) => res.data);

// Export default helpers if needed elsewhere
export const createRoom = (payload) =>
  api.post("/rooms", payload).then((res) => res.data);

export const updateRoom = (id, payload) =>
  api.put(`/rooms/${id}`, payload).then((res) => res.data);

export const deleteRoom = (id) =>
  api.delete(`/rooms/${id}`).then((res) => res.data);

export const changeRoomStatus = (id, estado) =>
  api.patch(`/rooms/${id}/status`, { estado }).then((res) => res.data);

export default {
  fetchRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  changeRoomStatus,
};
