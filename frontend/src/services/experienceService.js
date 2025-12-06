import api from "./api";

export const fetchExperiences = () => api.get("/experiences").then((res) => res.data);

export default {
  fetchExperiences,
};
