import axiosClient from "./axiosClient";

export const getCriticalStockNotifications = () =>
  axiosClient.get("/notifications/critical-stock");
