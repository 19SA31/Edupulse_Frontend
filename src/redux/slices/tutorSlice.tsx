// redux/slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { tutorLogin, logoutTutorAction, tutorSignUp, tutorVerifyOtp } from "../actions/tutorActions";

interface TutorState {
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: TutorState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false
};

const tutorSlice = createSlice({
  name: "tutor",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(tutorSignUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(tutorSignUp.rejected, (state, action: PayloadAction<any>) => {
              state.loading = false;
              state.error = action.payload || "Signup failed";
            })

      .addCase(tutorVerifyOtp.fulfilled, (state, action: PayloadAction<any>) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })

      .addCase(tutorLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(tutorLogin.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(tutorLogin.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(logoutTutorAction.fulfilled, () => {
        return initialState
      });
  }
});

export const { clearError } = tutorSlice.actions;
export default tutorSlice.reducer;
