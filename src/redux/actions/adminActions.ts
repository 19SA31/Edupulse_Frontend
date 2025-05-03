import { createAsyncThunk } from "@reduxjs/toolkit";
import { adminLoginService, logoutAdmin } from "../../services/adminService";
import { Admin } from "../../interfaces/adminInterface";

export const adminLogin = createAsyncThunk(
  "admin/login",
  async ({ email, password }: Admin, { rejectWithValue }) => {
    try {
      const result = await adminLoginService(email, password);
      if (result.success) {
        return result.data; // Return the data if success is true
      } else {
        return rejectWithValue(result.message || "Login failed");
      }
    } catch (error: any) {
      return rejectWithValue("Unexpected error occurred.");
    }
  }
);

export const logoutAdminAction = createAsyncThunk(
  "admi/logout",
  async (_, { rejectWithValue }) => {
    try {
      const result = await logoutAdmin();
      if (result.success) {
        return result.data; // Return the data if success is true
      } else {
        return rejectWithValue(result.message || "Logout failed");
      }
    } catch (error: any) {
      return rejectWithValue("Unexpected error occurred.");
    }
  }
);
