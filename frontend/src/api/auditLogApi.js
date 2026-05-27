import axiosClient from "./axiosClient";

export const getAuditLogs = () => axiosClient.get("/audit-logs");
