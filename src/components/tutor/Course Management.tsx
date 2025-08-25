import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Users,
  DollarSign,
  Calendar,
  Eye,
  Search,
} from "lucide-react";
import { getAllCoursesTutor } from "../../services/tutorService"; 

interface TutorDetailsDto {
  _id: string;
  name: string;
  email: string;
  designation: string;
  about: string;
  avatar?: string;
}

interface CategoryDetailsDto {
  _id: string;
  name: string;
  description: string;
}

interface DocumentFileDto {
  _id: string;
  fileName: string;
  signedUrl: string;
  originalName: string;
}

interface VideoFileDto {
  _id: string;
  fileName: string;
  signedUrl: string;
  originalName: string;
}

interface LessonDetailsDto {
  _id: string;
  title: string;
  description: string;
  documents: DocumentFileDto[];
  videos: VideoFileDto[];
  order: number;
}

interface ChapterDetailsDto {
  _id: string;
  title: string;
  description: string;
  lessons: LessonDetailsDto[];
  order: number;
}

interface CourseDetailsDto {
  _id: string;
  title: string;
  description: string;
  benefits: string;
  requirements: string;
  category: CategoryDetailsDto;
  tutor: TutorDetailsDto;
  price: number;
  thumbnailImage: string;
  chapters: ChapterDetailsDto[];
  isPublished: boolean;
  isListed: boolean;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
}

interface TableAction<T> {
  label: string | ((item: T) => string);
  onClick: (item: T) => void;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | ((item: T) => "primary" | "secondary" | "danger" | "success");
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearch?: () => void;
  searchPlaceholder?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  emptyMessage?: string;
  showSearch?: boolean;
  getItemId: (item: T) => string;
}

function SimpleTable<T>({
  data,
  columns,
  actions = [],
  loading,
  searchQuery,
  onSearchChange,
  onSearch,
  currentPage,
  totalPages,
  onPageChange,
  getItemId,
}: TableProps<T>) {
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
      <div className="bg-gray-600 px-6 py-4 border-b border-gray-200 flex justify-end">
        <div className="flex space-x-4 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 pr-3 py-2 rounded-lg border text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={onSearch}
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-400 mb-4">
            <Eye className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No courses found
          </h3>
          <p className="text-gray-500">
            {searchQuery ? "Try adjusting your search criteria" : "You haven't created any courses yet"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="py-3 px-4 border-b text-left font-medium text-gray-700"
                  >
                    {column.title}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="py-3 px-4 border-b text-center font-medium text-gray-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={getItemId(item)} className="hover:bg-gray-50">
                  {columns.map((column, index) => (
                    <td key={index} className="py-3 px-4 border-b">
                      {column.render
                        ? column.render(item)
                        : String(item[column.key as keyof T])}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="py-3 px-4 border-b text-center">
                      <div className="flex justify-center space-x-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              action.variant === "danger"
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : action.variant === "success"
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                            onClick={() => action.onClick(item)}
                          >
                            {typeof action.label === "function"
                              ? action.label(item)
                              : action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center py-4">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`px-3 py-1 rounded transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const TutorCourseList: React.FC = () => {
  const [courses, setCourses] = useState<CourseDetailsDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  const fetchCourses = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      const response = await getAllCoursesTutor(page, 10, search);
      
      if (response.success) {
        setCourses(response.data.courses || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalCourses(response.data.totalCourses || 0);
        setCurrentPage(response.data.currentPage || 1);
      } else {
        toast.error(response.message || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(1, "");
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCourses(1, searchQuery);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCourses(page, searchQuery);
  };

  const handleViewCourse = (course: CourseDetailsDto) => {

    console.log("Viewing course:", course);
    toast.info(`Viewing course: ${course.title}`);
  };

  const getStatusBadge = (isPublished: boolean, isListed: boolean) => {
    if (isPublished && isListed) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Active
        </span>
      );
    } else if (isPublished && !isListed) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Unlisted
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          Draft
        </span>
      );
    }
  };

  const getTotalLessons = (chapters: ChapterDetailsDto[]): number => {
    return chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
  };

  const columns: TableColumn<CourseDetailsDto>[] = [
    {
      key: "title",
      title: "Course Details",
      render: (course) => (
        <div className="flex items-start space-x-3 max-w-sm">
          {course.thumbnailImage && (
            <img
              src={course.thumbnailImage}
              alt={course.title}
              className="w-16 h-12 object-cover rounded border flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{course.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
            <div className="mt-1 flex items-center text-xs text-gray-400">
              <span>{course.chapters.length} chapters</span>
              <span className="mx-1">•</span>
              <span>{getTotalLessons(course.chapters)} lessons</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      title: "Category",
      render: (course) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {course.category.name}
        </span>
      ),
    },
    {
      key: "price",
      title: "Price",
      render: (course) => (
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
          <span className="font-medium">
            {course.price === 0 ? "Free" : `₹${course.price.toLocaleString()}`}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (course) => getStatusBadge(course.isPublished, course.isListed),
    },
    {
      key: "enrollmentCount",
      title: "Enrollments",
      render: (course) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 text-gray-500 mr-1" />
          <span className="font-medium">{course.enrollmentCount.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      render: (course) => (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-gray-500 mr-1" />
          <span className="text-sm">
            {new Date(course.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
      ),
    },
  ];

  const actions: TableAction<CourseDetailsDto>[] = [
    {
      label: "View",
      onClick: handleViewCourse,
      variant: "primary",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-2">
            Manage your courses and track their performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
            Total Courses: <span className="font-medium">{totalCourses}</span>
          </div>
        </div>
      </div>

      <SimpleTable
        data={courses}
        columns={columns}
        actions={actions}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        getItemId={(course) => course._id}
      />
    </div>
  );
};

export default TutorCourseList;