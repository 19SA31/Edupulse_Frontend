import { tutorAxiosInstance } from "../api/tutorAxiosInstance";

// Tutor Signup Service
export const tutorSignUpService = async (
  name: string,
  email: string,
  phone: string,
  password: string
) => {
  try {
    const response = await tutorAxiosInstance.post("/send-otp", {
      name,
      email,
      phone,
      password,
    });
    console.log("inside tutor signup service");
    return response.data;
  } catch (error: any) {
    // Return the error response data if available, otherwise throw
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// Tutor OTP Verification
export const tutorVerifyOtpService = async (
  name: string,
  email: string,
  phone: string,
  password: string,
  otp: string
) => {
  try {
    const response = await tutorAxiosInstance.post("/verify-otp", {
      name,
      email,
      phone,
      password,
      otp,
    });
    console.log("inside tutor verify OTP service");
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// Tutor Login
export const tutorLoginService = async (email: string, password: string) => {
  try {
    const response = await tutorAxiosInstance.post("/login", {
      email,
      password,
    });

    if (response.data.success && response.data.data) {
      // Updated to match the new controller response structure
      localStorage.setItem("accessToken", response.data.data.accessToken);
      localStorage.setItem("tutor", JSON.stringify(response.data.data.tutor));
    }

    console.log("inside tutor login service");
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// Tutor Logout
export const logoutTutor = async () => {
  try {
    const response = await tutorAxiosInstance.post("/logout");
    console.log("inside logout tutor service", response);
    
    // Clear localStorage on successful logout
    if (response.data.success) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tutor");
    }
    
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// Forgot Password - Send OTP
export const tutorForgotPasswordService = async (email: string, isForgot: boolean) => {
  try {
    const response = await tutorAxiosInstance.post("/send-otp", {
      email,
      isForgot,
    });
    console.log("inside tutor forgot password service");
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// Forgot Password - Verify OTP
export const tutorVerifyForgotOtpService = async (
  email: string,
  otp: string,
  isForgot: boolean
) => {
  try {
    const response = await tutorAxiosInstance.post("/verify-otp", {
      email,
      otp,
      isForgot,
    });
    console.log("tutorVerifyForgotOtpService:", response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// Reset Password
export const tutorPasswordChangeService = async (email: string, password: string) => {
  try {
    const response = await tutorAxiosInstance.patch("/reset-password", {
      email,
      password,
    });
    console.log("inside tutor password change service");
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};