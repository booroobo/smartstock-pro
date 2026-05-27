import axiosClient from "./axiosClient";

export const getProducts = () => axiosClient.get("/products");

export const createProduct = (data) =>
  axiosClient.post("/products", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateProduct = (id, data) =>
  axiosClient.post(`/products/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteProduct = (id) => axiosClient.delete(`/products/${id}`);
