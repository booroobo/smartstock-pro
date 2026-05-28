import axiosClient from "./axiosClient";

export const getUsers = () =>
  axiosClient.get("/users");

export const updateUserRole = (id, role) =>
  axiosClient.put(`/users/${id}/role`, { role });
