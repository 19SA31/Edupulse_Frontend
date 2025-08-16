import React, { useState, useEffect } from "react";
import {
  Play,
  Download,
  FileText,
  Clock,
  Users,
  Star,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import DocumentViewer from "./DocumentViewer";
import {
  CourseDetails,
  CourseVideo,
  CourseDocument,
  CourseLesson,
  CourseDetailsComponentProps,
} from "../../interfaces/courseInterface";

const CourseDetailsComponent: React.FC<CourseDetailsComponentProps> = ({
  courseData,
}) => {
  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >({});
  const [showFullDescription, setShowFullDescription] =
    useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  const [showDocuments, setShowDocuments] = useState<boolean>(false);
  const [selectedDocuments, setSelectedDocuments] = useState<CourseDocument[]>(
    []
  );
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);

  console.log("inside component", courseData);
  useEffect(() => {
    if (courseData?.chapters?.[0]?.lessons?.[0]?.videos?.[0]) {
      setSelectedVideo(courseData.chapters[0].lessons[0].videos[0]);
      setActiveLesson(courseData.chapters[0].lessons[0]);
    }
  }, [courseData]);

  const toggleChapter = (chapterId: string): void => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleVideoSelect = (
    video: CourseVideo,
    lesson: CourseLesson
  ): void => {
    setSelectedVideo(video);
    setActiveLesson(lesson);
  };

  const handleDocumentView = (documents: CourseDocument[]): void => {
    if (documents && documents.length > 0) {
      setSelectedDocuments(documents);
      setShowDocuments(true);
    }
  };

  const handlePaywallTrigger = (): void => {
    console.log("Paywall triggered - redirect to enrollment");
  };

  const formatPrice = (price: number): string => {
    if (!price || isNaN(price)) return "₹0";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!courseData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  const {
    title = "",
    description = "",
    benefits = "",
    requirements = "",
    tutor = {} as CourseDetails["tutor"],
    price = 0,
    thumbnailImage = "",
    chapters = [],
    category = {} as CourseDetails["category"],
    enrollmentCount = 0,
  } = courseData;

  const totalLessons = chapters.reduce((total: number, chapter) => {
    return total + (chapter.lessons?.length || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="inline-block bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                  {category?.name || "Course"}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">
                {title}
              </h1>

              {selectedVideo && (
                <div className="mb-6">
                  <VideoPlayer
                    video={selectedVideo}
                    onPaywallTrigger={handlePaywallTrigger}
                    freeWatchTime={30}
                  />
                </div>
              )}

              <div className="mb-6">
                <p className="text-lg text-gray-300 leading-relaxed">
                  {showFullDescription
                    ? description
                    : `${description.substring(0, 200)}${
                        description.length > 200 ? "..." : ""
                      }`}
                </p>
                {description && description.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-yellow-400 hover:text-yellow-300 mt-2 font-medium"
                    type="button"
                  >
                    {showFullDescription ? "Show less" : "Show more"}
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={tutor?.avatar || "/api/placeholder/60/60"}
                  alt={tutor?.name || "Instructor"}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/api/placeholder/60/60";
                  }}
                />
                <div>
                  <p className="font-semibold">{tutor?.name || "Instructor"}</p>
                  <p className="text-sm text-gray-400">
                    {tutor?.designation || "Course Instructor"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                  <span className="text-gray-400">(1,234 ratings)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>
                    {enrollmentCount.toLocaleString()} students enrolled
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg overflow-hidden sticky top-6">
                <div className="relative">
                  <img
                    src={thumbnailImage || "/api/placeholder/400/225"}
                    alt={title || "Course thumbnail"}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/api/placeholder/400/225";
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <Play className="w-16 h-16 text-white opacity-80" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(price)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      One-time payment
                    </p>
                  </div>

                  <button className="w-full bg-yellow-400 hover:bg-gradient-to-bl from-yellow-400 to-yellow-600 text-black font-semibold py-3 px-4 rounded-lg mb-3 transition-colors">
                    Enroll Now
                  </button>

                  <button className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors">
                    Add to Wishlist
                  </button>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        30-Day Money-Back Guarantee
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Full Lifetime Access
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className=" bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl text-white font-bold mb-6">
                What you'll learn
              </h2>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits &&
                    benefits
                      .split(".")
                      .filter((benefit: string) => benefit.trim())
                      .slice(0, 8)
                      .map((benefit: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-white">{benefit.trim()}</span>
                        </div>
                      ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold  text-white mb-6">
                Course content
              </h2>
              <div className="bg-gray-800 border border-ywllow-200 rounded-lg p-6">
                <div className="p-4 bg-gray-800 border-yellow-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">
                      {chapters?.length || 0} chapters • {totalLessons} lessons
                    </span>
                    <button
                      className="text-yellow-400 hover:text-yellow-700 font-medium text-sm"
                      onClick={() => {
                        const allExpanded =
                          Object.keys(expandedChapters).length ===
                          chapters.length;
                        const newState: Record<string, boolean> = {};
                        if (!allExpanded) {
                          chapters.forEach((chapter) => {
                            newState[chapter._id] = true;
                          });
                        }
                        setExpandedChapters(newState);
                      }}
                    >
                      {Object.keys(expandedChapters).length === chapters.length
                        ? "Collapse all"
                        : "Expand all"}
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {chapters?.map((chapter) => (
                    <div
                      key={chapter._id}
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      <button
                        onClick={() => toggleChapter(chapter._id)}
                        className="w-full px-4 py-4 text-left hover:bg-gray-600 transition-colors"
                        type="button"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {expandedChapters[chapter._id] ? (
                              <ChevronDown className="w-5 h-5 text-white" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-white" />
                            )}
                            <div>
                              <h3 className="font-medium text-gray-100">
                                {chapter.title}
                              </h3>
                              <p className="text-sm text-gray-200 mt-1">
                                {chapter.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-yellow-400">
                            {chapter.lessons?.length || 0} lessons
                          </div>
                        </div>
                      </button>

                      {expandedChapters[chapter._id] && (
                        <div className="px-4 pb-4">
                          <div className="ml-8 space-y-3">
                            {chapter.lessons?.map((lesson) => (
                              <div key={lesson._id} className="space-y-2">
                                <div className="flex items-center justify-between py-2">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-gray-200">
                                      {lesson.title}
                                    </span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      Preview
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                                    <Clock className="w-4 h-4" />
                                    <span>08:22</span>
                                  </div>
                                </div>

                                {lesson.videos?.map((video, videoIndex) => (
                                  <button
                                    key={video._id}
                                    onClick={() =>
                                      handleVideoSelect(video, lesson)
                                    }
                                    className={`ml-6 flex items-center space-x-3 py-2 px-3 rounded text-left w-full hover:bg-yellow-400 transition-colors ${
                                      selectedVideo?._id === video._id
                                        ? "bg-gray-300"
                                        : ""
                                    }`}
                                    type="button"
                                  >
                                    {/* Play icon stays the same */}
                                    <Play className="w-4 h-4 text-purple-600" />

                                    {/* Text changes based on selection */}
                                    <span
                                      className={`text-sm ${
                                        selectedVideo?._id === video._id
                                          ? "text-black"
                                          : "text-white"
                                      }`}
                                    >
                                      Video {videoIndex + 1}
                                    </span>
                                  </button>
                                ))}

                                {lesson.documents?.length > 0 && (
                                  <button
                                    onClick={() =>
                                      handleDocumentView(lesson.documents)
                                    }
                                    className="ml-6 flex items-center space-x-3 py-2 px-3 rounded text-left hover:bg-gray-50 transition-colors"
                                    type="button"
                                  >
                                    <FileText className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-gray-200">
                                      Documents ({lesson.documents.length})
                                    </span>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-6">
                Requirements
              </h2>
              <div className="space-y-3">
                {requirements &&
                  requirements
                    .split(".")
                    .filter((req: string) => req.trim())
                    .map((requirement: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-gray-100 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-200">
                          {requirement.trim()}
                        </span>
                      </div>
                    ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Instructor</h2>
              <div className="bg-gray-800 border rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={tutor?.avatar || "/api/placeholder/80/80"}
                    alt={tutor?.name}
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/api/placeholder/80/80";
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-50 mb-1">
                      {tutor?.name}
                    </h3>
                    <p className="text-yellow-400 font-medium mb-3">
                      {tutor?.designation}
                    </p>
                    <p className="text-gray-200 leading-relaxed">
                      {tutor?.about}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="bg-gray-800 border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  This course includes:
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Play className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-200">
                      On-demand video content
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-200">
                      Downloadable resources
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-200">
                      Certificate of completion
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-200">
                      Full lifetime access
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">
                  More courses from {tutor?.name}
                </h3>
                <div className="space-y-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDocuments && (
        <DocumentViewer
          documents={selectedDocuments}
          onClose={() => setShowDocuments(false)}
        />
      )}
    </div>
  );
};

export default CourseDetailsComponent;
