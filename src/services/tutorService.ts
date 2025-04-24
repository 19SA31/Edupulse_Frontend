import { tutorAxiosInstance } from "../api/tutorAxiosInstance";
import axios from 'axios';

export const tutorSignUpService = (
  name: string,
  email: string,
  phone: string,
  password: string
) => {
  try {
    console.log("inside tutor signupservice", name, email, phone, password);
    const response = tutorAxiosInstance.post("/tutor/send-otp", {
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

export const tutorVerifyOtpService = async (
  name: string,
  email: string,
  phone: string,
  password: string,
  otp: string
) => {
  try {
    console.log("reached verifyOtpService");
    const response = await tutorAxiosInstance.post("/tutor/verify-otp", {
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

export const tutorForgotPasswordService = async (
  email: string,
  isForgot: boolean
) => {
  try {
    console.log("reached createTutorService");
    const response = await tutorAxiosInstance.post("/tutor/send-otp", {
      email,
      isForgot,
    });
    console.log("response: ", response);
    return response;
  } catch (error) {
    console.log("error in forgotPasswordService: ", error);
  }
};

export const tutorVerifyForgotOtpService = async (
  email: string,
  otp: string,
  isForgot: boolean
) => {
  try {
    console.log("reached verifyOtpService");
    const response = await tutorAxiosInstance.post("/tutor/verify-otp", {
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

export const tutorLoginService = async (email: string, password: string) => {
    try {
     console.log("inside login service##")
      const response = await tutorAxiosInstance.post("/tutor/login", { email, password });
      console.log("response insie front login service",response)
      if (response.data.success) {
        
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("tutor", JSON.stringify(response.data.tutor)); 
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

  export const tutorPasswordChangeService = async (
    email: string,
    password: String
  ) => {
    try {
      console.log("reached password change service");
      const response = await tutorAxiosInstance.patch("/tutor/reset-password", {
        email,
        password,
      });
      console.log("passwordchangeservice response: ", response);
      return response;
    } catch (error) {
      console.log("error in passwordchange service:", error);
    }
  };

  export const logoutTutor = async () => {
    try {
      const response = await tutorAxiosInstance.post("/tutor/logout");
      console.log(response);
      return response.data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  };