import React, { useState, useEffect } from "react";
import { getAllCoursesTutor, getCourseStats } from "../../services/tutorService"; 
import { CourseDetailsList } from "../../interfaces/courseInterface";
import CourseDetailsModal from "../common/CourseDetailsModal";


const CourseCard = ({ course, onClick }) => (
  <div 
    className="bg-white shadow rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
    onClick={() => onClick(course)}
  >
    <h3 className="font-bold text-lg text-gray-800">{course.title}</h3>
    <div className="flex items-center text-sm mt-1">
      <span className="bg-blue-100 text-blue-800 px-2 rounded-full">{course.category.name}</span>
      <span className="ml-2">{course.enrollmentCount} enrollments</span>
    </div>
    <div className="mt-2 font-medium text-gray-700">
      {course.price === 0 ? "Free" : `₹${course.price.toLocaleString()}`}
    </div>
  </div>
);

const CourseWiseDashboard = () => {
  const [courses, setCourses] = useState<CourseDetailsList[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStats, setCourseStats] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const response = await getAllCoursesTutor(1, 100, "");
      if (response.success) {
        setCourses(response.data.courses || []);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const handleCourseClick = async (course) => {
    setLoading(true);

    const statsResponse = await getCourseStats(course._id);
    if (statsResponse.success) {
      setCourseStats(statsResponse.data);
    }
    setSelectedCourse(course);
    setIsModalOpen(true);
    setLoading(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setCourseStats(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Course Dashboard</h1>
      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard key={course._id} course={course} onClick={handleCourseClick} />
          ))}
        </div>
      )}
      {isModalOpen && selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          stats={courseStats} 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CourseWiseDashboard;
