import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TutorLogin from "../pages/tutor/LoginPage";
import Register from "../pages/tutor/RegisterPage";
import VerifyOtp from "../pages/tutor/VerifyOtpPage";
import ForgotPassword from "../components/tutor/ForgotPassword";
import { Toaster } from "sonner";
import PasswordUpdate from "../components/tutor/PasswordUpdate";
import TutorLoginProtectRoute from "./ProtectedRoutes/TutorLoginProtectRoure";
import TutorProtectRoute from "./ProtectedRoutes/TutorProtectRoute";
import HomePage from "../pages/tutor/HomePage";
import TutorLayoutPage from "../pages/tutor/TutorLayoutPage";
import ProfilePage from "../pages/tutor/ProfilePage";
import VerifyTutorPage from "../pages/tutor/VerifyTutorPage";
import AddCoursePage from "../pages/tutor/AddCoursePage";
import DashboardPage from "../pages/tutor/DashboardPage";
import CourseManagementPage from "../pages/tutor/CourseManagementPage";

function TutorRoutes() {
  return (
    <div>
      <Toaster richColors position="top-center" />

      <Routes>
        <Route path="" element={<HomePage />} />

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

        <Route
          path="verify-tutor"
          element={
            <TutorProtectRoute>
              <VerifyTutorPage />
            </TutorProtectRoute>
          }
        />

        <Route
          path="dashboard"
          element={
            <TutorProtectRoute>
              <TutorLayoutPage />
            </TutorProtectRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="add-course" element={<AddCoursePage />} />
          <Route path="course-management" element={<CourseManagementPage />} />
        </Route>

        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<PasswordUpdate />} />
      </Routes>
    </div>
  );
}

export default TutorRoutes;
