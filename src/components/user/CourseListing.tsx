import React, { useState, useEffect } from "react";
import { Search, Clock, Users, Star, Loader2, AlertCircle } from "lucide-react";
import {
  getAllListedTutors,
  getAllListedCourses,
  getAllListedCategories,
  fetchCourseDetails
} from "../../services/userService";
import {
  TutorListingUser,
  CourseListingUser,
  CategoryListingUser,
} from "../../interfaces/userInterface";
import { Link, useNavigate } from "react-router-dom";

const CourseListing = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All classes");
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<CourseListingUser[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tutors, setTutors] = useState<TutorListingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tutorsRes, coursesRes, categoriesRes] = await Promise.all([
          getAllListedTutors(),
          getAllListedCourses(),
          getAllListedCategories(),
        ]);

        if (coursesRes.success) {
          setCourses(coursesRes.data);
        }
        if (categoriesRes.success) {
          setCategories([
            "All classes",
            ...categoriesRes.data.map((cat: CategoryListingUser) => cat.name),
          ]);
        }
        if (tutorsRes.success) {
          setTutors(tutorsRes.data);
        }
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTutorInfo = (tutorName: string): TutorListingUser | undefined => {
    return tutors.find((tutor) => tutor.name === tutorName);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      selectedCategory === "All classes" ||
      course.categoryName === selectedCategory;

    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCourseClick = async (courseId: string) => {
    try {
      setLoading(true);
      const courseDetails = await fetchCourseDetails(courseId);
      navigate("/course-details", { 
        state: { 
          courseId, 
          courseDetails 
        } 
      });
    } catch (error) {
      console.error("Error fetching course details:", error);
      setError("Failed to load course details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const CourseCard = ({ course }: { course: CourseListingUser }) => {
    const tutor = getTutorInfo(course.tutorName);

    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div className="relative overflow-hidden">
          <img
            src={course.thumbnailImage}
            alt={course.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/api/placeholder/300/200";
            }}
          />
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
            {formatPrice(course.price)}
          </div>
          {course.categoryName && (
            <div className="absolute bottom-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-medium">
              {course.categoryName}
            </div>
          )}
        </div>

        <div
          className="p-4 cursor-pointer hover:bg-gray-800 transition-colors rounded-lg"
          onClick={() => handleCourseClick(course.courseId)}
        >
          <div className="flex items-center justify-between mb-2 text-sm text-white">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Users size={14} />
                {course.enrollmentCount} enrolled
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium"></span>
            </div>
          </div>

          <h3 className="font-semibold text-white mb-2 line-clamp-2 leading-tight group-hover:text-yellow-400 transition-colors">
            {course.title}
          </h3>

          <p className="text-sm text-gray-300 mb-3 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {tutor?.avatar && (
                <img
                  src={tutor.avatar}
                  alt={course.tutorName}
                  className="w-6 h-6 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              )}
              <span className="text-sm font-medium text-gray-200">
                {course.tutorName}
              </span>
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-2 h-2 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-600" />
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-r from-yellow-600 via-yellow-200 to-yellow-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            Discover Amazing Courses
          </h1>
          <p className="text-xl opacity-90 mb-8 text-black">
            Learn from verified experts and advance your skills
          </p>

          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black"
                size={20}
              />
              <input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border-gray-400 text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-black rounded-lg p-6 shadow-sm sticky top-4">
              <h3 className="font-semibold text-white mb-4">Categories</h3>
              <ul className="space-y-2">
                {categories.map((category, index) => (
                  <li key={index}>
                    <button
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                        selectedCategory === category
                          ? "bg-yellow-400 text-black font-medium"
                          : "text-white hover:bg-gray-800"
                      }`}
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-gray-200"></div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedCategory === "All classes"
                  ? "All Courses"
                  : `${selectedCategory} Courses`}
              </h2>
              <div className="w-16 h-1 bg-yellow-400 rounded"></div>
              {searchTerm && (
                <p className="text-gray-600 mt-2">
                  Showing results for "
                  <span className="font-medium">{searchTerm}</span>"
                </p>
              )}
            </div>

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.courseId} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? `No courses match "${searchTerm}" in ${
                        selectedCategory === "All classes"
                          ? "any category"
                          : selectedCategory
                      }`
                    : `No courses available in ${selectedCategory}`}
                </p>
                {(searchTerm || selectedCategory !== "All classes") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All classes");
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {tutors.length > 0 && (
              <div className="mt-16">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Featured Tutors
                  </h2>
                  <div className="w-16 h-1 bg-yellow-400 rounded"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {tutors.slice(0, 4).map((tutor) => (
                    <div
                      key={tutor.tutorId}
                      className="bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="text-center">
                        <div className="relative inline-block mb-4">
                          <img
                            src={tutor.avatar}
                            alt={tutor.name}
                            className="w-16 h-16 rounded-full object-cover mx-auto"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/api/placeholder/64/64";
                            }}
                          />
                          {tutor.isVerified && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                                </svg>
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-white mb-1">
                          {tutor.name}
                        </h4>
                        <p className="text-sm text-gray-200 mb-2">
                          {tutor.designation}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {tutor.about}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 pt-6"></div>
      <div className="mt-6 pt-6"></div>
      <div className="mt-6 pt-6"></div>
    </div>
  );
};

export default CourseListing;