// redux/actions/userActions.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  signUpService,
  verifyOtpService,
  loginService,
  logoutUser,
} from "../../services/authService";
import {
  UserSignup,
  VerifyOtpArgs,
  UserLogin,
} from "../../interfaces/userInterface";

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
      console.log("inside user login action")
      const result = await loginService(email, password);
      console.log("loginaction:",result)
      if (result.success) {
        return result.data;
      } else if(!result.success) {
        return rejectWithValue(result.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Thunk error:", error);
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Unexpected error occurred."
      );
    }
  }
);

export const logout = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      console.log("inside logout useraction")
      const result = await logoutUser();
      console.log("logoutuser action",result)
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
