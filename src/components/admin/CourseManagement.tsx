import React, { useState, useEffect } from "react";
import { FiBook } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { logoutAdminAction } from "../../redux/actions/adminActions";
import Table, { TableColumn, TableAction } from "../../components/common/Table";
import { Course, CourseListing } from "../../interfaces/courseInterface";
import {
  getPublishedCourses,
  listUnlistCourse,
} from "../../services/adminService";

const courseColumns: TableColumn<Course>[] = [
  { key: "title", title: "Course Name", align: "center" },
  {
    key: "categoryId",
    title: "Category",
    render: (course) => course.categoryId.name,
    align: "center",
  },
  {
    key: "tutorId",
    title: "Tutor Name",
    render: (course) => course.tutorId.name,
    align: "center",
  },
  {
    key: "isListed",
    title: "Status",
    render: (course) => (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          course.isListed
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {course.isListed ? "Listed" : "Unlisted"}
      </span>
    ),
    align: "center",
  },
];

function CourseManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(7);

  const fetchCourses = async (page: number, search: string = "") => {
    setLoading(true);
    try {
      const response = await getPublishedCourses(page, search);
      if (response.success && response.data) {
        setCourses(
          response.data.courses.map((c: CourseListing) => ({
            _id: c.courseId,
            title: c.courseName,
            categoryId: { name: c.courseCategory },
            tutorId: { name: c.tutorName },
            isListed: c.isListed,
          }))
        );

        setTotalPages(response.data.totalPages);
      } else {
        setCourses([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized: Redirecting to login page.");
        await dispatch(logoutAdminAction());
        navigate("/admin/login");
      } else {
        console.error("Error fetching courses:", error);
        setCourses([]);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleListState = async (courseId: string) => {
    try {
      const toggleResponse = await listUnlistCourse(courseId);
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? { ...course, isListed: !course.isListed }
            : course
        )
      );
    } catch (error) {
      console.error("Error toggling course list state:", error);
    }
  };

  const actions: TableAction<Course>[] = [
    {
      label: (course: Course) => (course.isListed ? "Unlist" : "List"),
      onClick: (course: Course) => toggleListState(course._id),
      variant: (course: Course) => (course.isListed ? "danger" : "success"),
    },
  ];

  const handlePageChange = (page:number) => {
    setCurrentPage(page)
    fetchCourses(page,searchQuery)
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCourses(1, searchQuery);
  };

  const getItemId = (course: Course) => course._id;

  useEffect(() => {
    fetchCourses(currentPage, searchQuery);
  }, [currentPage]);

  const listedCourses = courses.filter((c) => c.isListed);
  const unlistedCourses = courses.filter((c) => !c.isListed);
  const totalCourses = courses.length;

  return (
    <div className="p-6 mt-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Course Management
        </h1>
        <p className="text-gray-600">List and Unlist Courses</p>
      </div>

      <Table
        data={courses}
        columns={courseColumns}
        actions={actions}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        searchPlaceholder="Search courses by title"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        emptyMessage="No courses found"
        loadingMessage="Loading courses..."
        showSearch={true}
        getItemId={getItemId}
        emptyIcon={
          <div className="mx-auto h-12 w-12 text-gray-400 bg-gray-100 rounded-full flex items-center justify-center">
            <FiBook className="h-6 w-6" />
          </div>
        }
        className="shadow-sm"
      />
    </div>
  );
}

export default CourseManagement;
