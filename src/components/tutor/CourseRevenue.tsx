import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Table from "../common/Table";
import { getCourseEnrollments } from "../../services/tutorService";
import {
  PopulatedEnrollment,
  TutorRevenueCourse,
} from "../../interfaces/enrollmentInterface";
import { FiArrowLeft } from "react-icons/fi"; // Import a nice back icon

const PAGE_SIZE = 10;

const CourseRevenue: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { course } = state as { course: TutorRevenueCourse };

  const [enrollments, setEnrollments] = useState<PopulatedEnrollment[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [revenue, setRevenue] = useState<number>(course?.totalRevenue ?? 0);
  const [enrollmentCount, setEnrollmentCount] = useState<number>(
    course?.enrollmentCount ?? 0
  );
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (page: number, searchValue: string) => {
    if (!course) return;
    setLoading(true);
    const resp = await getCourseEnrollments(
      course.courseId,
      page,
      PAGE_SIZE,
      searchValue
    );
    if (resp && resp.success) {
      setEnrollments(resp.data.enrolledUsers ?? []);
      setTotalPages(resp.data.pagination?.totalPages ?? 1);
      setRevenue(resp.data.totalRevenue ?? course.totalRevenue ?? 0);
      setEnrollmentCount(
        resp.data.enrollmentCount ?? course.enrollmentCount ?? 0
      );
    } else {
      setEnrollments([]);
      setTotalPages(1);
      setRevenue(course.totalRevenue ?? 0);
      setEnrollmentCount(course.enrollmentCount ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(currentPage, search);
  }, [course, currentPage, search]);

  if (!course) return <p>Course info not found.</p>;

  const columns = [
    {
      key: "name",
      title: "Name",
      render: (u: PopulatedEnrollment) => u.userId?.name ?? "-",
    },
    {
      key: "email",
      title: "Email",
      render: (u: PopulatedEnrollment) => u.userId?.email ?? "-",
    },
    {
      key: "price",
      title: "Price",
      render: (u: PopulatedEnrollment) => `₹${u.price?.toLocaleString()}`,
    },
    {
      key: "paymentMethod",
      title: "Method",
      render: (u: PopulatedEnrollment) => u.paymentMethod || "-",
    },
    {
      key: "status",
      title: "Status",
      render: (u: PopulatedEnrollment) => u.status,
    },
    {
      key: "dateOfEnrollment",
      title: "Enrolled On",
      render: (u: PopulatedEnrollment) =>
        new Date(u.dateOfEnrollment).toLocaleDateString(),
    },
    {
      key: "progress",
      title: "Progress (%)",
      render: (u: PopulatedEnrollment) => u.progress ?? "-",
    },
  ];

  const getItemId = (user: PopulatedEnrollment) =>
    user._id || user.userId?.name || user.paymentId;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(1);
    setSearch(e.target.value);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-white rounded-xl shadow-md">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition font-semibold w-fit"
      >
        <FiArrowLeft className="text-lg" />
        <span>Back to Dashboard</span>
      </button>

      <div className="flex gap-6 flex-wrap items-center mb-6">
        <img
          src={course.courseThumbnail}
          alt={course.courseTitle}
          className="w-52 h-32 object-cover rounded shadow"
        />
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold">{course.courseTitle}</h2>
          <div className="flex gap-8 mt-3">
            <span className="font-semibold text-green-700">
              Earnings: ₹{course.tutorEarnings.toLocaleString()}
            </span>
            <span className="font-semibold text-red-600">
              Platform Fee: ₹{course.platformFee.toLocaleString()}
            </span>
            <span className="font-semibold text-blue-600">
              Enrollments: {enrollmentCount}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <strong className="block mb-2 text-lg">
          Enrolled Users (with payment details):
        </strong>
        <div className="mb-3 w-full max-w-lg">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={handleSearchChange}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
        <div className="overflow-x-auto">
          <Table
            data={enrollments}
            columns={columns}
            getItemId={getItemId}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            loading={loading}
            showSearch={false}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseRevenue;
