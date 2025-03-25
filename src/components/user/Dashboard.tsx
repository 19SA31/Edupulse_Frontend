import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/epulse.png"; 
import { logoutUser } from "../../services/authService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name);
    }
  }, []);

  const handleLogout = async () => {
    try {
      console.log("inside handlelogout")
      const response = await logoutUser(); 
      console.log(response)
      if (response ) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        console.error("Logout failed - Invalid response:", response);
        
      }
    } catch (error) {
      console.error("Logout failed:", error);

    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <div className="bg-gray-800 p-10 rounded-3xl shadow-xl w-full max-w-md text-center">
        <img src={logo} alt="Logo" className="w-40 h-auto mb-6 mx-auto" />
        <h1 className="text-3xl font-semibold text-white mb-4">Welcome {userName || "User"}!</h1>
        <p className="text-lg text-gray-200 mb-6">
          You are now logged in to the dashboard. Feel free to explore.
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

export default Dashboard;
