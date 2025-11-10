// redux/slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  login,
  logout,
  signUp,
  verifyOtp,
  googleLogin,
} from "../actions/userActions";

interface UserState {
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "Signup failed";
      })

      .addCase(verifyOtp.fulfilled, (state, action: PayloadAction<any>) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(logout.fulfilled, () => {
        return initialState;
      })

      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
