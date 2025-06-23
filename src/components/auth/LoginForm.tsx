import React from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/epulse.png";
import bg_img from "../../assets/ep-background.jpg";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { adminLogin } from "../../redux/actions/adminActions";
import { login } from "../../redux/actions/userActions";
import { tutorLogin } from "../../redux/actions/tutorActions";

interface LoginFormProps {
  role: "admin" | "tutor" | "user";
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ role, onLoginSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      if (role === "user") {
      

        dispatch(login({ email: values.email, password: values.password }))
          .unwrap()
          .then((data) => {
            console.log("Login successful data:", data);
            toast.success("User Login Successful!");
            onLoginSuccess();
            navigate("/");
          })
          .catch((error: any) => {
            
            const message =
              error ||
              "Login failed. Please check your credentials.";
            toast.error(message);
          });
      } else if (role === "tutor") {
        dispatch(tutorLogin({ email: values.email, password: values.password }))
          .unwrap()
          .then(() => {
            toast.success("Tutor Login Successful!");
            onLoginSuccess();
            navigate("/tutor/");
          })
          .catch((error: any) => {
            const message =
              error||
              "Login failed. Please check your credentials.";
            toast.error(message);
          });
      } else {
        dispatch(adminLogin({ email: values.email, password: values.password }))
          .unwrap()
          .then(() => {
            toast.success("Admin Login Successful!");
            onLoginSuccess();
            navigate("/admin/dashboard"); // Redirect after success
          })
          .catch((error: any) => {
            const message =
              error?.data?.message || error?.message || "Login failed.";
            toast.error(message);
          });
      }
    },
  });

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bg_img})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-4xl overflow-hidden bg-white/5 rounded-3xl border border-white/30 backdrop-blur-md">
        <div className="w-full lg:w-1/2 flex flex-col bg-black items-center justify-center p-10 text-white">
          <img src={logo} alt="Logo" className="w-50 h-auto mb-6" />
          <h2 className="text-3xl font-bold text-center">
            Welcome{" "}
            {role === "admin" ? "Admin" : role === "tutor" ? "Tutor" : "User"}!
          </h2>
          <p className="text-lg text-center mt-2">
            Log in to continue your journey with{" "}
            <span className="font-semibold">EduPulse</span>.
          </p>
        </div>

        <div className="w-full lg:w-1/2 p-10 bg-transparent rounded-3xl">
          <h2 className="text-3xl font-semibold text-white mb-6 text-center lg:text-left">
            Login
          </h2>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="email"
                className="w-full px-4 py-2 border border-white/30 rounded-lg bg-transparent text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-400 text-sm mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="current-password"
                className="w-full px-4 py-2 border border-white/30 rounded-lg bg-transparent text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-400 text-sm mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center text-sm text-white">
              <label className="flex items-center space-x-2"></label>
              {role === "user" && (
                <>
                  <Link
                    to="/forgot-password"
                    className="text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </>
              )}
              {role === "tutor" && (
                <>
                  <Link
                    to="/tutor/forgot-password"
                    className="text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
            >
              Login
            </button>

            <div className="text-center mt-4 text-white">
              Don't have an account?{" "}
              {role === "user" && (
                <Link to="/register" className="text-blue-400 hover:underline">
                  Sign up
                </Link>
              )}
              {role === "tutor" && (
                <Link
                  to="/tutor/register"
                  className="text-blue-400 hover:underline"
                >
                  Sign up
                </Link>
              )}
            </div>
            {role === "user" && (
              <>
                <div className="text-center mt-4 text-white">
                  Go to{" "}
                  <Link
                    to="/admin/login"
                    className="text-blue-400 hover:underline"
                  >
                    Admin
                  </Link>
                </div>
                <div className="text-center mt-4 text-white">
                  Go to{" "}
                  <Link
                    to="/tutor/login"
                    className="text-blue-400 hover:underline"
                  >
                    Tutor
                  </Link>
                </div>
              </>
            )}

            {role === "tutor" && (
              <>
                <div className="text-center mt-4 text-white">
                  Go to{" "}
                  <Link
                    to="/admin/login"
                    className="text-blue-400 hover:underline"
                  >
                    Admin
                  </Link>
                </div>
                <div className="text-center mt-4 text-white">
                  Go to{" "}
                  <Link to="/login" className="text-blue-400 hover:underline">
                    User
                  </Link>
                </div>
              </>
            )}

            {role === "admin" && (
              <>
                <div className="text-center mt-4 text-white">
                  Go to{" "}
                  <Link to="/login" className="text-blue-400 hover:underline">
                    User
                  </Link>
                </div>
                <div className="text-center mt-4 text-white">
                  Go to{" "}
                  <Link
                    to="/tutor/login"
                    className="text-blue-400 hover:underline"
                  >
                    Tutor
                  </Link>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
