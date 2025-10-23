import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTutorRevenue } from "../../services/tutorService";
import { TutorRevenueCourse, TutorRevenueData } from "../../interfaces/enrollmentInterface";

interface CourseCardProps {
  course: TutorRevenueCourse;
  onClick: (course: TutorRevenueCourse) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => (
  <div
    className="bg-white shadow rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
    onClick={() => onClick(course)}
  >
    <img
      src={course.courseThumbnail}
      alt={course.courseTitle}
      className="w-24 h-16 object-cover rounded mb-2"
    />
    <h3 className="font-bold text-lg text-gray-800">{course.courseTitle}</h3>
    <div className="flex items-center text-sm mt-1 mb-1">
      <span className="bg-blue-100 text-blue-800 px-2 rounded-full">
        {course.enrollmentCount} enrollments
      </span>
    </div>
    <div className="mt-2 font-medium text-gray-700">
      Price: {course.coursePrice === 0 ? "Free" : `₹${course.coursePrice.toLocaleString()}`}
    </div>
    <div className="mt-1 font-semibold text-green-700 text-sm">
      Tutor Earnings: ₹{course.tutorEarnings.toLocaleString()}
    </div>
    <div className="mt-1 text-red-600 text-xs">
      Platform Fee: ₹{course.platformFee.toLocaleString()}
    </div>
  </div>
);

const StatCard = ({
  label,
  value,
  description,
  icon,
  bgColor = "bg-green-50",
  textColor = "text-green-700",
}: {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
}) => (
  <div
    className={`rounded-xl shadow flex flex-col items-start justify-center px-6 py-5 m-1 ${bgColor}`}
    style={{ minWidth: 200 }}
  >
    <div className="flex items-center mb-2">
      {icon && <span className="mr-2 text-xl">{icon}</span>}
      <span className={`font-bold text-xl ${textColor}`}>{value}</span>
    </div>
    <span className="text-base text-gray-700 font-medium mb-1">{label}</span>
    {description && <span className="text-xs text-gray-500">{description}</span>}
  </div>
);

const CourseWiseDashboard: React.FC = () => {
  const [revenueData, setRevenueData] = useState<TutorRevenueData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      const resp = await getTutorRevenue();
      if (resp.success) {
        setRevenueData(resp.data);
      }
      setLoading(false);
    };
    fetchRevenueData();
  }, []);

  const handleCourseClick = (course: TutorRevenueCourse) => {
    navigate("/tutor/dashboard/course-revenue", { state: { course } });
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (!revenueData) return <p>No data available.</p>;

  const { totalRevenue, totalTutorEarnings, totalPlatformFee, totalEnrollments, courses } = revenueData;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Course Dashboard</h1>

      <div className="mb-8 flex flex-wrap gap-4">
        <StatCard
          label="Total Tutor Earnings"
          value={`₹${totalTutorEarnings.toLocaleString()}`}
          description="You earned this amount after platform fees"
          icon={<span role="img" aria-label="earnings">💰</span>}
          bgColor="bg-green-50"
          textColor="text-green-700"
        />
        <StatCard
          label="Platform Fees"
          value={`₹${totalPlatformFee.toLocaleString()}`}
          description="Service charges on your sales"
          icon={<span role="img" aria-label="platform fee">🧾</span>}
          bgColor="bg-red-50"
          textColor="text-red-700"
        />
        <StatCard
          label="Total Enrollments"
          value={totalEnrollments}
          description="Number of students bought your courses"
          icon={<span role="img" aria-label="students">👨‍🎓</span>}
          bgColor="bg-blue-50"
          textColor="text-blue-700"
        />
      </div>


      {courses.length === 0 ? (
        <div>No courses available</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courses.map((course: TutorRevenueCourse) => (
            <CourseCard
              key={course.courseId}
              course={course}
              onClick={handleCourseClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseWiseDashboard;
