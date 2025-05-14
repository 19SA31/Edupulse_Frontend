export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  dob?: string;
  gender?: string;
  isBlocked?: boolean;
}

export interface UserSignup {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface VerifyOtpArgs {
  name: string;
  email: string;
  phone: string;
  password: string;
  otp: string;
}

export interface UserLogin {
  email: string;
  password: string;
}
export interface UserState {
  userInfo: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
export interface OtpResponse {
  message: string;
}

export interface UserDetails {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  isBlocked: boolean;
}
