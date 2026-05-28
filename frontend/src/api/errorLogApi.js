import axiosClient from "./axiosClient";

export const getErrorLogs = (params = {}) =>
  axiosClient.get("/error-logs", { params });

export const getErrorLogSummary = () =>
  axiosClient.get("/error-logs/summary");
