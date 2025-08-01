import { tutorAxiosInstance } from "../api/tutorAxiosInstance";

interface CropData {
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
  gender?: string;
  avatar?: File;
  cropData?: CropData;
}

interface VerificationDocuments {
  avatar: File;
  degree: File;
  aadharFront: File;
  aadharBack: File;
  email?: string;
  phone?: string;
}

export const tutorSignUpService = async (
  name: string,
  email: string,
  phone: string,
  password: string
) => {
  try {
    const response = await tutorAxiosInstance.post("/send-otp", {
      name,
      email,
      phone,
      password,
    });
    console.log("inside tutor signup service");
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const tutorVerifyOtpService = async (
  name: string,
  email: string,
  phone: string,
  password: string,
  otp: string
) => {
  try {
    const response = await tutorAxiosInstance.post("/verify-otp", {
      name,
      email,
      phone,
      password,
      otp,
    });
    console.log("inside tutor verify OTP service");
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const tutorLoginService = async (email: string, password: string) => {
  try {
    const response = await tutorAxiosInstance.post("/login", {
      email,
      password,
    });

    const tutorData = response.data.data.tutor;
    console.log(
      "Verification status:",
      tutorData,
      tutorData.isVerified,
      tutorData.verificationStatus
    );

    if (response.data.success && response.data.data) {
      console.log("inside tutorloginservice", response.data.data.tutor);
      localStorage.setItem("tutorAccessToken", response.data.data.accessToken);
      localStorage.setItem("tutor", JSON.stringify(response.data.data.tutor));
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
};

export const logoutTutor = async () => {
  try {
    const response = await tutorAxiosInstance.post("/logout");
    console.log("inside logout tutor service", response);

    if (response.data.success) {
      localStorage.removeItem("tutorAccessToken");
      localStorage.removeItem("tutor");
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
};

export const tutorForgotPasswordService = async (
  email: string,
  isForgot: boolean
) => {
  try {
    const response = await tutorAxiosInstance.post("/send-otp", {
      email,
      isForgot,
    });
    console.log("inside tutor forgot password service");
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const tutorVerifyForgotOtpService = async (
  email: string,
  otp: string,
  isForgot: boolean
) => {
  try {
    const response = await tutorAxiosInstance.post("/verify-otp", {
      email,
      otp,
      isForgot,
    });
    console.log("tutorVerifyForgotOtpService:", response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const tutorPasswordChangeService = async (
  email: string,
  password: string
) => {
  try {
    const response = await tutorAxiosInstance.patch("/reset-password", {
      email,
      password,
    });
    console.log("inside tutor password change service");
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const tutorVerificationService = async (
  documents: VerificationDocuments
) => {
  try {
    const formData = new FormData();
    console.log("inside verifytutor front service", documents);

    formData.append("avatar", documents.avatar);
    formData.append("degree", documents.degree);
    formData.append("aadharFront", documents.aadharFront);
    formData.append("aadharBack", documents.aadharBack);

    if (documents.email) {
      formData.append("email", documents.email);
    }
    if (documents.phone) {
      formData.append("phone", documents.phone);
    }

    if (!documents.email || !documents.phone) {
      const tutorData = localStorage.getItem("tutor");
      if (tutorData) {
        const tutor = JSON.parse(tutorData);
        if (!documents.email && tutor.email) {
          formData.append("email", tutor.email);
        }
        if (!documents.phone && tutor.phone) {
          formData.append("phone", tutor.phone);
        }
      }
    }

    const response = await tutorAxiosInstance.post(
      "/verify-documents",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("inside tutor verification service");
    return response.data;
  } catch (error: any) {
    console.error("Tutor verification error:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const getTutorVerificationStatus = async () => {
  try {
    const response = await tutorAxiosInstance.get("/verification-status");
    console.log("inside get tutor verification status service");
    return response.data;
  } catch (error: any) {
    console.error("Get verification status error:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const updateTutorProfile = async (
  profileData: UpdateProfileData
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    const formData = new FormData();
    if (profileData.name) formData.append("name", profileData.name);
    if (profileData.phone) formData.append("phone", profileData.phone);
    if (profileData.DOB) formData.append("DOB", profileData.DOB);
    if (profileData.gender) formData.append("gender", profileData.gender);
    if (profileData.avatar) formData.append("avatar", profileData.avatar);

    const response = await tutorAxiosInstance.put(
      "/profile/update-profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, 
      }
    );

    console.log('Profile update response:', response.data);
    if (!response.data.success) {
      return {
        success: false,
        message: response.data.message || 'Failed to update profile',
        data: null
      };
    }

    const currentTutor = JSON.parse(localStorage.getItem('tutor') || '{}');
    const currentTutorData = response.data.data?.tutor || response.data.tutor || {};

    const updatedTutor = { 
      ...currentTutor, 
      ...currentTutorData,
   
      avatar: currentTutorData.avatar || currentTutor.avatar
    };

    localStorage.setItem('tutor', JSON.stringify(updatedTutor));
    console.log("Updated user data with S3 URL:", updatedTutor);
    
    return {
      success: true,
      data: { tutor: updatedTutor },
      message: response.data.message || 'Profile updated successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update profile",
      data: null,
    };
  }
};

export const getCurrentUserProfile = (): any | null => {
  try {
    const userStr = localStorage.getItem("tutor");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error getting tutor profile from localStorage:", error);
    return null;
  }
};

export const updateUserInStorage = (userData: any): void => {
  try {
    const currentUser = getCurrentUserProfile() || {};
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem("tutor", JSON.stringify(updatedUser));
  } catch (error) {
    console.error("Error updating tutor in localStorage:", error);
  }
};

export const clearUserData = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("tutor");
};
