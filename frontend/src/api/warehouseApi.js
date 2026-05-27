import axiosClient from "./axiosClient";

export const getWarehouses = () => axiosClient.get("/warehouses");

export const createWarehouse = (data) => axiosClient.post("/warehouses", data);

export const updateWarehouse = (id, data) =>
  axiosClient.put(`/warehouses/${id}`, data);

export const deleteWarehouse = (id) => axiosClient.delete(`/warehouses/${id}`);
