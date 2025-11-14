import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserEnrollments,
  fetchCourseDetails,
} from "../../services/userService";
import { HiAcademicCap, HiUser, HiCurrencyRupee } from "react-icons/hi";

interface Course {
  id: string;
  courseId: string; 
  title: string;
  thumbnail: string;
  tutorName: string;
  price: number;
  progress: number;
  enrollmentDate: string;
  status: string;
}

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    thumbnailImage: string;
  };
  tutorId: {
    _id: string;
    name: string;
  };
  price: number;
  progress?: number;
  dateOfEnrollment: string;
  status: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function UserCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformEnrollmentToCourse = (enrollment: Enrollment): Course => {
    return {
      id: enrollment._id,
      courseId: enrollment.courseId?._id || "", 
      title: enrollment.courseId?.title || "Unknown Course",
      thumbnail:
        enrollment.courseId?.thumbnailImage || "/placeholder-course.jpg",
      tutorName: enrollment.tutorId?.name || "Unknown Tutor",
      price: enrollment.price,
      progress: enrollment.progress || 0,
      enrollmentDate: enrollment.dateOfEnrollment,
      status: enrollment.status,
    };
  };

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserEnrollments(currentPage, debouncedSearch);

      const apiData = response.data || {
        enrollments: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      const transformedCourses = apiData.enrollments.map(
        (enrollment: Enrollment) => {
          return transformEnrollmentToCourse(enrollment);
        }
      );

      setCourses(transformedCourses);

      if (apiData.pagination) {
        setTotalPages(apiData.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCourseClick = async (courseId: string) => {
    try {
      console.log("Fetching course details for:", courseId);
      setLoading(true);
      const courseDetails = await fetchCourseDetails(courseId);
      console.log("Course details:", courseDetails);
      navigate("/course-details", {
        state: {
          id: courseId,
          courseDetails,
        },
      });
    } catch (error) {
      console.error("Error fetching course details:", error);
      setError("Failed to load course details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Courses</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchCourses}
                className="text-sm text-red-800 underline mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 mt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600">View and track your enrolled courses.</p>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setCurrentPage(1)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <HiAcademicCap className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600">
            You haven't enrolled in any courses yet.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/400x300?text=Course+Image";
                    }}
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                    {course.title}
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <HiUser className="w-4 h-4 mr-2 text-blue-500" />
                      <span>{course.tutorName}</span>
                    </div>

                    <div className="flex items-center text-gray-600 text-sm">
                      <HiCurrencyRupee className="w-4 h-4 mr-2 text-green-500" />
                      <span className="font-semibold text-green-600">
                        ₹{course.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      Enrolled:{" "}
                      {new Date(course.enrollmentDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progress
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {course.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    className="mt-4 w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    onClick={() => handleCourseClick(course.courseId)}
                  >
                    Continue Learning
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(
                  1,
                  currentPage - Math.floor(maxVisiblePages / 2)
                );
                let endPage = Math.min(
                  totalPages,
                  startPage + maxVisiblePages - 1
                );

                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      className={`px-4 py-2 rounded-md font-medium ${
                        currentPage === 1
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </button>
                  );

                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis-start" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                }

                for (let page = startPage; page <= endPage; page++) {
                  pages.push(
                    <button
                      key={page}
                      className={`px-4 py-2 rounded-md font-medium ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                }

                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis-end" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }

                  pages.push(
                    <button
                      key={totalPages}
                      className={`px-4 py-2 rounded-md font-medium ${
                        currentPage === totalPages
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pages;
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UserCourses;
