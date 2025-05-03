import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "../../assets/epulse.png";
import bg_img from "../../assets/ep-background.jpg";
import { signUpService } from "../../services/authService";
import { tutorSignUpService } from "../../services/tutorService";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { signUp } from "../../redux/actions/userActions";
import { tutorSignUp } from "../../redux/actions/tutorActions";
import { useFormik } from "formik";
import * as Yup from "yup";


interface RegisterProps {
  role: "user" | "tutor";
}

function Register({ role }: RegisterProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Full Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phone: Yup.string()
        .matches(/^\d{10}$/, "Invalid phone number")
        .required("Phone number is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        if (role === "user") {
          const response = await dispatch(
            signUp({
              name: values.name,
              email: values.email,
              phone: values.phone,
              password: values.password,
            })
          );

          if (signUp.fulfilled.match(response)) {
            toast.success("Registration Successful! Please verify OTP.");
            navigate("/verify-otp", { state: values });
          } else {
            throw new Error(
              typeof response.payload === "string"
                ? response.payload
                : (response.payload as { message?: string })?.message ||
                  "Registration failed."
            );
          }
        } else if (role === "tutor") {
          const response = await dispatch(
            tutorSignUp({
              name: values.name,
              email: values.email,
              phone: values.phone,
              password: values.password,
            })
          );

          if (tutorSignUp.fulfilled.match(response)) {
            toast.success("Registration Successful! Please verify OTP.");
            navigate("/tutor/verify-otp", { state: values });
          } else {
            throw new Error(
              typeof response.payload === "string"
                ? response.payload
                : (response.payload as { message?: string })?.message ||
                  "Registration failed."
            );
          }
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || "Registration failed. Please try again.");
      }
    },
  });

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bg_img})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-4xl overflow-hidden bg-white/5 rounded-3xl border border-white/30 backdrop-blur-md">
        {/* Left Side - Welcome Section */}
        <div className="w-full lg:w-1/2 flex flex-col bg-black items-center justify-center p-10 bg-blend-saturation text-white">
          <img src={logo} alt="Logo" className="w-50 h-auto mb-6" />
          <h2 className="text-3xl font-bold text-center">
            Welcome to EduPulse!
          </h2>
          <p className="text-lg text-center mt-2">
            Create an account to start your journey with{" "}
            <span className="font-semibold">EduPulse</span>.
          </p>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 p-10 bg-transparent rounded-3xl">
          <h2 className="text-3xl font-semibold text-white mb-6 text-center lg:text-left">
            {role === "user" ? "User Registration" : "Tutor Registration"}
          </h2>
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Input Fields */}
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full px-4 py-3 text-white border border-white/30 bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-400">{formik.errors.name}</p>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full px-4 py-3 text-white border border-white/30 bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-400">{formik.errors.email}</p>
              )}

              <input
                type="number"
                name="phone"
                placeholder="Phone"
                className="w-full px-4 py-3 text-white border border-white/30 bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-400">{formik.errors.phone}</p>
              )}

              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full px-4 py-3 text-white border border-white/30 bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-400">{formik.errors.password}</p>
              )}

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="w-full px-4 py-3 text-white border border-white/30 bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="text-red-400">
                    {formik.errors.confirmPassword}
                  </p>
                )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
              disabled={formik.isSubmitting || !formik.isValid}
            >
              {formik.isSubmitting ? "Registering..." : "Register"}
            </button>
          </form>

          {role === "user" && (
            <>
              <p className="text-white mt-5 text-center">
                Already have an account?{" "}
                <span
                  className="text-blue-400 cursor-pointer hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Login
                </span>
              </p>
            </>
          )}

          {role === "tutor" && (
            <>
              <p className="text-white mt-5 text-center">
                Already have an account?{" "}
                <span
                  className="text-blue-400 cursor-pointer hover:underline"
                  onClick={() => navigate("/tutor/login")}
                >
                  Login
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
