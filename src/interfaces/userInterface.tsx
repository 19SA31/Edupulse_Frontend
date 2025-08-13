  import { ReactNode } from "react";
  
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
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  avatar:string;
  createdAt:string;
  isBlocked: boolean;
}

export interface SidebarItem {
  path: string;
  label: string;
  icon: ReactNode;
}

export interface TutorListingUser {
  tutorId: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  isListed: boolean;
}

export interface CourseListingUser {
  courseId: string;
  title: string;
  thumbnailImage?: string;
  categoryName: string;
  enrollmentCount: number;
  tutorName: string;
  price: number;
}

export interface CategoryListingUser {
  categoryId: string;
  name: string;
}

export interface UpdateProfileData {
  id?: string;
  name?: string;
  phone?: string;
  DOB?: string;
  gender?: string;
  avatar?: File;
  cropData?: CropData;
}

 export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

 export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      name: string;
      email: string;
      phone: string;
      DOB: string;
      gender: string;
      avatar: string;
    };
  };
}