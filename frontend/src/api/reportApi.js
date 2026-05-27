import axiosClient from "./axiosClient";

export const exportStockReport = (params = {}) =>
  axiosClient.get("/reports/export", { params, responseType: "blob" });
