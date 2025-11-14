
import axios, { AxiosInstance } from "axios";
import { baseUrl } from "./baseUrl";

type Role = "admin" | "tutor" | "user";

const roleToTokenKey: Record<Role, string> = {
  admin: "adminAccessToken",
  tutor: "tutorAccessToken",
  user: "userAccessToken",
};

const roleToRedirectPath: Record<Role, string> = {
  admin: "/admin/login",
  tutor: "/tutor/login",
  user: "/user/login",
};

export function createAxiosInstance(role: Role): AxiosInstance {
  const instance = axios.create({
    baseURL: `${baseUrl}/api/${role}`,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const tokenKey = roleToTokenKey[role];
      const token = localStorage.getItem(tokenKey);

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );


  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn("Unauthorized - Redirecting to login");
        window.location.href = roleToRedirectPath[role];
      }

      return Promise.reject(error);
    }
  );

  return instance;
}
