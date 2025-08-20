import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import CourseDetailsComponent from "../../components/user/CourseDetails";
import { Loader2, AlertCircle } from "lucide-react";
import { CourseDetails } from "../../interfaces/courseInterface";
import { fetchCourseDetails } from "../../services/userService";

function CourseDetailsPage() {
  const [courseData, setCourseData] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const getUserRole = (): "user" | "tutor" | "admin" | null => {
    if (localStorage.getItem("adminAccessToken")) return "admin";
    if (
      localStorage.getItem("tutorAccessToken") &&
      localStorage.getItem("tutor")
    )
      return "tutor";
    if (localStorage.getItem("userAccessToken") && localStorage.getItem("user"))
      return "user";
    return null;
  };

  const userRole = getUserRole();

  useEffect(() => {
    if (userRole !== "user") {
      navigate("/", { replace: true });
      return;
    }

    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { state } = location;
        const courseId = state?.id;

        if (!courseId) {
          setError(
            "Course ID not found. Please select a course from the listing."
          );
          return;
        }

        if (state?.courseDetails) {
          setCourseData(state.courseDetails);
        } else {
          const response = await fetchCourseDetails(courseId);

          if (response.success && response.data) {
            setCourseData(response.data);
          } else {
            setError(
              response.message ||
                "Failed to load course details. Please try again."
            );
          }
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError(
          "An error occurred while loading the course. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [location, navigate, userRole]);

  if (isLoading) {
    return (
      <div className="pt-14 min-h-screen bg-gray-50 flex items-center justify-center">
        <Header role={userRole || "user"} />
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading course details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-14">
        <Header role={userRole || "user"} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Course
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/course-listing")}
                className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Back to Courses
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="pt-14">
        <Header role={userRole || "user"} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <p className="text-gray-600">No course data available</p>
            <button
              onClick={() => navigate("/course-listing")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back to Courses
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pt-14">
      <Header role={userRole || "user"} />
      <CourseDetailsComponent courseData={courseData.data} />
      <Footer />
    </div>
  );
}

export default CourseDetailsPage;
