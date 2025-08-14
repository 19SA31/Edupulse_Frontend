import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import CourseListing from "../../components/user/CourseListing"; 
import { Loader2 } from "lucide-react";

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
