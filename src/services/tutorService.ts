import { tutorAxiosInstance } from "../api/tutorAxiosInstance";

// Tutor Signup Service
export const tutorSignUpService = async (
  name: string,
  email: string,
  phone: string,
  password: string
) => {
  const response = await tutorAxiosInstance.post("/tutor/send-otp", {
    name,
    email,
    phone,
    password,
  });
  return response.data;
};

// Tutor OTP Verification
export const tutorVerifyOtpService = async (
  name: string,
  email: string,
  phone: string,
  password: string,
  otp: string
) => {
  const response = await tutorAxiosInstance.post("/tutor/verify-otp", {
    name,
    email,
    phone,
    password,
    otp,
  });
  return response.data;
};

// Tutor Login
export const tutorLoginService = async (email: string, password: string) => {
  const response = await tutorAxiosInstance.post("/tutor/login", {
    email,
    password,
  });

  if (response.data.success) {
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("tutor", JSON.stringify(response.data.tutor));
  }

  return response.data;
};

// Tutor Logout
export const logoutTutor = async () => {
  const response = await tutorAxiosInstance.post("/tutor/logout");
  return response.data;
};

// Forgot Password - Send OTP
export const tutorForgotPasswordService = async (email: string, isForgot: boolean) => {
  const response = await tutorAxiosInstance.post("/tutor/send-otp", {
    email,
    isForgot,
  });
  return response.data;
};

// Forgot Password - Verify OTP
export const tutorVerifyForgotOtpService = async (
  email: string,
  otp: string,
  isForgot: boolean
) => {
  const response = await tutorAxiosInstance.post("/tutor/verify-otp", {
    email,
    otp,
    isForgot,
  });
  return response.data;
};

// Reset Password
export const tutorPasswordChangeService = async (email: string, password: string) => {
  const response = await tutorAxiosInstance.patch("/tutor/reset-password", {
    email,
    password,
  });
  return response.data;
};
