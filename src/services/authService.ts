import { userAxiosInstance } from "../api/userAxiosInstance";
import axios from 'axios';


export const signUpService = (
  name: string,
  email: string,
  phone: string,
  password: string
) => {
  try {
    console.log("inside signupservice", name, email, phone, password);
    const response = userAxiosInstance.post("/user/send-otp", {
      name,
      email,
      phone,
      password,
    });
    return response;
  } catch (error) {

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Signup failed";
      console.error("Signup Failed:", message);
      return { success: false, message };
    }

    console.log("Error in signupService: ", error);
    
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
    console.log("reached verifyOtpService");
    const response = await userAxiosInstance.post("/user/verify-otp", {
      name,
      email,
      phone,
      password,
      otp,
    });
    console.log("response: ", response);
    return response;
  } catch (error) {
    console.log("error in verifyOtpService: ", error);
  }
};

export const forgotPasswordService = async (
  email: string,
  isForgot: boolean
) => {
  try {
    console.log("reached createUserService");
    const response = await userAxiosInstance.post("/user/send-otp", {
      email,
      isForgot,
    });
    console.log("response: ", response);
    return response;
  } catch (error) {
    console.log("error in forgotPasswordService: ", error);
  }
};

export const verifyForgotOtpService = async (
  email: string,
  otp: string,
  isForgot: boolean
) => {
  try {
    console.log("reached verifyOtpService");
    const response = await userAxiosInstance.post("/user/verify-otp", {
      email,
      otp,
      isForgot,
    });
    console.log("response: ", response);
    return response
  } catch (error) {
    console.log("error in verifyOtpService: ", error);
  }
};

export const loginService = async (email: string, password: string) => {
   try {
    console.log("inside login service##")
     const response = await userAxiosInstance.post("/user/login", { email, password });
     console.log("response insie front login service",response)
     if (response.data.success) {
       
       localStorage.setItem("accessToken", response.data.accessToken);
       localStorage.setItem("user", JSON.stringify(response.data.user)); 
     }
 
     return response.data;
   }catch (error: unknown) {
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Login failed";
      console.error("Login failed:", message);
      return { success: false, message };
    }

    
    console.error("Unexpected error:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
 };
 

export const passwordChangeService = async (
  email: string,
  password: String
) => {
  try {
    console.log("reached password change service");
    const response = await userAxiosInstance.patch("/user/reset-password", {
      email,
      password,
    });
    console.log("passwordchangeservice response: ", response);
    return response;
  } catch (error) {
    console.log("error in passwordchange service:", error);
  }
};

export const logoutUser = async () => {
  try {
    const response = await userAxiosInstance.post("/user/logout");
    console.log(response);
    return response.data;
  } catch (error: any) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
