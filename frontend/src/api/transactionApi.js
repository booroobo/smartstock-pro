import axiosClient from "./axiosClient";

export const getTransactions = (params = {}) =>
  axiosClient.get("/stock-transactions", { params });

export const createTransaction = (data) =>
  axiosClient.post("/stock-transactions", data);

export const updateTransaction = (id, data) =>
  axiosClient.put(`/stock-transactions/${id}`, data);

export const deleteTransaction = (id) =>
  axiosClient.delete(`/stock-transactions/${id}`);
