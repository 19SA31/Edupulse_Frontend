// import { userAxiosInstance } from "../api/userAxiosInstance";
import { createAxiosInstance } from "../api/axiosInstance";
import {
  TutorListingUser,
  CourseListingUser,
  CategoryListingUser,
  UpdateProfileData,
  CropData,
  ApiResponse,
  ProfileUpdateResponse,
} from "../interfaces/userInterface";
import { CourseDetails } from "../interfaces/courseInterface";
import { AxiosResponse } from "axios";
import { Course } from "../interfaces/courseInterface";

const userAxiosInstance = createAxiosInstance("user");

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

    if (response.data.success && response.data.data) {
      localStorage.setItem("userAccessToken", response.data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
};

export const logoutUser = async (): Promise<ApiResponse> => {
  try {
    const response = await userAxiosInstance.post("/logout");

    if (response.data.success) {
      localStorage.removeItem("userAccessToken");
      localStorage.removeItem("user");
    }

    return response.data;
  } catch (error: any) {
    localStorage.removeItem("userAccessToken");
    localStorage.removeItem("user");

    if (error.response?.data) return error.response.data;
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

export const updateUserProfile = async (
  profileData: UpdateProfileData
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userId = user?._id;

    if (!userId) {
      return {
        success: false,
        message: "User not found. Please login again.",
        data: null,
      };
    }

    const formData = new FormData();
    formData.append("id", userId);
    console.log("%%%", profileData);

    if (profileData.name?.trim())
      formData.append("name", profileData.name.trim());
    if (profileData.phone?.trim())
      formData.append("phone", profileData.phone.trim());
    if (profileData.DOB) formData.append("DOB", profileData.DOB);
    if (profileData.gender) formData.append("gender", profileData.gender);

    if (profileData.avatar) {
      formData.append("avatar", profileData.avatar);

      if (profileData.cropData) {
        formData.append("cropData", JSON.stringify(profileData.cropData));
      }
    }

    console.log("Sending profile update data:", {
      id: userId,
      name: profileData.name,
      phone: profileData.phone,
      DOB: profileData.DOB,
      gender: profileData.gender,
      hasAvatar: !!profileData.avatar,
      hasCropData: !!profileData.cropData,
      cropData: profileData.cropData,
    });

    const response = await userAxiosInstance.put(
      "/profile/update-profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      }
    );

    console.log("Profile update response:", response.data);

    if (!response.data.success) {
      return {
        success: false,
        message: response.data.message || "Failed to update profile",
        data: null,
      };
    }

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUserData =
      response.data.data?.user || response.data.user || {};

    const updatedUser = {
      ...currentUser,
      ...updatedUserData,

      avatar: updatedUserData.avatar || currentUser.avatar,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    console.log("Updated user data with S3 URL:", updatedUser);

    return {
      success: true,
      data: { user: updatedUser },
      message: response.data.message || "Profile updated successfully",
    };
  } catch (error: any) {
    console.error("Profile update error:", error);

    if (error.code === "ECONNABORTED") {
      return {
        success: false,
        message:
          "Request timeout. Please check your internet connection and try again.",
        data: null,
      };
    }

    if (error.response?.status === 413) {
      return {
        success: false,
        message: "File too large. Please select a smaller image.",
        data: null,
      };
    }

    if (error.response?.status === 400) {
      return {
        success: false,
        message: error.response.data?.message || "Invalid data provided",
        data: null,
      };
    }

    if (error.response?.status === 401) {
      return {
        success: false,
        message: "Session expired. Please login again.",
        data: null,
      };
    }

    return {
      success: false,
      message:
        error.response?.data?.message || "Network error. Please try again.",
      data: null,
    };
  }
};

export const getCurrentUserProfile = (): any | null => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error getting user profile from localStorage:", error);
    return null;
  }
};

export const updateUserInStorage = (userData: any): void => {
  try {
    const currentUser = getCurrentUserProfile() || {};
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  } catch (error) {
    console.error("Error updating user in localStorage:", error);
  }
};

export const clearUserData = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};

export const getAllListedTutors = async (): Promise<TutorListingUser[]> => {
  const response: AxiosResponse<TutorListingUser[]> =
    await userAxiosInstance.get("/listed-tutors");
  return response.data;
};

export const getAllListedCourses = async (): Promise<CourseListingUser[]> => {
  const response: AxiosResponse<CourseListingUser[]> =
    await userAxiosInstance.get("/listed-courses");
  return response.data;
};

export const getAllListedCategories = async (): Promise<
  CategoryListingUser[]
> => {
  const response: AxiosResponse<CategoryListingUser[]> =
    await userAxiosInstance.get("/listed-categories");
  return response.data;
};


export async function fetchCourseDetails(
  courseId: string
): Promise<CourseDetails> {
    const response = await userAxiosInstance.get(`/course-details/${courseId}`);
    console.log("fetchCourseDetails frnt serv",response.data)
    return response.data
}
