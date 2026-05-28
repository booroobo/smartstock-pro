import axiosClient from "./axiosClient";

export const uploadProductImport = (formData) =>
  axiosClient.post("/import/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getImportJobs = (params = {}) =>
  axiosClient.get("/import/jobs", { params });

export const getImportJob = (id) =>
  axiosClient.get(`/import/jobs/${id}`);
