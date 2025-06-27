import { adminAxiosInstance } from "../api/adminAxiosInstance";
import axios from "axios";

export const adminLoginService = async (email: string, password: string) => {
  const response = await adminAxiosInstance.post("/login", {
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
  
  const response = await adminAxiosInstance.post("/logout");
  return response.data;
};

export const getUsers = (page: number, search: string) => {
  return adminAxiosInstance.get("/users", {
    params: { page, limit: 7, search },
  });
};

export const listUnlistUser = (id: string) => {
  return adminAxiosInstance.put(`/listUnlistUser/${id}`);
};

export const getTutors = (page: number, search: string) => {
  return adminAxiosInstance.get("/tutors", {
    params: { page, limit: 7, search },
  });
};

export const listUnlistTutor = (id: string) => {
  return adminAxiosInstance.put(`/listUnlistTutor/${id}`);
};

export const getCategories = (page: number, search: string) => {
  return adminAxiosInstance.get("/category", {
    params: { page, limit: 10, search },
  });
};

export const addCategoryService = async (name: string, description: string) => {
  const response = await adminAxiosInstance.post("/add-category", {
    name,
    description,
  });

  return response.data;
};

export const toggleCategoryStatus = async (id: string) => {
  const response = await adminAxiosInstance.put(`/toggle-category/${id}`);
  return response.data;
};


export const updateCategoryService = async (
  id: string, 
  name: string, 
  description: string
) => {
  
  const response = await adminAxiosInstance.put(`/update-category/${id}`, {
    name,
    description,
  });
  return response.data;
};