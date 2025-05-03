import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/epulse.png";
import { toast } from "sonner"
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { logoutAdminAction } from "../../redux/actions/adminActions"; 
import { logout } from "../../redux/actions/userActions"; 
import { logoutTutorAction } from "../../redux/actions/tutorActions"; 

interface DashboardProps {
  role: "user" | "tutor" | "admin";
}

const DashboardLayout: React.FC<DashboardProps> = ({ role }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
if (storedUser && role !== "admin") {
  try {
    const user = JSON.parse(storedUser);
    setUserName(user?.name || null);
  } catch (error) {
    setUserName(null);
  }
}
  }, [role]);

  const handleLogout = async () => {
    try {
      if (role === "user") {
        await dispatch(logout()).unwrap();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login");
      } else if (role === "tutor") {
        await dispatch(logoutTutorAction()).unwrap();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("tutor");
        navigate("/tutor/login");
      } else if (role === "admin") {
        await dispatch(logoutAdminAction()).unwrap();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("admin");
        navigate("/admin/login");
      }
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
    
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <div className="bg-gray-800 p-10 rounded-3xl shadow-xl w-full max-w-md text-center">
        <img src={logo} alt="Logo" className="w-40 h-auto mb-6 mx-auto" />
        <h1 className="text-3xl font-semibold text-white mb-4">
          Welcome {role === "admin" ? "Admin" : userName || "User"}!
        </h1>
        <p className="text-lg text-gray-200 mb-6">
          `You are now logged as {role} to the dashboard. Feel free to explore.`
        </p>

        <button
          onClick={handleLogout}
          className="py-2 px-6 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardLayout;
