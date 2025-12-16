import api from "./api";

export const listRegions = () => api.get("/geo/regions").then((res) => res.data);
export const listCitiesByRegion = (regionId) =>
  api.get(`/geo/regions/${regionId}/cities`).then((res) => res.data);

export default {
  listRegions,
  listCitiesByRegion,
};
