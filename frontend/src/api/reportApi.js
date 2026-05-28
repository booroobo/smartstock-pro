import axiosClient from "./axiosClient";

export const exportStockReport = (params = {}) =>
  axiosClient.get("/reports/export", { params, responseType: "blob" });

export const generateStockReport = () =>
  axiosClient.post("/reports/generate");

export const getReportJobs = (params = {}) =>
  axiosClient.get("/reports/jobs", { params });

export const downloadReportJob = (id) =>
  axiosClient.get(`/reports/jobs/${id}/download`, { responseType: "blob" });
