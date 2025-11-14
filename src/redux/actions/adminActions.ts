import { createAsyncThunk } from "@reduxjs/toolkit";
import { Admin } from "../../interfaces/adminInterface";
import { adminLoginService,logoutAdmin } from "../../services/Authentication/AuthenticationService";

export const adminLogin = createAsyncThunk(
  "admin/login",
  async ({ email, password }: Admin, { rejectWithValue }) => {
    try {
      const result = await adminLoginService(email, password);
      if (result.success) {
        
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
      console.log("inside front end logoutadminaction")
      
      const result = await logoutAdmin();
      
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('admin');
      
      if (result.success) {
        return result.data; 
      } else {
        return rejectWithValue(result.message || "Logout failed");
      }
    } catch (error: any) {
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('admin');
      
      return rejectWithValue("Unexpected error occurred during logout");
    }
  }
);