import api from "./api";

export const listPurchases = () => api.get("/purchases").then((res) => res.data);
export const getPurchase = (id) => api.get(`/purchases/${id}`).then((res) => res.data);
export const createPurchase = (payload) => api.post("/purchases", payload).then((res) => res.data);

export default { listPurchases, getPurchase, createPurchase };
