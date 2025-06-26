import { createAsyncThunk } from "@reduxjs/toolkit";
import { adminLoginService, logoutAdmin } from "../../services/adminService";
import { Admin } from "../../interfaces/adminInterface";

export const adminLogin = createAsyncThunk(
  "admin/login",
  async ({ email, password }: Admin, { rejectWithValue }) => {
    try {
      const result = await adminLoginService(email, password);
      if (result.success) {
        // Store admin data in localStorage (this is already done in your service)
        return result.data; 
      } else {
        return rejectWithValue(result.message || "Login failed");
      }
    } catch (error: any) {
      return rejectWithValue("Unexpected error occurred.");
    }
  }
);

export const logoutAdminAction = createAsyncThunk(
  "admin/logout",
  async (_, { rejectWithValue }) => {
    try {
      
      // Call the API logout endpoint
      const result = await logoutAdmin();
      
      // Regardless of API response, clear localStorage items
      localStorage.removeItem('accessToken');
      localStorage.removeItem('admin');
      
      if (result.success) {
        return result.data; 
      } else {
        return rejectWithValue(result.message || "Logout failed");
      }
    } catch (error: any) {
      // Even if there's an error, we should still clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('admin');
      
      return rejectWithValue("Unexpected error occurred during logout");
    }
  }
);