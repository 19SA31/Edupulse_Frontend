import { tutorAxiosInstance } from "../api/tutorAxiosInstance";

interface VerificationDocuments {
  avatar: File,
  degree: File;
  aadharFront: File;
  aadharBack: File;
  email?: string;
  phone?: string;
}

// Tutor Signup Service
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
    // Return the error response data if available, otherwise throw
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// Tutor OTP Verification
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
    const response = await tutorAxiosInstance.post("/login", { email, password });

    const tutorData = response.data.data.tutor;
      console.log("Verification status:", tutorData.isVerified, tutorData.verificationStatus);

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

// Forgot Password - Send OTP
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

// Forgot Password - Verify OTP
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

// Reset Password
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

// Tutor Verification Service
export const tutorVerificationService = async (
  documents: VerificationDocuments
) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    console.log("inside verifytutor front service",documents)
    // Append files
    formData.append("avatar",documents.avatar)
    formData.append("degree", documents.degree);
    formData.append("aadharFront", documents.aadharFront);
    formData.append("aadharBack", documents.aadharBack);

    // Add tutor info from localStorage if not provided
    if (documents.email) {
      formData.append("email", documents.email);
    }
    if (documents.phone) {
      formData.append("phone", documents.phone);
    }

    // If email/phone not provided, get from localStorage
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

// Get verification status
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



// export const updateTutorProfile = async (profileData: UpdateProfileData) => {
//   try {
//     const formData = new FormData();

//     if (profileData.name) formData.append('name', profileData.name);
//     if (profileData.phone) formData.append('phone', profileData.phone);
//     if (profileData.DOB) formData.append('DOB', profileData.DOB);
//     if (profileData.gender) formData.append('gender', profileData.gender);
//     if (profileData.avatar) formData.append('avatar', profileData.avatar);

//     const response = await userAxiosInstance.put('/tutor/profile/update-profile', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });

//     if (response.data.success) {
//       // Update localStorage with new tutor data
//       const currentTutor = JSON.parse(localStorage.getItem('tutor') || '{}');
//       const updatedTutor = { ...currentTutor, ...response.data.tutor };
//       localStorage.setItem('tutor', JSON.stringify(updatedTutor));
//     }

//     return {
//       success: true,
//       data: response.data,
//       message: response.data.message || 'Profile updated successfully'
//     };
//   } catch (error: any) {
//     return {
//       success: false,
//       message: error.response?.data?.message || 'Failed to update profile',
//       data: null
//     };
//   }
// };
