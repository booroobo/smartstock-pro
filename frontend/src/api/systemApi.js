import axiosClient from "./axiosClient";

export const getHealth = () => axiosClient.get("/health");
