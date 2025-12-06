import api from "./api";

export const fetchRooms = () => api.get("/rooms").then((res) => res.data);

// Export default helpers if needed elsewhere
export default {
  fetchRooms,
};
