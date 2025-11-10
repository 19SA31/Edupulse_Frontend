import { createAxiosInstance } from "../../api/axiosInstance";

const adminAxiosInstance = createAxiosInstance("admin");
const tutorAxiosInstance = createAxiosInstance("tutor");
const userAxiosInstance = createAxiosInstance("user");

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class TokenManager {
  private static readonly TOKEN_KEYS = {
    admin: "adminAccessToken",
    tutor: "tutorAccessToken",
    user: "userAccessToken",
  } as const;

  private static readonly USER_DATA_KEYS = {
    tutor: "tutor",
    user: "user",
  } as const;

  static setTokens(
    role: "admin" | "tutor" | "user",
    accessToken: string,
    userData?: any
  ) {
    localStorage.setItem(this.TOKEN_KEYS[role], accessToken);

    if (userData && role !== "admin") {
      localStorage.setItem(
        this.USER_DATA_KEYS[role as "tutor" | "user"],
        JSON.stringify(userData)
      );
    }
  }

  static clearTokens(role: "admin" | "tutor" | "user") {
    localStorage.removeItem(this.TOKEN_KEYS[role]);

    if (role !== "admin") {
      localStorage.removeItem(this.USER_DATA_KEYS[role as "tutor" | "user"]);
    }
  }

  static getToken(role: "admin" | "tutor" | "user"): string | null {
    return localStorage.getItem(this.TOKEN_KEYS[role]);
  }
}

const createLoginService =
  (instance: typeof adminAxiosInstance, role: "admin" | "tutor" | "user") =>
  async (email: string, password: string): Promise<ApiResponse> => {
    try {
      const response = await instance.post("/login", { email, password });

      if (response.data.success && response.data.data) {
        const { accessToken } = response.data.data;
        const userData = role === "admin" ? null : response.data.data[role];

        TokenManager.setTokens(role, accessToken, userData);

        if (role === "tutor" && userData) {
          console.log(
            "Verification status:",
            userData,
            userData.isVerified,
            userData.verificationStatus
          );
        }
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data) return error.response.data;
      throw error;
    }
  };

export const googleUserAuthService = async (
  credential: string
): Promise<ApiResponse> => {
  try {
    const response = await userAxiosInstance.post("/google-auth", {
      credential,
    });

    if (response.data.success && response.data.data) {
      const { accessToken, user } = response.data.data;

      console.log("555",user)
      TokenManager.setTokens("user", accessToken, user);
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
};

export const googleTutorAuthService = async (
  credential: string
): Promise<ApiResponse> => {
  try {
    const response = await tutorAxiosInstance.post("/google-auth", {
      credential,
    });

    if (response.data.success && response.data.data) {
      const { accessToken, tutor } = response.data.data;
      TokenManager.setTokens("tutor", accessToken, tutor);
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
};

export const adminLoginService = createLoginService(
  adminAxiosInstance,
  "admin"
);
export const tutorLoginService = createLoginService(
  tutorAxiosInstance,
  "tutor"
);
export const loginService = createLoginService(userAxiosInstance, "user");

const createLogoutService =
  (instance: typeof adminAxiosInstance, role: "admin" | "tutor" | "user") =>
  async (): Promise<ApiResponse> => {
    try {
      const response = await instance.post("/logout");

      if (response.data.success) {
        TokenManager.clearTokens(role);
      }

      return response.data;
    } catch (error: any) {
      TokenManager.clearTokens(role);

      if (error.response?.data) return error.response.data;
      throw error;
    }
  };

export const logoutAdmin = createLogoutService(adminAxiosInstance, "admin");
export const logoutTutor = createLogoutService(tutorAxiosInstance, "tutor");
export const logoutUser = createLogoutService(userAxiosInstance, "user");

const createSignUpService =
  (instance: typeof userAxiosInstance) =>
  async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<ApiResponse> => {
    try {
      const response = await instance.post("/send-otp", {
        name,
        email,
        phone,
        password,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) return error.response.data;
      throw error;
    }
  };

export const signUpService = createSignUpService(userAxiosInstance);
export const tutorSignUpService = createSignUpService(tutorAxiosInstance);

const createVerifyOtpService =
  (instance: typeof userAxiosInstance) =>
  async (
    name: string,
    email: string,
    phone: string,
    password: string,
    otp: string
  ): Promise<ApiResponse> => {
    try {
      const response = await instance.post("/verify-otp", {
        name,
        email,
        phone,
        password,
        otp,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) return error.response.data;
      throw error;
    }
  };

export const verifyOtpService = createVerifyOtpService(userAxiosInstance);
export const tutorVerifyOtpService = createVerifyOtpService(tutorAxiosInstance);

const createForgotPasswordService =
  (instance: typeof userAxiosInstance) =>
  async (email: string, isForgot: boolean = true): Promise<ApiResponse> => {
    try {
      const response = await instance.post("/send-otp", {
        email,
        isForgot,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) return error.response.data;
      throw error;
    }
  };

export const forgotPasswordService =
  createForgotPasswordService(userAxiosInstance);
export const tutorForgotPasswordService =
  createForgotPasswordService(tutorAxiosInstance);

const createVerifyForgotOtpService =
  (instance: typeof userAxiosInstance) =>
  async (
    email: string,
    otp: string,
    isForgot: boolean = true
  ): Promise<ApiResponse> => {
    try {
      const response = await instance.post("/verify-otp", {
        email,
        otp,
        isForgot,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) return error.response.data;
      throw error;
    }
  };

export const verifyForgotOtpService =
  createVerifyForgotOtpService(userAxiosInstance);
export const tutorVerifyForgotOtpService =
  createVerifyForgotOtpService(tutorAxiosInstance);

const createPasswordChangeService =
  (instance: typeof userAxiosInstance) =>
  async (email: string, password: string): Promise<ApiResponse> => {
    try {
      const response = await instance.patch("/reset-password", {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) return error.response.data;
      throw error;
    }
  };

export const passwordChangeService =
  createPasswordChangeService(userAxiosInstance);
export const tutorPasswordChangeService =
  createPasswordChangeService(tutorAxiosInstance);

export const AuthUtils = {
  isAuthenticated: (role: "admin" | "tutor" | "user"): boolean => {
    return !!TokenManager.getToken(role);
  },

  getUserData: (role: "tutor" | "user"): any | null => {
    const userData = localStorage.getItem(role);
    return userData ? JSON.parse(userData) : null;
  },

  clearAllAuthData: (): void => {
    TokenManager.clearTokens("admin");
    TokenManager.clearTokens("tutor");
    TokenManager.clearTokens("user");
  },
};
