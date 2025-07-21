// redux/actions/userActions.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  tutorSignUpService,
  tutorVerifyOtpService,
  tutorLoginService,
  logoutTutor,
} from "../../services/tutorService";
import {
  TutorSignup,
  VerifyOtpArgs,
  TutorLogin,
} from "../../interfaces/tutorInterface";

export const tutorSignUp = createAsyncThunk(
  "tutor/signUp",
  async (
    { name, email, phone, password }: TutorSignup,
    { rejectWithValue }
  ) => {
    try {
      const result = await tutorSignUpService(name, email, phone, password);
      if (result.success) {
        return result.data; 
      } else {
        return rejectWithValue(result.message || "Signup failed");
      }
    } catch (error: any) {
      return rejectWithValue("Unexpected error occurred.");
    }
  }
);

export const tutorVerifyOtp = createAsyncThunk(
  "tutor/verifyOtp",
  async (
    { name, email, phone, password, otp }: VerifyOtpArgs,
    { rejectWithValue }
  ) => {
    try {
      const result = await tutorVerifyOtpService(
        name,
        email,
        phone,
        password,
        otp
      );
      if (result.success) {
        return result.data; 
      } else {
        return rejectWithValue(result.message || "OTP Verification failed");
      }
    } catch (error: any) {
      return rejectWithValue("Unexpected error occurred.");
    }
  }
);

export const tutorLogin = createAsyncThunk(
  "tutor/login",
  async ({ email, password }: TutorLogin, { rejectWithValue }) => {
    try {
      const result = await tutorLoginService(email, password);
      if (result.success) {
        return result.data; 
      } else {
        return rejectWithValue(result.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Thunk error:", error);
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Unexpected error occurred."
      );
    }
  }
);

export const logoutTutorAction = createAsyncThunk(
  "tutor/logout",
  async (_, { rejectWithValue }) => {
    try {
      
      const result = await logoutTutor();
      
      if (result.success) {
        return result.data || result.message;
      } else {
        return rejectWithValue(result.message || "Logout failed");
      }
    } catch (error: any) {
      return rejectWithValue("Unexpected error occurred.");
    }
  }
);
