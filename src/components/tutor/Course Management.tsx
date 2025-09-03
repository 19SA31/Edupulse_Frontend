import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllCoursesTutor } from "../../services/tutorService";
import CourseDetailsModal from "../common/CourseDetailsModal";
import Table, { TableColumn, TableAction } from "../common/Table";
import { TutorDetailsList } from "../../interfaces/tutorInterface";
import {
  ChapterDetailsList,
  CourseDetailsList,
} from "../../interfaces/courseInterface";

const CourseManagement: React.FC = () => {
  const navigate = useNavigate(); 
  const [courses, setCourses] = useState<CourseDetailsList[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  const [selectedCourse, setSelectedCourse] =
    useState<CourseDetailsList | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCourses = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      const response = await getAllCoursesTutor(page, 10, search);

      if (response.success) {
        setCourses(response.data.courses || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalCourses(response.data.courses.length || 0);
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

  const handleViewCourse = (course: CourseDetailsList) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleEditCourse = (course: CourseDetailsList) => {
    navigate(`/tutor/dashboard/add-course?edit=${course._id}`);
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
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-yellow-800">
          Unlisted
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-gray-800">
          Draft
        </span>
      );
    }
  };

  const getTotalLessons = (chapters: ChapterDetailsList[]): number => {
    return chapters.reduce(
      (total, chapter) => total + chapter.lessons.length,
      0
    );
  };

  const getActionsForCourse = (
    course: CourseDetailsList
  ): TableAction<CourseDetailsList>[] => {
    const baseActions: TableAction<CourseDetailsList>[] = [
      {
        label: "View",
        onClick: handleViewCourse,
        variant: "primary",
      },
    ];

    if (!course.isPublished) {
      baseActions.push({
        label: "Edit",
        onClick: handleEditCourse,
        variant: "secondary",
      });
    }

    return baseActions;
  };

  const columns: TableColumn<CourseDetailsList>[] = [
    {
      key: "title",
      title: "Course Details",
      render: (course) => (
        <div className="flex items-start space-x-3 max-w-sm">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {course.title}
            </h3>
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
          <span className="font-medium">
            {course.enrollmentCount.toLocaleString()}
          </span>
        </div>
      ),
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

      <Table
        data={courses}
        columns={columns}
        actions={(course) => getActionsForCourse(course)}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        searchPlaceholder="Search courses..."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        emptyMessage="No courses found"
        loadingMessage="Loading courses..."
        getItemId={(course) => course._id}
      />

      <CourseDetailsModal
        course={selectedCourse}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEdit={handleEditCourse}
      />
    </div>
  );
};

export default CourseManagement;
