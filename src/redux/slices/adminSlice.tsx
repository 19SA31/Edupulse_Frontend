import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { adminLogin, logoutAdminAction } from "../actions/adminActions";
import { Admin } from "../../interfaces/adminInterface";

// Define the initial state for the admin slice
interface AdminState {
  admin: Admin | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  admin: null,
  loading: false,
  error: null,
};

// Create the slice
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Force logout - use this when you need to manually reset state
    forceLogout: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    // Handle login action
    builder.addCase(adminLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(adminLogin.fulfilled, (state, action: PayloadAction<Admin>) => {
      state.loading = false;
      state.admin = action.payload; // Set admin data on successful login
    });
    builder.addCase(adminLogin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string; // Set error message on failed login
    });

    // Handle logout action
    builder.addCase(logoutAdminAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    // IMPORTANT FIX: Return to initial state on both fulfilled and rejected
    builder.addCase(logoutAdminAction.fulfilled, () => {
      console.log("Logout fulfilled - resetting state to initial");
      return initialState; // Completely reset state
    });
    
    builder.addCase(logoutAdminAction.rejected, (state, action) => {
      console.log("Logout rejected - forcing reset anyway");
      // Even if the API call fails, we should still reset the admin state
      return {
        ...initialState,
        error: action.payload as string || "Logout encountered an error, but you've been logged out locally."
      };
    });
  },
});

// Export actions and reducers
export const { clearError, forceLogout } = adminSlice.actions;
export default adminSlice.reducer;