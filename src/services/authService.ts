import { userAxiosInstance } from "../api/userAxiosInstance";
import axios from "axios";

// Profile update interface
export interface UpdateProfileData {
  id?:string
  name?: string;
  phone?: string;
  DOB?: string;
  gender?: string;
  avatar?: File;
}

// Response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface ProfileUpdateResponse {
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

// Authentication Services
export const signUpService = async (
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<ApiResponse> => {
  try {
    const response = await userAxiosInstance.post("/send-otp", {
      name,
      email,
      phone,
      password,
    });
    console.log("inside signup service");
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const verifyOtpService = async (
  name: string,
  email: string,
  phone: string,
  password: string,
  otp: string
): Promise<ApiResponse> => {
  try {
    const response = await userAxiosInstance.post("/verify-otp", {
      name,
      email,
      phone,
      password,
      otp,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const forgotPasswordService = async (
  email: string, 
  isForgot: boolean
): Promise<ApiResponse> => {
  try {
    const response = await userAxiosInstance.post("/send-otp", {
      email,
      isForgot,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const verifyForgotOtpService = async (
  email: string,
  otp: string,
  isForgot: boolean
): Promise<ApiResponse> => {
  try {
    const response = await userAxiosInstance.post("/verify-otp", {
      email,
      otp,
      isForgot,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const loginService = async (
  email: string, 
  password: string
): Promise<ApiResponse> => {
  try {
    const response = await userAxiosInstance.post("/login", {
      email,
      password,
    });
    console.log("inside login service for user: ", response.data);
    
    // Handle successful login
    if (response.data.success && response.data.data) {
      localStorage.setItem("accessToken", response.data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const passwordChangeService = async (
  email: string, 
  password: string
): Promise<ApiResponse> => {
  try {
    const response = await userAxiosInstance.patch("/reset-password", {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const logoutUser = async (): Promise<ApiResponse> => {
  try {
    console.log("inside logout user service");
    const response = await userAxiosInstance.post("/logout");
    console.log("response", response);
    
    // Clear local storage on successful logout
    if (response.data.success) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
    
    return response.data;
  } catch (error: any) {
    // Even if logout fails on server, clear local storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};


export const updateUserProfile = async (
  profileData: UpdateProfileData
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userId = user?.id;
    
    if (profileData.name && profileData.name.trim().length < 2) {
      return {
        success: false,
        message: 'Name must be at least 2 characters long',
        data: null
      };
    }

    if (profileData.phone && !/^[0-9]{10,15}$/.test(profileData.phone.replace(/\D/g, ''))) {
      return {
        success: false,
        message: 'Please enter a valid phone number',
        data: null
      };
    }

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('id', userId);
    if (profileData.name?.trim()) formData.append('name', profileData.name.trim());
    if (profileData.phone?.trim()) formData.append('phone', profileData.phone.trim());
    if (profileData.DOB) formData.append('DOB', profileData.DOB);
    if (profileData.gender) formData.append('gender', profileData.gender);
    if (profileData.avatar) formData.append('avatar', profileData.avatar);
    console.log(localStorage)
    // Log the data being sent (for debugging)
    console.log('Sending profile update data:', {
      id:userId,
      name: profileData.name,
      phone: profileData.phone,
      DOB: profileData.DOB,
      gender: profileData.gender,
      hasAvatar: !!profileData.avatar
    });

    const response = await userAxiosInstance.put('/profile/update-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout for file uploads
    });

    console.log('Profile update response:', response.data);

    if (response.data.success) {
      // Update localStorage with new user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUserData = response.data.data?.user || response.data.user || {};
      
      const updatedUser = { 
        ...currentUser, 
        ...updatedUserData,
        
        avatar: updatedUserData.avatar || currentUser.avatar
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log("inside uodate user updated user", updatedUser)
      return {
        success: true,
        data: { user: updatedUser },
        message: response.data.message || 'Profile updated successfully'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to update profile',
        data: null
      };
    }
  } catch (error: any) {
    console.error('Profile update error:', error);
    
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        message: 'Request timeout. Please check your internet connection and try again.',
        data: null
      };
    }
    
    if (error.response?.status === 413) {
      return {
        success: false,
        message: 'File too large. Please select a smaller image.',
        data: null
      };
    }
    
    if (error.response?.status === 400) {
      return {
        success: false,
        message: error.response.data?.message || 'Invalid data provided',
        data: null
      };
    }
    
    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Session expired. Please login again.',
        data: null
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.message || 'Network error. Please try again.',
      data: null
    };
  }
};

// Get current user profile
export const getCurrentUserProfile = (): any | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user profile from localStorage:', error);
    return null;
  }
};

// Update user in localStorage
export const updateUserInStorage = (userData: any): void => {
  try {
    const currentUser = getCurrentUserProfile() || {};
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  } catch (error) {
    console.error('Error updating user in localStorage:', error);
  }
};

// Clear user data
export const clearUserData = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};