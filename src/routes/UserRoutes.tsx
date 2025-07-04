import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/user/LoginPage";
import Register from "../pages/user/RegisterPage";
import VerifyOtp from "../pages/user/VerifyOtpPage";

import ForgotPassword from "../components/user/ForgotPassword";
import PasswordUpdate from "../components/user/PasswordUpdate";
import HomePage from "../pages/user/HomePage";
import UserLoginProtectRoute from "./ProtectedRoutes/UserLoginProtectedRoute";
import UserProtectRoute from "./ProtectedRoutes/UserProtectRoute";
import { Toaster } from "sonner";
import UserLayoutPage from "../pages/user/UserLayoutPage";
import DashboardPage from "../pages/user/DashboardPage";

function UserRoutes() {
  return (
    <div>
      <Toaster richColors position="top-center" />

      <Routes>
        <Route path="" element={<HomePage />} />

        <Route
          path="login"
          element={
            <UserLoginProtectRoute>
              <Login />
            </UserLoginProtectRoute>
          }
        />

        <Route
          path="register"
          element={
            <UserLoginProtectRoute>
              <Register />
            </UserLoginProtectRoute>
          }
        />

        <Route
          path="verify-otp"
          element={
            <UserLoginProtectRoute>
              <VerifyOtp />
            </UserLoginProtectRoute>
          }
        />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<PasswordUpdate />} />

        <Route
          path="profile"
          element={
            <UserProtectRoute>
              <UserLayoutPage />
            </UserProtectRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default UserRoutes;
