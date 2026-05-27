import axiosClient from "./axiosClient";

export const getCategories = () => axiosClient.get("/product-categories");

export const createCategory = (data) =>
  axiosClient.post("/product-categories", data);

export const updateCategory = (id, data) =>
  axiosClient.put(`/product-categories/${id}`, data);

export const deleteCategory = (id) =>
  axiosClient.delete(`/product-categories/${id}`);
