import axios, { AxiosInstance } from "axios";
import { baseUrl } from "./baseUrl";
import { toast } from "sonner";

type Role = "admin" | "tutor" | "user";

const roleToTokenKey: Record<Role, string> = {
  admin: "adminAccessToken",
  tutor: "tutorAccessToken",
  user: "userAccessToken",
};

const roleToRedirectPath: Record<Role, string> = {
  admin: "/admin/login",
  tutor: "/tutor/login",
  user: "/login",
};

const alertShownForSession = new Set<string>();

export function createAxiosInstance(role: Role): AxiosInstance {
  const instance = axios.create({
    baseURL: `${baseUrl}/api/${role}`,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const tokenKey = roleToTokenKey[role];
      const token = localStorage.getItem(tokenKey);

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const { response } = error;
      const status = response?.status;
      const data = response?.data;

      if (data?.shouldLogout) {
        handleLogout(role, data.message, data.reason);
        return Promise.reject(error);
      }

      if (status === 401) {
        console.warn("Unauthorized - Redirecting to login");
        handleLogout(role, "Session expired. Please login again.");
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

async function handleLogout(
  role: Role,
  message: string,
  reason?: string
): Promise<void> {
  const tokenKey = roleToTokenKey[role];
  const alertKey = `${role}-logout`;

  localStorage.removeItem(tokenKey);
  localStorage.removeItem(role);

  sessionStorage.clear();

  try {
    await axios.post(
      `${baseUrl}/api/${role}/logout`,
      {},
      { withCredentials: true }
    );
  } catch (err) {
    console.warn("Failed to clear cookies on server", err);
  }

  let alertMessage = message;
  if (reason === "blocked") {
    alertMessage =
      "Your account has been blocked by an administrator. Please contact support for assistance.";
  } else if (reason === "not_found") {
    alertMessage = "Your account was not found. It may have been deleted.";
  }

  if (!alertShownForSession.has(alertKey)) {
    alertShownForSession.add(alertKey);

    toast.error(alertMessage, { duration: 4000 });

    setTimeout(() => {
      redirectToLogin(role);
    }, 500);
  } else {
    redirectToLogin(role);
  }
}

function redirectToLogin(role: Role): void {
  window.location.href = roleToRedirectPath[role];
}

export function clearSessionAlerts(): void {
  alertShownForSession.clear();
}
