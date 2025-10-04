import { createAxiosInstance } from "../api/axiosInstance";
import {
  TutorListingUser,
  CourseListingUser,
  CategoryListingUser,
  UpdateProfileData,
  ApiResponse,
} from "../interfaces/userInterface";
import { CourseDetails } from "../interfaces/courseInterface";
import { AxiosResponse } from "axios";
import { CourseSearchParams } from "../interfaces/courseInterface";
import { EnrollmentData } from "../interfaces/enrollmentInterface";
import { loadStripe, Stripe } from "@stripe/stripe-js";
                                                          
const userAxiosInstance = createAxiosInstance("user");

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY || "";

    if (!publishableKey) {
      console.error(
        "Stripe publishable key not found. Make sure to set STRIPE_PUBLISHABLE_KEY in your .env file"
      );
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

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

export const getAllCourses = async (): Promise<CourseListingUser[]> => {
  const response: AxiosResponse<CourseListingUser[]> =
    await userAxiosInstance.get("/all-courses");
  return response.data;
};

export const getAllListedCourses = async (
  params?: CourseSearchParams
): Promise<{
  success: boolean;
  data: CourseListingUser[];
  message?: string;
}> => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.category && params.category !== "All classes") {
      queryParams.append("category", params.category);
    }
    if (params?.minPrice !== undefined) {
      queryParams.append("minPrice", params.minPrice.toString());
    }
    if (params?.maxPrice !== undefined) {
      queryParams.append("maxPrice", params.maxPrice.toString());
    }
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `/listed-courses?${queryString}`
      : "/listed-courses";

    const response: AxiosResponse<{
      success: boolean;
      data: CourseListingUser[];
      message?: string;
    }> = await userAxiosInstance.get(url);
    console.log("YYYY",response.data)
    return response.data;
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to fetch courses",
    };
  }
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
  return response.data;
}

export async function createPayment(enrollmentData: EnrollmentData) {
  try {
    const token = localStorage.getItem("userAccessToken");

    const response = await userAxiosInstance.post(
      "/create-payment",
      enrollmentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error("Failed to create payment intent");
    }

    return response.data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
}

export async function processStripePayment(sessionId: string) {
  try {
    const stripe = await getStripe();

    if (!stripe) {
      throw new Error("Stripe failed to initialize");
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: sessionId,
    });

    if (error) {
      console.error("Stripe redirect error:", error);
      throw new Error("Payment redirection failed");
    }
  } catch (error) {
    console.error("Stripe payment error:", error);
    throw error;
  }
}

export const verifyPayment = async (sessionId: string) => {
  try {
    const response = await userAxiosInstance.post(
      "/verify-payment",
      {
        sessionId,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userAccessToken")}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Payment verification failed:", error);
    throw error;
  }
};

export const verifyEnrollment = async (courseId: string) => {
  try {
    const response = await userAxiosInstance.get(
      `/verify-enrollment/${courseId}`
    );
    return response.data;
  } catch (error) {
    console.error("verifying enrollment failed:", error);
    throw error;
  }
};

export const getUserEnrollments = async (page: number, search: string = "") => {
  try {
    console.log(search)
    const response = await userAxiosInstance.get("/user-payments", {
      params: { page, limit: 10, search },
    });
    return response.data;
  } catch (error) {
    console.error("error in fetching user enrollments:", error);
    throw error;
  }
};

export const getEnrolledCourses = async ()=>{
  try {
    const response = await userAxiosInstance.get("/courses-enrolled")
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error("error in fetching enrolled courses:",error)
    throw error
  }
}


