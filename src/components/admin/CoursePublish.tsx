import React, { useState } from "react";
import Table, { TableColumn, TableAction } from "../common/Table";
import { Course } from "../../interfaces/courseInterface";


const CoursePublishingComponent: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const itemsPerPage = 10;

  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tutorId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.categoryId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCourses.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSearch = (): void => {
    setCurrentPage(1);
  };

  const handlePageChange = (direction: "next" | "previous"): void => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "previous" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleViewCourse = (course: Course): void => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handlePublishToggle = (course: Course): void => {
    setCourses((prevCourses) =>
      prevCourses.map((c) =>
        c._id === course._id
          ? { ...c, isPublished: !c.isPublished, updatedAt: new Date() }
          : c
      )
    );
  };

  const closeModal = (): void => {
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
      render: (course: Course) => `$${course.price || 0}`,
    },
    {
      key: "status",
      title: "Status",
      align: "center",
      width: "10%",
      render: (course: Course) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            course.isPublished
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {course.isPublished ? "Published" : "Draft"}
        </span>
      ),
    },
  ];

  const actions: TableAction<Course>[] = [
    {
      label: "View Details",
      onClick: handleViewCourse,
      variant: "secondary",
    },
    {
      label: (course: Course) => (course.isPublished ? "Unpublish" : "Publish"),
      onClick: handlePublishToggle,
      variant: (course: Course) => (course.isPublished ? "danger" : "success"),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Course Publishing
        </h1>
        <p className="text-gray-600">
          Manage and publish courses submitted by tutors
        </p>
      </div>

      <Table<Course>
        data={paginatedCourses}
        columns={columns}
        actions={actions}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        searchPlaceholder="Search..."
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

      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Course Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Title
                    </label>
                    <p className="text-gray-900 font-medium">
                      {selectedCourse.title || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <p className="text-gray-900">
                      {selectedCourse.categoryId?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tutor
                    </label>
                    <p className="text-gray-900">
                      {selectedCourse.tutorId?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <p className="text-gray-900 font-semibold">
                      ${selectedCourse.price || 0}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedCourse.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedCourse.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedCourse.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>
              )}

              {selectedCourse.benefits && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Benefits
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedCourse.benefits}
                  </p>
                </div>
              )}

              {selectedCourse.requirements && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Requirements
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedCourse.requirements}
                  </p>
                </div>
              )}

              {selectedCourse.chapters &&
                selectedCourse.chapters.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Course Structure
                    </h3>
                    <div className="space-y-4">
                      {selectedCourse.chapters.map((chapter, chapterIndex) => (
                        <div
                          key={chapterIndex}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Chapter {chapterIndex + 1}:{" "}
                            {chapter.title || "Untitled Chapter"}
                          </h4>
                          {chapter.description && (
                            <p className="text-gray-600 text-sm mb-3">
                              {chapter.description}
                            </p>
                          )}

                          {chapter.lessons && chapter.lessons.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-800">
                                Lessons:
                              </h5>
                              {chapter.lessons.map((lesson, lessonIndex) => (
                                <div
                                  key={lessonIndex}
                                  className="ml-4 p-3 bg-gray-50 rounded"
                                >
                                  <h6 className="font-medium text-gray-800">
                                    {lesson.title || "Untitled Lesson"}
                                  </h6>
                                  {lesson.description && (
                                    <p className="text-gray-600 text-sm mt-1">
                                      {lesson.description}
                                    </p>
                                  )}
                                  <div className="mt-2 flex gap-4 text-sm text-gray-500">
                                    <span>
                                      📄 {lesson.documents?.length || 0}{" "}
                                      Documents
                                    </span>
                                    <span>
                                      🎥 {lesson.videos?.length || 0} Videos
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Created At
                    </label>
                    <p className="text-gray-600">
                      {selectedCourse.createdAt
                        ? new Date(
                            selectedCourse.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Last Updated
                    </label>
                    <p className="text-gray-600">
                      {selectedCourse.updatedAt
                        ? new Date(
                            selectedCourse.updatedAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handlePublishToggle(selectedCourse);
                  closeModal();
                }}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedCourse.isPublished
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {selectedCourse.isPublished
                  ? "Unpublish Course"
                  : "Publish Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePublishingComponent;
