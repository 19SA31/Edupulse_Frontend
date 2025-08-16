import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import CourseListing from "../../components/user/CourseListing"; 
import { Loader2, AlertCircle } from "lucide-react";

function CourseListingPage() {
  const [userRole, setUserRole] = useState<"user" | "tutor" | "admin" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = () => {
      const adminToken = localStorage.getItem("adminAccessToken");
      if (adminToken) {
        setUserRole("admin");
        setIsLoading(false);
        return;
      }

      const tutorToken = localStorage.getItem("tutorAccessToken");
      const tutorData = localStorage.getItem("tutor");
      if (tutorToken && tutorData) {
        setUserRole("tutor");
        setIsLoading(false);
        return;
      }

      const userToken = localStorage.getItem("userAccessToken");
      const userData = localStorage.getItem("user");
      if (userToken && userData) {
        setUserRole("user");
        setIsLoading(false);
        return;
      }

      setUserRole(null);
      setIsLoading(false);
    };

    checkUserRole();

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "user" ||
        e.key === "tutor" ||
        e.key === "userAccessToken" ||
        e.key === "tutorAccessToken" ||
        e.key === "adminAccessToken"
      ) {
        checkUserRole();
      }
    };

    const handleCustomStorageChange = () => {
      checkUserRole();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userProfileUpdated", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "userProfileUpdated",
        handleCustomStorageChange
      );
    };
  }, []);

  useEffect(() => {
    if (!isLoading && userRole === null) {
      navigate("/login");
    } else if (!isLoading && userRole !== "user") {
      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "tutor") {
        navigate("/tutor/dashboard");
      }
    }
  }, [userRole, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (userRole !== "user") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            Course listings are only available to registered users. Please log in with a user account to view courses.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Login as User
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (userRole === null) {
    return null;
  }

  return (
    <div className="pt-14">
      <Header role={userRole} />
      <CourseListing />
      <Footer />
    </div>
  );
}

export default CourseListingPage;