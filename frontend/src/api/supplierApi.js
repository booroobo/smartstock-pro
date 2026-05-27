import axiosClient from "./axiosClient";

export const getSuppliers = () => axiosClient.get("/suppliers");

export const createSupplier = (data) => axiosClient.post("/suppliers", data);

export const updateSupplier = (id, data) =>
  axiosClient.put(`/suppliers/${id}`, data);

export const deleteSupplier = (id) => axiosClient.delete(`/suppliers/${id}`);
