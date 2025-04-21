import { tutorAxiosInstance } from "../api/tutorAxiosInstance";
import axios from 'axios';

export const signUpService = (
  name: string,
  email: string,
  phone: string,
  password: string
) => {
  try {
    console.log("inside tutor signupservice", name, email, phone, password);
    const response = tutorAxiosInstance.post("/auth/send-otp", {
      name,
      email,
      phone,
      password,
    });
    return response;
  } catch (error) {
    console.log("Error in signupService: ", error);
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
    console.log("reached verifyOtpService");
    const response = await tutorAxiosInstance.post("/auth/verify-otp", {
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
    const response = await tutorAxiosInstance.post("/auth/send-otp", {
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
    const response = await tutorAxiosInstance.post("/auth/verify-otp", {
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
      const response = await tutorAxiosInstance.post("/auth/login", { email, password });
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
      const response = await tutorAxiosInstance.patch("/auth/reset-password", {
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
      const response = await tutorAxiosInstance.post("/auth/logout");
      console.log(response);
      return response.data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  };