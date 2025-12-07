import api from "./api";

export const fetchIncomeReport = (params = {}) =>
  api.get("/reports/ingresos", { params }).then((res) => res.data);

export const fetchExpenseReport = (params = {}) =>
  api.get("/reports/egresos", { params }).then((res) => res.data);

export const fetchBalanceReport = (params = {}) =>
  api.get("/reports/balance", { params }).then((res) => res.data);

export default {
  fetchIncomeReport,
  fetchExpenseReport,
  fetchBalanceReport,
};
