import React from "react";
import { Routes, Route } from "react-router-dom";
import TutorLogin from "../pages/tutor/LoginPage";
import Register from "../pages/tutor/RegisterPage";
import VerifyOtp from "../pages/tutor/VerifyOtpPage";
import Dashboard from "../pages/tutor/DashboardPage";
import ForgotPassword from "../components/tutor/ForgotPassword";
import { Toaster } from "sonner";
import PasswordUpdate from "../components/tutor/PasswordUpdate";
import TutorLoginProtectRoute from "./ProtectedRoutes/TutorLoginProtectRoure";
import TutorProtectRoute from "./ProtectedRoutes/TutorProtectRoute";
import HomePage from "../pages/tutor/HomePage";

function TutorRoutes() {
  return (
    <div>
      <Toaster richColors position="top-center" />

      <Routes>
        {/* Public HomePage: decides what to show based on auth inside the component */}
        <Route path="" element={<HomePage />} />

        {/* Protected from already logged-in tutors */}
        <Route
          path="login"
          element={
            <TutorLoginProtectRoute>
              <TutorLogin />
            </TutorLoginProtectRoute>
          }
        />
        <Route
          path="register"
          element={
            <TutorLoginProtectRoute>
              <Register />
            </TutorLoginProtectRoute>
          }
        />
        <Route
          path="verify-otp"
          element={
            <TutorLoginProtectRoute>
              <VerifyOtp />
            </TutorLoginProtectRoute>
          }
        />

        {/* Protected for logged-in tutors only */}
        <Route
          path="dashboard"
          element={
            <TutorProtectRoute>
              <Dashboard />
            </TutorProtectRoute>
          }
        />

        {/* Public routes */}
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<PasswordUpdate />} />
      </Routes>
    </div>
  );
}

export default TutorRoutes;
