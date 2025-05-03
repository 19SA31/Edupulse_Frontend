import { adminAxiosInstance } from "../api/adminAxiosInstance";
import axios from "axios";
 
export const adminLoginService = async (email: string, password: string) => {
  const response = await adminAxiosInstance.post("/admin/login", {
    email,
    password,
  });

  if (response.data.success) {
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("admin", JSON.stringify(response.data.admin));
  }

  return response.data;
};

export const logoutAdmin = async () => {
  const response = await adminAxiosInstance.post("/admin/logout");
  return response.data;
};