import axios from "axios";
import { baseUrl } from "./baseUrl";



const url = `${baseUrl}/api/tutor`



export const tutorAxiosInstance = axios.create({
    baseURL:url,
    withCredentials:true,
    headers:{
        'Content-Type':'application/json'
    }
})

tutorAxiosInstance.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem("tutorAccessToken"); 
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    
    return Promise.reject(error);
  }
);


tutorAxiosInstance.interceptors.response.use(
  (response) => {
    
    return response;
  },
  (error) => {
    
    if (error.response?.status === 401) {
      console.warn("Unauthorized - Redirecting to login");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);