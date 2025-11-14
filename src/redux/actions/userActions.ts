import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  UserSignup,
  VerifyOtpArgs,
  UserLogin,
} from "../../interfaces/userInterface";

import {
  signUpService,
  verifyOtpService,
  loginService,
  logoutUser,
  googleUserAuthService,
} from "../../services/Authentication/AuthenticationService";

export const signUp = createAsyncThunk(
  "user/signUp",
  async ({ name, email, phone, password }: UserSignup, { rejectWithValue }) => {
    try {
      const result = await signUpService(name, email, phone, password);
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

export const verifyOtp = createAsyncThunk(
  "user/verifyOtp",
  async (
    { name, email, phone, password, otp }: VerifyOtpArgs,
    { rejectWithValue }
  ) => {
    try {
      const result = await verifyOtpService(name, email, phone, password, otp);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message || "OTP verification failed");
      }
    } catch (error: any) {
      return rejectWithValue("Unexpected error occurred.");
    }
  }
);

export const login = createAsyncThunk(
  "user/login",
  async ({ email, password }: UserLogin, { rejectWithValue }) => {
    try {
      const result = await loginService(email, password);

      if (result.success) {
        return result.data;
      } else if (!result.success) {
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

export const logout = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      const result = await logoutUser();

      if (result.success) {
        return result;
      } else {
        return rejectWithValue(result.message || "Logout failed");
      }
    } catch (error: any) {
      return rejectWithValue("Unexpected error occurred.");
    }
  }
);

export const googleLogin = createAsyncThunk(
  "user/googleLogin",
  async (credential: string, { rejectWithValue }) => {
    try {
      const result = await googleUserAuthService(credential);
      if (result.success  && result.data.user) {
        return { user: result.data.user, accessToken: result.data.accessToken }
      } else {
        return rejectWithValue(result.message || "Google login failed");
      }
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Unexpected error occurred."
      );
    }
  }
);
