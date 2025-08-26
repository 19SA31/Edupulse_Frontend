import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface CourseDocument {
  _id: string;
  fileName: string;
  signedUrl: string;
  originalName: string;
}

interface CourseVideo {
  _id: string;
  fileName: string;
  signedUrl: string;
  originalName: string;
}

interface Lesson {
  _id: string;
  title: string;
  description?: string;
  documents?: CourseDocument[];
  videos?: CourseVideo[];
}

interface Chapter {
  _id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface CourseData {
  _id: string;
  title: string;
  description?: string;
  benefits?: string;
  requirements?: string;
  price: number;
  isPublished: string | boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  chapters?: Chapter[];
  categoryId?: { name: string } | { _id: string; name: string };
  tutorId?: { name: string } | { _id: string; name: string };
  category?: { name: string; _id?: string };
  tutor?: { name: string; _id?: string };
}

interface CourseDetailsModalProps {
  isOpen: boolean;
  course: CourseData | null;
  onClose: () => void;
  onEdit?: (course: CourseData) => void;
  showAdminActions?: boolean;
  onPublish?: (course: CourseData) => Promise<void>;
  onReject?: (courseId: string, reason: string) => Promise<void>;
  isPublishing?: boolean;
  isRejecting?: boolean;
}

const rejectionSchema = Yup.object().shape({
  rejectReason: Yup.string()
    .trim()
    .min(10, "Reason must be at least 10 characters long")
    .max(500, "Reason must not exceed 500 characters")
    .required("Please provide a reason for rejection"),
});

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

const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  isOpen,
  course,
  onClose,
  onEdit,
  showAdminActions = false,
  onPublish,
  onReject,
  isPublishing = false,
  isRejecting = false,
}) => {
  const [selectedDocument, setSelectedDocument] =
    useState<CourseDocument | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] =
    useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [showRejectInput, setShowRejectInput] = useState<boolean>(false);

  if (!isOpen || !course) return null;

  const getCategoryName = () => {
    if (course.categoryId) {
      return typeof course.categoryId === "object" &&
        "name" in course.categoryId
        ? course.categoryId.name
        : "N/A";
    }
    return course.category?.name || "N/A";
  };

  const getTutorName = () => {
    if (course.tutorId) {
      return typeof course.tutorId === "object" && "name" in course.tutorId
        ? course.tutorId.name
        : "N/A";
    }
    return course.tutor?.name || "N/A";
  };

  const getStatusDisplay = () => {
    const status = course.isPublished;
    if (typeof status === "boolean") {
      return status ? "published" : "draft";
    }
    return status || "draft";
  };

  const getStatusBadgeClasses = () => {
    const status = getStatusDisplay();
    const statusConfig = {
      draft: "bg-yellow-100 text-yellow-800",
      published: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    );
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

  const closeDocumentModal = (): void => {
    setIsDocumentModalOpen(false);
    setSelectedDocument(null);
  };

  const closeVideoModal = (): void => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  const handleRejectCourse = async (values: {
    rejectReason: string;
  }): Promise<void> => {
    if (onReject && course) {
      await onReject(course._id, values.rejectReason.trim());
      setShowRejectInput(false);
    }
  };

  const handleEditClick = (): void => {
    if (onEdit && course) {
      onEdit(course);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Course Details</h2>
            <button
              onClick={onClose}
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
                    {course.title || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <p className="text-gray-900">{getCategoryName()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tutor
                  </label>
                  <p className="text-gray-900">{getTutorName()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <p className="text-gray-900 font-semibold">
                    ₹{course.price || 0}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClasses()}`}
                  >
                    {getStatusDisplay()}
                  </span>
                </div>
              </div>
            </div>

            {course.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {course.description}
                </p>
              </div>
            )}

            {course.benefits && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Benefits
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {course.benefits}
                </p>
              </div>
            )}

            {course.requirements && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Requirements
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {course.requirements}
                </p>
              </div>
            )}

            {course.chapters && course.chapters.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Course Structure
                </h3>
                <div className="space-y-4">
                  {course.chapters.map((chapter, chapterIndex) => (
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

                              {lesson.videos && lesson.videos.length > 0 && (
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
                    {course.createdAt
                      ? new Date(course.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Last Updated
                  </label>
                  <p className="text-gray-600">
                    {course.updatedAt
                      ? new Date(course.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {showAdminActions && showRejectInput && (
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
                          disabled={isRejecting}
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
                          onClick={() => setShowRejectInput(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                          disabled={isRejecting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={
                            isRejecting ||
                            !isValid ||
                            !values.rejectReason.trim()
                          }
                          className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {isRejecting && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          )}
                          <span>
                            {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                          </span>
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end gap-3">
              {/* Tutor-specific Edit button */}
              {onEdit && !showAdminActions && (
                <button
                  onClick={handleEditClick}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center space-x-2"
                >
                  <span>Edit Course</span>
                </button>
              )}

              {showAdminActions && (
                <>
                  {getStatusDisplay() === "draft" && !showRejectInput && (
                    <>
                      <button
                        onClick={() => setShowRejectInput(true)}
                        className="px-4 py-2 text-red-600 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 transition-colors"
                      >
                        Reject Course
                      </button>
                      <button
                        onClick={() => onPublish && onPublish(course)}
                        disabled={isPublishing}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors disabled:bg-green-300 flex items-center space-x-2"
                      >
                        {isPublishing && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        <span>
                          {isPublishing ? "Publishing..." : "Publish Course"}
                        </span>
                      </button>
                    </>
                  )}

                  {getStatusDisplay() !== "draft" && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">
                        Course is already{" "}
                        <span
                          className={
                            getStatusDisplay() === "published"
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {getStatusDisplay()}
                        </span>
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isDocumentModalOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[999]">
          <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 flex justify-between items-center px-6 py-3 z-10">
            <h3 className="text-white text-lg font-semibold truncate max-w-[85%]">
              Document Preview
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
              <h3 className="text-xl font-bold text-gray-900">Video Preview</h3>
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
    </>
  );
};

export default CourseDetailsModal;
