import { useState, useEffect } from "react";
import {
  Search,
  Users,
  Star,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  getAllListedTutors,
  getAllListedCourses,
  getAllListedCategories,
  fetchCourseDetails,
  getEnrolledCourses,
} from "../../services/userService";
import {
  TutorListingUser,
  CourseListingUser,
  CategoryListingUser,
} from "../../interfaces/userInterface";
import { Link, useNavigate } from "react-router-dom";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Enrollment {
  courseId: string;
  count: number;
}

interface EnrollmentResponse {
  enrollments: Enrollment[];
}

const CourseListing = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All classes");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [courses, setCourses] = useState<CourseListingUser[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tutors, setTutors] = useState<TutorListingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  type SortOption =
    | "title_asc"
    | "title_desc"
    | "price_asc"
    | "price_desc"
    | "category_asc"
    | "category_desc"
    | "enrollment_desc"
    | "";

  const [sortBy, setSortBy] = useState<SortOption>("");
  const [enrollmentCounts, setEnrollmentCounts] = useState<
    Record<string, number>
  >({});
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(
    new Set()
  );
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [tutorsRes, categoriesRes,  enrolledCoursesRes] =
          await Promise.all([
            getAllListedTutors(),
            getAllListedCategories(),
            getEnrolledCourses(),
          ]);

        if (categoriesRes.success) {
          setCategories([
            "All classes",
            ...categoriesRes.data.map((cat: CategoryListingUser) => cat.name),
          ]);
        }
        if (tutorsRes.success) {
          setTutors(tutorsRes.data);
        }

        if (enrolledCoursesRes.success) {
          const enrolledIds = new Set<string>(
            enrolledCoursesRes.data.map(
              (enrollment: { courseId: string }) => enrollment.courseId
            )
          );
          setEnrolledCourseIds(enrolledIds);
        }
      } catch (err) {
        setError("Failed to fetch initial data. Please try again later.");
        console.error("Error fetching initial data:", err);
      }
    };

    fetchInitialData();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesRes = await getAllListedCourses({
        search: debouncedSearchTerm,
        category: selectedCategory,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sortBy: sortBy || undefined,
      });

      if (coursesRes.success) {
        const coursesWithEnrollmentCounts = coursesRes.data.map(
          (course: CourseListingUser) => ({
            ...course,
            isEnrolled: enrolledCourseIds.has(course.courseId),
          })
        );

        setCourses(coursesWithEnrollmentCounts);
      }
    } catch (err) {
      setError("Failed to fetch courses. Please try again later.");
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [
    selectedCategory,
    debouncedSearchTerm,
    minPrice,
    maxPrice,
    sortBy,
    enrollmentCounts,
    enrolledCourseIds,
  ]);

  useEffect(() => {
    if (
      courses.length > 0 &&
      (Object.keys(enrollmentCounts).length > 0 || enrolledCourseIds.size > 0)
    ) {
      const updatedCourses = courses.map((course) => ({
        ...course,
        isEnrolled: enrolledCourseIds.has(course.courseId),
      }));
      setCourses(updatedCourses);
    }
  }, [enrollmentCounts, enrolledCourseIds]);

  const getTutorInfo = (tutorName: string): TutorListingUser | undefined => {
    return tutors.find((tutor) => tutor.name === tutorName);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCourseClick = async (id: string) => {
    try {
      setLoading(true);
      const courseDetails = await fetchCourseDetails(id);
      navigate("/course-details", {
        state: {
          id,
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

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All classes");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("");
  };

  const CourseCard = ({
    course,
  }: {
    course: CourseListingUser & { isEnrolled?: boolean };
  }) => {
    const tutor = getTutorInfo(course.tutorName);

    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div
          className="relative overflow-hidden"
          onClick={() => handleCourseClick(course.courseId)}
        >
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
            {course.isEnrolled ? (
              <span className="flex items-center gap-1">
                <CheckCircle size={12} className="text-yellow-400" />
                Paid
              </span>
            ) : (
              formatPrice(course.price)
            )}
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
                {course.enrollmentCount || 0} enrolled
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

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-600" />
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error && courses.length === 0) {
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

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="font-semibold text-white mb-4">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Min Price (₹)"
                      value={minPrice}
                      onChange={(e) =>
                        setMinPrice(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      min="0"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max Price (₹)"
                      value={maxPrice}
                      onChange={(e) =>
                        setMaxPrice(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      min="0"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors"
                  >
                    Clear Price Filter
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={clearAllFilters}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
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
                <p className="text-gray-400 mt-2">
                  Showing results for "
                  <span className="font-medium text-white">{searchTerm}</span>"
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <span className="text-white text-sm">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-2 rounded text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">Default</option>
                  <option value="title_asc">Title A-Z</option>
                  <option value="title_desc">Title Z-A</option>
                  <option value="price_asc">Price Low to High</option>
                  <option value="price_desc">Price High to Low</option>
                  <option value="enrollment_desc">Most Popular</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-sm">
                {loading && courses.length > 0 && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>{courses.length} courses found</span>
              </div>
            </div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.courseId} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No courses found
                </h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm
                    ? `No courses match "${searchTerm}"`
                    : `No courses available`}
                  {selectedCategory !== "All classes" &&
                    ` in ${selectedCategory}`}
                  {(minPrice || maxPrice) &&
                    ` within the specified price range`}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded font-medium transition-colors"
                >
                  Clear All Filters
                </button>
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
                        <p className="text-xs text-gray-400 line-clamp-2">
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
