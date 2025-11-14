import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Eye } from "lucide-react";
import CourseDetailsModal from "../common/CourseDetailsModal";
import Table, { TableColumn, TableAction } from "../common/Table";
import {
  getUnpublishedCourses,
  publishCourse,
  rejectCourse,
} from "../../services/adminService";

interface Course {
  _id: string;
  title: string;
  description?: string;
  benefits?: string;
  requirements?: string;
  price: number;
  isPublished: string | boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  chapters?: any[];
  categoryId?: { name: string; _id?: string };
  tutorId?: { name: string; _id?: string };
  enrollmentCount?: number;
}

const CoursePublishingComponent: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [publishingCourseId, setPublishingCourseId] = useState<string | null>(
    null
  );
  const [rejectingCourseId, setRejectingCourseId] = useState<string | null>(
    null
  );

  const itemsPerPage = 10;

  const fetchCourses = async (page: number = 1, search: string = "") => {
    setLoading(true);
    try {
      const response = await getUnpublishedCourses(page, itemsPerPage, search);

      if (response.success) {
        setCourses(response.data.courses || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCourses(response.data.pagination?.totalCount || 0);
        setCurrentPage(page);
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
    fetchCourses(currentPage, searchQuery);
  }, [currentPage]);

  const handleSearch = (): void => {
    setCurrentPage(1);
    fetchCourses(1, searchQuery);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    fetchCourses(page, searchQuery);
  };

  const handleViewCourse = (course: Course): void => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handlePublishCourse = async (course: Course): Promise<void> => {
    try {
      setPublishingCourseId(course._id);

      const publishResponse = await publishCourse(course._id);

      if (publishResponse.success) {
        setCourses((prevCourses) =>
          prevCourses.map((c) =>
            c._id === course._id ? { ...c, isPublished: "published" } : c
          )
        );

        if (selectedCourse && selectedCourse._id === course._id) {
          setSelectedCourse({
            ...selectedCourse,
            isPublished: "published",
          });
        }

        toast.success("Course published successfully");
      } else {
        throw new Error(publishResponse.message || "Failed to publish course");
      }
    } catch (error) {
      toast.error("Failed to publish course");
      console.error("Failed to publish course:", error);
    } finally {
      setPublishingCourseId(null);
    }
  };

  const handleRejectCourse = async (
    courseId: string,
    reason: string
  ): Promise<void> => {
    try {
      setRejectingCourseId(courseId);

      const rejectResponse = await rejectCourse(courseId, reason);

      if (rejectResponse.success) {
        setCourses((prevCourses) =>
          prevCourses.map((c) =>
            c._id === courseId ? { ...c, isPublished: "rejected" } : c
          )
        );

        if (selectedCourse && selectedCourse._id === courseId) {
          setSelectedCourse({
            ...selectedCourse,
            isPublished: "rejected",
          });
        }

        toast.success("Course rejected successfully");
      } else {
        throw new Error(rejectResponse.message || "Failed to reject course");
      }
    } catch (error) {
      toast.error("Failed to reject course");
      console.error("Failed to reject course:", error);
    } finally {
      setRejectingCourseId(null);
    }
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const columns: TableColumn<Course>[] = [
    {
      key: "title",
      title: "Course Name",
      align: "left",
      width: "30%",
    },
    {
      key: "tutorName",
      title: "Tutor Name",
      align: "left",
      width: "20%",
      render: (course: Course) => course.tutorId?.name || "N/A",
    },
    {
      key: "categoryName",
      title: "Category",
      align: "left",
      width: "20%",
      render: (course: Course) => course.categoryId?.name || "N/A",
    },
    {
      key: "price",
      title: "Price",
      align: "center",
      width: "10%",
      render: (course: Course) => `₹${course.price || 0}`,
    },
    {
      key: "status",
      title: "Status",
      align: "center",
      width: "10%",
      render: (course: Course) => {
        const status =
          typeof course.isPublished === "boolean"
            ? course.isPublished
              ? "Published"
              : "Draft"
            : course.isPublished === "published"
            ? "Published"
            : course.isPublished === "rejected"
            ? "Rejected"
            : "Draft";

        return status;
      },
    },
  ];

  const actions: TableAction<Course>[] = [
    {
      label: "View Details",
      onClick: handleViewCourse,
      variant: "secondary",
    },
  ];

  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Course Publishing
          </h1>
          <p className="text-gray-600 mb-2">
            Manage and publish courses submitted by tutors
          </p>
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg inline-block">
            Total Courses: <span className="font-medium">{totalCourses}</span>
          </div>
        </div>

        <Table<Course>
          data={courses}
          columns={columns}
          actions={actions}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
          searchPlaceholder="Search courses..."
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          emptyMessage="No courses available for publishing"
          emptyIcon={
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          }
          getItemId={(course: Course) => course._id}
          className="shadow-lg"
        />
      </div>

      <CourseDetailsModal
        isOpen={isModalOpen}
        course={selectedCourse}
        onClose={handleCloseModal}
        showAdminActions={true}
        onPublish={handlePublishCourse}
        onReject={handleRejectCourse}
        isPublishing={publishingCourseId === selectedCourse?._id}
        isRejecting={rejectingCourseId === selectedCourse?._id}
      />
    </>
  );
};

export default CoursePublishingComponent;
