import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { adminLogin, logoutAdminAction } from "../actions/adminActions";
import { Admin } from "../../interfaces/adminInterface";

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

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    forceLogout: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(adminLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      adminLogin.fulfilled,
      (state, action: PayloadAction<Admin>) => {
        state.loading = false;
        state.admin = action.payload;
      }
    );
    builder.addCase(adminLogin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(logoutAdminAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(logoutAdminAction.fulfilled, () => {
      return initialState;
    });

    builder.addCase(logoutAdminAction.rejected, (state, action) => {
      return {
        ...initialState,
        error:
          (action.payload as string) ||
          "Logout encountered an error, but you've been logged out locally.",
      };
    });
  },
});

export const { clearError, forceLogout } = adminSlice.actions;
export default adminSlice.reducer;
