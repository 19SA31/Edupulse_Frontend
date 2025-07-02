import { tutorAxiosInstance } from "../api/tutorAxiosInstance";

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

// Tutor Login
export const tutorLoginService = async (email: string, password: string) => {
  try {
    const response = await tutorAxiosInstance.post("/login", {
      email,
      password,
    });

    if (response.data.success && response.data.data) {
      // Updated to match the new controller response structure
      localStorage.setItem("accessToken", response.data.data.accessToken);
      localStorage.setItem("tutor", JSON.stringify(response.data.data.tutor));
    }

    console.log("inside tutor login service");
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// Tutor Logout
export const logoutTutor = async () => {
  try {
    const response = await tutorAxiosInstance.post("/logout");
    console.log("inside logout tutor service", response);
    
    // Clear localStorage on successful logout
    if (response.data.success) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tutor");
    }
    
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// Forgot Password - Send OTP
export const tutorForgotPasswordService = async (email: string, isForgot: boolean) => {
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
export const tutorPasswordChangeService = async (email: string, password: string) => {
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