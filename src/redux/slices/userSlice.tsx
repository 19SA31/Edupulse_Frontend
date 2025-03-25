import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { User } from '../../interfaces/userInterface';

interface UserState {
  userInfo: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  userInfo: null,
  token: null,
  loading: false,
  error: null,
};


export const registerUser = createAsyncThunk<
  any, 
  User, 
  { rejectValue: { message: string } } 
>(
  'user/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/register', userData);
      return data;
    } catch (error: any) {
      return rejectWithValue({ message: error.response?.data?.message || 'Something went wrong' });
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser(state) {
      state.userInfo = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.token = action.payload.token; 
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload.message : 'Something went wrong';
      });
  },
});

export const { clearUser, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;
