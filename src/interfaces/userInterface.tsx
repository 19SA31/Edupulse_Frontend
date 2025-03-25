export interface User{
    id?: string
    name: string
    email: string
    phone: string
    password: string
    dob?: string
    gender?: string
    isBlocked?: boolean
}
export interface UserState{
    userInfo: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}
export interface OtpResponse {
    message: string;
  }