import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Table, { TableColumn, TableAction } from "../common/Table";
import { Course } from "../../interfaces/courseInterface";
import {
  getUnpublishedCourses,
  publishCourse,
  rejectCourse,
} from "../../services/adminService";
import { toast } from "sonner";
import {
  CourseDocument,
  CourseVideo,
  Lesson,
  Chapter,
} from "../../interfaces/courseInterface";

const isValidCourseDocument = (doc: any): doc is CourseDocument => {
  return (
    doc &&
    typeof doc._id === "string" &&
    typeof doc.fileName === "string" &&
    typeof doc.signedUrl === "string" &&
    typeof doc.originalName === "string"
  );
};

const isValidCourseVideo = (video: any): video is CourseVideo => {
  return (
    video &&
    typeof video._id === "string" &&
    typeof video.fileName === "string" &&
    typeof video.signedUrl === "string" &&
    typeof video.originalName === "string"
  );
};

const rejectionSchema = Yup.object().shape({
  rejectReason: Yup.string()
    .trim()
    .min(10, "Reason must be at least 10 characters long")
    .max(500, "Reason must not exceed 500 characters")
    .required("Please provide a reason for rejection"),
});

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
  const [selectedDocument, setSelectedDocument] =
    useState<CourseDocument | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] =
    useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  const [showRejectInput, setShowRejectInput] = useState<boolean>(false);
  const [rejectingCourseId, setRejectingCourseId] = useState<string | null>(
    null
  );

  const itemsPerPage = 10;

  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tutorId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.categoryId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
    setShowRejectInput(false);
  };

  const handlePublishToggle = async (course: Course): Promise<void> => {
    try {
      setPublishingCourseId(course._id);
      let toggleResponse;
      if (course.isPublished === "published") {
        toggleResponse = await rejectCourse(course._id);
      } else {
        toggleResponse = await publishCourse(course._id);
      }
      if (toggleResponse.success) {
        setCourses((prevCourses) =>
          prevCourses.map((c) =>
            c._id === course._id
              ? {
                  ...c,
                  isPublished:
                    c.isPublished === "published" ? "rejected" : "published",
                }
              : c
          )
        );
        if (selectedCourse && selectedCourse._id === course._id) {
          setSelectedCourse({
            ...selectedCourse,
            isPublished:
              selectedCourse.isPublished === "published"
                ? "rejected"
                : "published",
          });
        }

        const action =
          course.isPublished === "published" ? "unpublished" : "published";
        toast.success(`Course ${action} successfully`);

        closeModal();
      } else {
        throw new Error(
          toggleResponse.message || "Failed to update course status"
        );
      }
    } catch (error) {
      toast.error("Failed to update course status");
      console.error("Failed to update course status:", error);
    } finally {
      setPublishingCourseId(null);
    }
  };

  const handleRejectCourse = async (values: {
    rejectReason: string;
  }): Promise<void> => {
    if (!selectedCourse) return;

    try {
      setRejectingCourseId(selectedCourse._id);
      const rejectResponse = await rejectCourse(
        selectedCourse._id,
        values.rejectReason.trim()
      );

      if (rejectResponse.success) {
        setCourses((prevCourses) =>
          prevCourses.map((c) =>
            c._id === selectedCourse._id
              ? {
                  ...c,
                  isPublished: "rejected",
                }
              : c
          )
        );

        setSelectedCourse({
          ...selectedCourse,
          isPublished: "rejected",
        });

        toast.success("Course rejected successfully");
        setShowRejectInput(false);
        closeModal();
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

  const handleShowRejectInput = (): void => {
    setShowRejectInput(true);
  };

  const handleCancelReject = (): void => {
    setShowRejectInput(false);
  };

  const handleDocumentClick = (document: any): void => {
    if (isValidCourseDocument(document)) {
      setSelectedDocument(document);
      setIsDocumentModalOpen(true);
    } else {
      console.warn("Invalid document format:", document);
    }
  };

  const handleVideoClick = (video: any): void => {
    if (isValidCourseVideo(video)) {
      setSelectedVideo(video);
      setIsVideoModalOpen(true);
    } else {
      console.warn("Invalid video format:", video);
    }
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setShowRejectInput(false);
  };

  const closeDocumentModal = (): void => {
    setIsDocumentModalOpen(false);
    setSelectedDocument(null);
  };

  const closeVideoModal = (): void => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  const getGenericDocumentName = (
    lessonTitle: string,
    index: number
  ): string => {
    const cleanLessonName =
      lessonTitle.replace(/[^a-zA-Z0-9\s]/g, "").trim() || "Lesson";
    return `${cleanLessonName} Doc#${index + 1}`;
  };

  const getGenericVideoName = (lessonTitle: string, index: number): string => {
    const cleanLessonName =
      lessonTitle.replace(/[^a-zA-Z0-9\s]/g, "").trim() || "Lesson";
    return `${cleanLessonName} Video#${index + 1}`;
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
        const statusConfig = {
          draft: {
            bg: "bg-yellow-100",
            text: "text-yellow-800",
            label: "Draft",
          },
          published: {
            bg: "bg-green-100",
            text: "text-green-800",
            label: "Published",
          },
          rejected: {
            bg: "bg-red-100",
            text: "text-red-800",
            label: "Rejected",
          },
        };
        const config =
          statusConfig[course.isPublished as keyof typeof statusConfig] ||
          statusConfig.draft;

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
          >
            {config.label}
          </span>
        );
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

  const fetchCourses = async (page: number = 1, search: string = "") => {
    setLoading(true);
    try {
      const response = await getUnpublishedCourses(page, itemsPerPage, search);

      console.log("response", response);
      if (response.success) {
        setCourses(response.data.courses);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCourses(response.data.pagination.totalCount);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(currentPage, searchQuery);
  }, [currentPage]);

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
                      ₹{selectedCourse.price || 0}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedCourse.isPublished === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedCourse.isPublished === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedCourse.isPublished}
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

                                  {lesson.documents &&
                                    lesson.documents.length > 0 && (
                                      <div className="mt-3">
                                        <h6 className="text-sm font-medium text-gray-700 mb-2">
                                          Documents ({lesson.documents.length})
                                        </h6>
                                        <div className="space-y-1">
                                          {lesson.documents
                                            .filter(isValidCourseDocument)
                                            .map((document, docIndex) => (
                                              <button
                                                key={document._id}
                                                onClick={() =>
                                                  handleDocumentClick(document)
                                                }
                                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors w-full text-left"
                                                disabled={!document.signedUrl}
                                              >
                                                <span>📄</span>
                                                <span className="text-sm truncate">
                                                  {getGenericDocumentName(
                                                    lesson.title || "Lesson",
                                                    docIndex
                                                  )}
                                                </span>
                                                {!document.signedUrl && (
                                                  <span className="text-xs text-red-500 ml-2">
                                                    (Unavailable)
                                                  </span>
                                                )}
                                              </button>
                                            ))}
                                        </div>
                                      </div>
                                    )}

                                  {lesson.videos &&
                                    lesson.videos.length > 0 && (
                                      <div className="mt-3">
                                        <h6 className="text-sm font-medium text-gray-700 mb-2">
                                          Videos ({lesson.videos.length})
                                        </h6>
                                        <div className="space-y-1">
                                          {lesson.videos
                                            .filter(isValidCourseVideo)
                                            .map((video, videoIndex) => (
                                              <button
                                                key={video._id}
                                                onClick={() =>
                                                  handleVideoClick(video)
                                                }
                                                className="flex items-center space-x-2 text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded transition-colors w-full text-left"
                                                disabled={!video.signedUrl}
                                              >
                                                <span>▶️</span>
                                                <span className="text-sm truncate">
                                                  {getGenericVideoName(
                                                    lesson.title || "Lesson",
                                                    videoIndex
                                                  )}
                                                </span>
                                                {!video.signedUrl && (
                                                  <span className="text-xs text-red-500 ml-2">
                                                    (Unavailable)
                                                  </span>
                                                )}
                                              </button>
                                            ))}
                                        </div>
                                      </div>
                                    )}
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

              {showRejectInput && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">
                    Rejection Reason
                  </h3>
                  <Formik
                    initialValues={{ rejectReason: "" }}
                    validationSchema={rejectionSchema}
                    onSubmit={handleRejectCourse}
                  >
                    {({ values, errors, touched, isValid }) => (
                      <Form className="space-y-3">
                        <div>
                          <label
                            htmlFor="rejectReason"
                            className="block text-sm font-medium text-red-700 mb-2"
                          >
                            Please provide a reason for rejecting this course *
                          </label>
                          <Field
                            as="textarea"
                            id="rejectReason"
                            name="rejectReason"
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-none ${
                              errors.rejectReason && touched.rejectReason
                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            placeholder="Please provide a detailed reason for rejection..."
                            disabled={rejectingCourseId === selectedCourse._id}
                          />
                          <ErrorMessage
                            name="rejectReason"
                            component="p"
                            className="mt-1 text-sm text-red-600"
                          />
                          <div className="mt-1 text-xs text-gray-500">
                            {values.rejectReason.length}/500 characters (minimum
                            10 characters required)
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={handleCancelReject}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            disabled={rejectingCourseId === selectedCourse._id}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={
                              rejectingCourseId === selectedCourse._id ||
                              !isValid ||
                              !values.rejectReason.trim()
                            }
                            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {rejectingCourseId === selectedCourse._id && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            <span>
                              {rejectingCourseId === selectedCourse._id
                                ? "Rejecting..."
                                : "Confirm Rejection"}
                            </span>
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              {selectedCourse.isPublished === "draft" && !showRejectInput && (
                <>
                  <button
                    onClick={handleShowRejectInput}
                    className="px-4 py-2 text-red-600 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 transition-colors flex items-center space-x-2"
                  >
                    <span>Reject Course</span>
                  </button>
                  <button
                    onClick={() => handlePublishToggle(selectedCourse)}
                    disabled={publishingCourseId === selectedCourse._id}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors disabled:bg-green-300 flex items-center space-x-2"
                  >
                    {publishingCourseId === selectedCourse._id && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>
                      {publishingCourseId === selectedCourse._id
                        ? "Publishing..."
                        : "Publish Course"}
                    </span>
                  </button>
                </>
              )}

              {selectedCourse.isPublished !== "draft" && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">
                    Course is already{" "}
                    <span
                      className={
                        selectedCourse.isPublished === "published"
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {selectedCourse.isPublished}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isDocumentModalOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[999]">
          <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 flex justify-between items-center px-6 py-3 z-10">
            <h3 className="text-white text-lg font-semibold truncate max-w-[85%]">
            </h3>
            <button
              onClick={closeDocumentModal}
              className="text-white hover:text-gray-300 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {selectedDocument.signedUrl ? (
            <iframe
              src={selectedDocument.signedUrl}
              className="w-full h-full"
              style={{ border: "none" }}
              title={selectedDocument.originalName || selectedDocument.fileName}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Document not available</p>
            </div>
          )}
        </div>
      )}

      {isVideoModalOpen && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
              </h3>
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex-1 p-4 bg-black">
              {selectedVideo.signedUrl ? (
                <video
                  controls
                  className="w-full h-full max-h-[70vh]"
                  preload="metadata"
                >
                  <source src={selectedVideo.signedUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white">Video not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePublishingComponent;
