import axios, { AxiosInstance } from "axios";
import { baseUrl } from "./baseUrl";
import { toast } from "sonner";
import { persistor } from "../redux/store";
import {Messages} from "../enums/messages"

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
        console.error("Unauthorized - Redirecting to login");
        handleLogout(role, Messages.SESSION_EXPIRED);
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

  persistor.purge();

  try {
    await axios.post(
      `${baseUrl}/api/${role}/logout`,
      {},
      { withCredentials: true }
    );
  } catch (err) {
    console.error("Failed to clear cookies on server", err);
  }

  let alertMessage = message;
  if (reason === "blocked") {
    alertMessage = Messages.ACCOUNT_BLOCKED
  } else if (reason === "not_found") {
    alertMessage = Messages.ACCOUNT_NOTFOUND;
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
