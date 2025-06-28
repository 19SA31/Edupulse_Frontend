import { userAxiosInstance } from "../api/userAxiosInstance";
import axios from "axios";

export const signUpService = async (
  name: string,
  email: string,
  phone: string,
  password: string
) => {
  try {
    const response = await userAxiosInstance.post("/send-otp", {
      name,
      email,
      phone,
      password,
    });
    console.log("inside signup service");
    return response.data;
  } catch (error: any) {
    // Return the error response data if available, otherwise throw
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const verifyOtpService = async (
  name: string,
  email: string,
  phone: string,
  password: string,
  otp: string
) => {
  try {
    const response = await userAxiosInstance.post("/verify-otp", {
      name,
      email,
      phone,
      password,
      otp,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const forgotPasswordService = async (email: string, isForgot: boolean) => {
  try {
    const response = await userAxiosInstance.post("/send-otp", {
      email,
      isForgot,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const verifyForgotOtpService = async (
  email: string,
  otp: string,
  isForgot: boolean
) => {
  try {
    const response = await userAxiosInstance.post("/verify-otp", {
      email,
      otp,
      isForgot,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const loginService = async (email: string, password: string) => {
  try {
    const response = await userAxiosInstance.post("/login", {
      email,
      password,
    });
    console.log("inside login service for user: ", response.data);
    
    // Handle successful login
    if (response.data.success && response.data.data) {
      localStorage.setItem("accessToken", response.data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const passwordChangeService = async (email: string, password: string) => {
  try {
    const response = await userAxiosInstance.patch("/reset-password", {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    console.log("inside logout user service");
    const response = await userAxiosInstance.post("/logout");
    console.log("response", response);
    
    // Clear local storage on successful logout
    if (response.data.success) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
    
    return response.data;
  } catch (error: any) {
    // Even if logout fails on server, clear local storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};