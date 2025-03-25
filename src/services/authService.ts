import { userAxiosInstance } from "../api/userAxiosInstance";

export const signUpService = (
  name: string,
  email: string,
  phone: string,
  password: string
) => {
  try {
    console.log("inside signupservice", name, email, phone, password);
    const response = userAxiosInstance.post("/auth/send-otp", {
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
    const response = await userAxiosInstance.post("/auth/verify-otp", {
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
    const response = await userAxiosInstance.post("/auth/send-otp", {
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
    const response = await userAxiosInstance.post("/auth/verify-otp", {
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
    console.log("inside login service")
     const response = await userAxiosInstance.post("/auth/login", { email, password });
 
     if (response.data.success) {
       
       localStorage.setItem("accessToken", response.data.accessToken);
       localStorage.setItem("user", JSON.stringify(response.data.user)); 
     }
 
     return response.data;
   } catch (error: any) {
     console.error("Login failed:", error);
     throw new Error(error.response?.data?.message || "Login failed");
   }
 };
 

export const passwordChangeService = async (
  email: string,
  password: String
) => {
  try {
    console.log("reached password change service");
    const response = await userAxiosInstance.patch("/auth/reset-password", {
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
    const response = await userAxiosInstance.post("/auth/logout");
    console.log(response);
    return response.data;
  } catch (error: any) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
