import { ReactNode } from "react";

export interface Tutor {
  id?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  dob?: string;
  gender?: string;
  isBlocked?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface TutorSignup {
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

export interface TutorLogin {
  email: string;
  password: string;
}
export interface TutorState {
  tutorInfo: Tutor | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
export interface OtpResponse {
  message: string;
}

export interface TutorDetailsList {
  _id: string;
  name: string;
  email: string;
  designation: string;
  about: string;
  avatar?: string;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface UpdateProfileData {
  id?: string;
  name?: string;
  phone?: string;
  DOB?: string;
  designation?: string;
  about?: string;
  gender?: string;
  avatar?: File;
  cropData?: CropData;
}

export interface VerificationDocuments {
  avatar: File;
  degree: File;
  aadharFront: File;
  aadharBack: File;
  email?: string;
  phone?: string;
}