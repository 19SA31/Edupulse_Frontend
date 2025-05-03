import { userAxiosInstance } from "../api/userAxiosInstance";
import axios from "axios";

export const signUpService = async (
  name: string,
  email: string,
  phone: string,
  password: string
) =>{
  const response = await userAxiosInstance.post("/user/send-otp", {
    name,
    email,
    phone,
    password,
  });
  console.log("inside signup service")
  return response.data;
};

export const verifyOtpService = async (
  name: string,
  email: string,
  phone: string,
  password: string,
  otp: string
) => {
  const response = await userAxiosInstance.post("/user/verify-otp", {
    name,
    email,
    phone,
    password,
    otp,
  });
  return response.data;
};

export const forgotPasswordService = async (email: string, isForgot: boolean) => {
  const response = await userAxiosInstance.post("/user/send-otp", {
    email,
    isForgot,
  });
  return response.data;
};

export const verifyForgotOtpService = async (
  email: string,
  otp: string,
  isForgot: boolean
) => {
  const response = await userAxiosInstance.post("/user/verify-otp", {
    email,
    otp,
    isForgot,
  });
  return response.data;
};

export const loginService = async (email: string, password: string) => {
  const response = await userAxiosInstance.post("/user/login", {
    email,
    password,
  });
  console.log("inside login servicefor user: ",response.data)
  if (response.data.success) {
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

export const passwordChangeService = async (email: string, password: string) => {
  const response = await userAxiosInstance.patch("/user/reset-password", {
    email,
    password,
  });
  return response.data;
};

export const logoutUser = async () => {
  console.log("inside logout user service")
  const response = await userAxiosInstance.post("/user/logout");
  console.log("response",response)
  return response.data;
};
