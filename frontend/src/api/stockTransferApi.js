import axiosClient from "./axiosClient";

export const getStockTransfers = (params = {}) =>
  axiosClient.get("/stock-transfers", { params });

export const createStockTransfer = (data) =>
  axiosClient.post("/stock-transfers", data);

export const getStockTransfer = (id) =>
  axiosClient.get(`/stock-transfers/${id}`);
