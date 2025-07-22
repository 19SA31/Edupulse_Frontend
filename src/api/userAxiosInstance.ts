import axios from "axios";
import { baseUrl } from "./baseUrl";



const url = `${baseUrl}/api/user`



export const userAxiosInstance = axios.create({
    baseURL:url,
    withCredentials:true,
    headers:{
        'Content-Type':'application/json'
    }
})

userAxiosInstance.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem("userAccessToken"); 
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    
    return Promise.reject(error);
  }
);


userAxiosInstance.interceptors.response.use(
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