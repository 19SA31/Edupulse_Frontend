import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { passwordChangeService } from "../../services/authService";
import { tutorPasswordChangeService } from "../../services/tutorService";
import bg_img from "../../assets/ep-background.jpg";
import logo from "../../assets/epulse.png";

interface PasswordUpdateProps {
  role: "user" | "tutor"; 
}

const PasswordUpdateLayout: React.FC<PasswordUpdateProps> = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      if(role==="user"){
        try {
          console.log("password update:", email, values.password, role);
          const response = await passwordChangeService(email, values.password);
          console.log("Response:", response);
  
          if (response?.data?.success) {
            toast.success("Password updated successfully!");
            navigate("/login");
          }
        } catch (error) {
          toast.error("Failed to update password. Try again.");
        }
      }else if(role==="tutor"){
        try {
          console.log("password update:", email, values.password, role);
          const response = await tutorPasswordChangeService(email, values.password);
          console.log("Response:", response);
  
          if (response?.data?.success) {
            toast.success("Password updated successfully!");
            navigate("/tutor/login");
          }
        } catch (error) {
          toast.error("Failed to update password. Try again.");
        }
      }
      
    },
  });

  return (
    <div className="h-screen flex items-center justify-center bg-cover relative" style={{ backgroundImage: `url(${bg_img})` }}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 flex flex-col items-center w-full max-w-md bg-white/5 rounded-3xl border border-white/30 backdrop-blur-md p-10 shadow-lg">
        <img src={logo} alt="Logo" className="w-24 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white text-center">Reset Password</h2>
        <form onSubmit={formik.handleSubmit} className="w-full mt-4">
          <input
            type="password"
            name="password"
            placeholder="New Password"
            className="w-full h-14 text-lg text-center border border-white/30 rounded-xl bg-transparent text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={formik.values.password}
            onChange={formik.handleChange}
          />
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-sm mt-2">{formik.errors.password}</p>
          )}

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full h-14 mt-4 text-lg text-center border border-white/30 rounded-xl bg-transparent text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-2">{formik.errors.confirmPassword}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 mt-6 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition duration-200"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordUpdateLayout;
