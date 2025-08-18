import React, { useState, ChangeEvent, useEffect } from "react";
import { toast } from "sonner";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FormikProps,
  FormikErrors,
} from "formik";
import * as Yup from "yup";
import {
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  Image,
  Edit2,
  Check,
  AlertCircle,
} from "lucide-react";
import { getCourseCategories } from "../../services/tutorService";
import {
  Category,
  CourseImage,
  FormData,
  UploadedFile,
  Lesson,
  Chapter,
} from "../../interfaces/courseInterface";
import { createCourse } from "../../services/tutorService";

const step1ValidationSchema = Yup.object({
  title: Yup.string()
    .min(5, "Course title must be at least 5 characters")
    .max(100, "Course title must not exceed 100 characters")
    .required("Course title is required"),
  category: Yup.string().required("Please select a category"),
  description: Yup.string()
    .min(100, "Description must be at least 100 words")
    .required("Course description is required"),
  benefits: Yup.string()
    .min(20, "Benefits must be at least 20 characters")
    .required("Course benefits are required"),
  requirements: Yup.string()
    .min(10, "Requirements must be at least 10 characters")
    .required("Prerequisites and requirements are required"),
  price: Yup.number()
    .min(0, "Price cannot be negative")
    .required("Price is required"),
});

const step2ValidationSchema = Yup.object({
  chapters: Yup.array()
    .of(
      Yup.object({
        title: Yup.string().required("Chapter title is required"),
        description: Yup.string().required("Chapter description is required"),
        lessons: Yup.array()
          .of(
            Yup.object({
              title: Yup.string().required("Lesson title is required"),
              description: Yup.string().required(
                "Lesson description is required"
              ),
            })
          )
          .min(1, "Each chapter must have at least one lesson"),
      })
    )
    .min(1, "Course must have at least one chapter"),
});

const step3ValidationSchema = Yup.object({
  courseImage: Yup.mixed().required("Course thumbnail image is required"),
});

const getValidationSchema = (step: number) => {
  switch (step) {
    case 1:
      return step1ValidationSchema;
    case 2:
      return step2ValidationSchema;
    case 3:
      return step3ValidationSchema;
    default:
      return step1ValidationSchema;
  }
};

interface FormValues extends FormData {
  chapters: Chapter[];
}

const isChapterErrorArray = (error: any): error is FormikErrors<Chapter>[] => {
  return Array.isArray(error) && error.length > 0;
};

const isLessonErrorArray = (error: any): error is FormikErrors<Lesson>[] => {
  return Array.isArray(error) && error.length > 0;
};

const AddCourse: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [expandedVerifyChapter, setExpandedVerifyChapter] = useState<
    number | null
  >(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const initialValues: FormValues = {
    title: "",
    description: "",
    benefits: "",
    requirements: "",
    category: "",
    price: "",
    courseImage: null,
    chapters: [],
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const fetchedResponse = await getCourseCategories();
        console.log("categories", fetchedResponse);
        const categoriesData = fetchedResponse.data.data.categories;
        const transformedCategories = categoriesData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
        }));
        setCategories(transformedCategories);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const resetFormData = (resetFormik: () => void) => {
    setCurrentStep(1);
    setExpandedChapter(null);
    setExpandedVerifyChapter(null);
    setIsSubmitting(false);
    resetFormik();
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id.toString() === categoryId);
    return category ? category.name : "Unknown Category";
  };

  const handleCourseImageUpload = (
    e: ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikProps<FormValues>["setFieldValue"]
  ): void => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid image file (JPEG, PNG, JPG, WEBP)");
        return;
      }

      if (file.size > maxSize) {
        alert("Image file size must be less than 5MB");
        return;
      }

      setFieldValue("courseImage", {
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      });
    }
  };

  const removeCourseImage = (
    setFieldValue: FormikProps<FormValues>["setFieldValue"],
    currentImage: CourseImage | null
  ): void => {
    if (currentImage?.preview) {
      URL.revokeObjectURL(currentImage.preview);
    }
    setFieldValue("courseImage", null);
  };

  const addChapter = (
    chapters: Chapter[],
    setFieldValue: FormikProps<FormValues>["setFieldValue"]
  ): void => {
    const newChapter: Chapter = {
      id: Date.now(),
      title: "",
      description: "",
      lessons: [],
    };
    const updatedChapters = [...chapters, newChapter];
    setFieldValue("chapters", updatedChapters);
    setExpandedChapter(newChapter.id);
  };

  const updateChapter = (
    chapters: Chapter[],
    setFieldValue: FormikProps<FormValues>["setFieldValue"],
    chapterId: number,
    field: keyof Omit<Chapter, "id" | "lessons">,
    value: string
  ): void => {
    const updatedChapters = chapters.map((chapter) =>
      chapter.id === chapterId ? { ...chapter, [field]: value } : chapter
    );
    setFieldValue("chapters", updatedChapters);
  };

  const deleteChapter = (
    chapters: Chapter[],
    setFieldValue: FormikProps<FormValues>["setFieldValue"],
    chapterId: number
  ): void => {
    const updatedChapters = chapters.filter(
      (chapter) => chapter.id !== chapterId
    );
    setFieldValue("chapters", updatedChapters);
    if (expandedChapter === chapterId) {
      setExpandedChapter(null);
    }
  };

  const addLesson = (
    chapters: Chapter[],
    setFieldValue: FormikProps<FormValues>["setFieldValue"],
    chapterId: number
  ): void => {
    const newLesson: Lesson = {
      id: Date.now(),
      title: "",
      description: "",
      documents: [],
      videos: [],
    };

    const updatedChapters = chapters.map((chapter) =>
      chapter.id === chapterId
        ? { ...chapter, lessons: [...chapter.lessons, newLesson] }
        : chapter
    );
    setFieldValue("chapters", updatedChapters);
  };

  const updateLesson = (
    chapters: Chapter[],
    setFieldValue: FormikProps<FormValues>["setFieldValue"],
    chapterId: number,
    lessonId: number,
    field: keyof Omit<Lesson, "id" | "documents" | "videos">,
    value: string
  ): void => {
    const updatedChapters = chapters.map((chapter) =>
      chapter.id === chapterId
        ? {
            ...chapter,
            lessons: chapter.lessons.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
            ),
          }
        : chapter
    );
    setFieldValue("chapters", updatedChapters);
  };

  const deleteLesson = (
    chapters: Chapter[],
    setFieldValue: FormikProps<FormValues>["setFieldValue"],
    chapterId: number,
    lessonId: number
  ): void => {
    const updatedChapters = chapters.map((chapter) =>
      chapter.id === chapterId
        ? {
            ...chapter,
            lessons: chapter.lessons.filter((lesson) => lesson.id !== lessonId),
          }
        : chapter
    );
    setFieldValue("chapters", updatedChapters);
  };

  const handleFileUpload = (
    chapters: Chapter[],
    setFieldValue: FormikProps<FormValues>["setFieldValue"],
    chapterId: number,
    lessonId: number,
    fileType: "documents" | "videos",
    files: FileList | null
  ): void => {
    if (!files) return;

    const validDocTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    const validVideoTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
    ];
    const maxFileSize = 100 * 1024 * 1024;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const validTypes =
        fileType === "documents" ? validDocTypes : validVideoTypes;
      if (!validTypes.includes(file.type)) {
        alert(
          `Invalid file type: ${file.name}. Please upload valid ${fileType}.`
        );
        continue;
      }

      if (file.size > maxFileSize) {
        alert(`File too large: ${file.name}. Maximum size is 100MB.`);
        continue;
      }

      newFiles.push({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      });
    }

    if (newFiles.length === 0) return;

    const updatedChapters = chapters.map((chapter) =>
      chapter.id === chapterId
        ? {
            ...chapter,
            lessons: chapter.lessons.map((lesson) =>
              lesson.id === lessonId
                ? {
                    ...lesson,
                    [fileType]: [...lesson[fileType], ...newFiles],
                  }
                : lesson
            ),
          }
        : chapter
    );
    setFieldValue("chapters", updatedChapters);
  };

  const removeFile = (
    chapters: Chapter[],
    setFieldValue: FormikProps<FormValues>["setFieldValue"],
    chapterId: number,
    lessonId: number,
    fileType: "documents" | "videos",
    fileId: number
  ): void => {
    const updatedChapters = chapters.map((chapter) =>
      chapter.id === chapterId
        ? {
            ...chapter,
            lessons: chapter.lessons.map((lesson) =>
              lesson.id === lessonId
                ? {
                    ...lesson,
                    [fileType]: lesson[fileType].filter(
                      (file) => file.id !== fileId
                    ),
                  }
                : lesson
            ),
          }
        : chapter
    );
    setFieldValue("chapters", updatedChapters);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTotalLessonsCount = (chapters: Chapter[]): number => {
    return chapters.reduce(
      (total, chapter) => total + chapter.lessons.length,
      0
    );
  };

  const getTotalFilesCount = (
    chapters: Chapter[]
  ): { documents: number; videos: number } => {
    return chapters.reduce(
      (totals, chapter) => {
        const chapterTotals = chapter.lessons.reduce(
          (lessonTotals, lesson) => ({
            documents: lessonTotals.documents + lesson.documents.length,
            videos: lessonTotals.videos + lesson.videos.length,
          }),
          { documents: 0, videos: 0 }
        );

        return {
          documents: totals.documents + chapterTotals.documents,
          videos: totals.videos + chapterTotals.videos,
        };
      },
      { documents: 0, videos: 0 }
    );
  };

  const handleNext = async (
    validateForm: FormikProps<FormValues>["validateForm"],
    values: FormValues,
    setTouched: FormikProps<FormValues>["setTouched"],
    resetFormik: () => void
  ): Promise<void> => {
    const errors = await validateForm();

    if (Object.keys(errors).length > 0) {
      const touchedFields: any = {};
      Object.keys(errors).forEach((key) => {
        touchedFields[key] = true;
        if (key === "chapters" && Array.isArray(errors.chapters)) {
          touchedFields.chapters = errors.chapters.map(() => ({
            title: true,
            description: true,
            lessons: true,
          }));
        }
      });
      setTouched(touchedFields);
      return;
    }

    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      setIsSubmitting(true);
      console.log("Course Data:", values);
      try {
        const courseResponse = await createCourse(values);
        console.log("course creation res", courseResponse);
        if (courseResponse.success) {
          toast.success(
            "Course has been applied for verification successfully!"
          );
          setTimeout(() => {
            resetFormData(resetFormik);
          }, 1000);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to create course. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = (): void => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      console.log("Navigate back");
    }
  };

  const goToStep = (step: 1 | 2 | 3): void => {
    setCurrentStep(step);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <Formik
        initialValues={initialValues}
        validationSchema={getValidationSchema(currentStep)}
        onSubmit={(values) => {
          console.log("Final submission:", values);
        }}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          setTouched,
          validateForm,
          isValid,
          resetForm,
        }) => (
          <Form>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Course Management
                </h1>
              </div>
            </div>

            <div className="flex items-center mb-8">
              <div
                className={`flex items-center ${
                  currentStep >= 1 ? "text-black" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= 1
                      ? "bg-black text-yellow-400"
                      : "bg-gray-200"
                  }`}
                >
                  1
                </div>
                <span className="ml-2 font-medium">Course Details</span>
              </div>
              <div
                className={`h-1 w-20 mx-4 ${
                  currentStep >= 2 ? "bg-black" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`flex items-center ${
                  currentStep >= 2 ? "text-black" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= 2
                      ? "bg-black text-yellow-400"
                      : "bg-gray-200"
                  }`}
                >
                  2
                </div>
                <span className="ml-2 font-medium">Chapters & Lessons</span>
              </div>
              <div
                className={`h-1 w-20 mx-4 ${
                  currentStep >= 3 ? "bg-black" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`flex items-center ${
                  currentStep >= 3 ? "text-black" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= 3
                      ? "bg-black text-yellow-400"
                      : "bg-gray-200"
                  }`}
                >
                  3
                </div>
                <span className="ml-2 font-medium">Review & Create</span>
              </div>
            </div>

            {currentStep === 1 && (
              <div className="border-2 border-gray-300 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Basic Course Information
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Course Thumbnail Image
                  </label>
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                        <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Upload course thumbnail
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleCourseImageUpload(e, setFieldValue)
                          }
                          className="hidden"
                          id="course-image-upload"
                        />
                        <label
                          htmlFor="course-image-upload"
                          className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm"
                        >
                          Choose Image
                        </label>
                      </div>
                    </div>

                    {values.courseImage && (
                      <div className="relative">
                        <img
                          src={values.courseImage.preview}
                          alt="Course thumbnail"
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeCourseImage(setFieldValue, values.courseImage)
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <ErrorMessage name="courseImage">
                    {(msg) => (
                      <div className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {msg}
                      </div>
                    )}
                  </ErrorMessage>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Course Title
                    </label>
                    <Field
                      type="text"
                      name="title"
                      className={`w-full p-3 bg-gray-100 rounded-lg border ${
                        errors.title && touched.title
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Enter course title..."
                    />
                    <ErrorMessage name="title">
                      {(msg) => (
                        <div className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {msg}
                        </div>
                      )}
                    </ErrorMessage>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Category
                    </label>
                    <Field
                      as="select"
                      name="category"
                      className={`w-full p-3 bg-gray-100 rounded-lg border ${
                        errors.category && touched.category
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="category">
                      {(msg) => (
                        <div className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {msg}
                        </div>
                      )}
                    </ErrorMessage>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Course Description (Min 100 words)
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    rows={5}
                    className={`w-full p-3 bg-gray-100 rounded-lg border ${
                      errors.description && touched.description
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter detailed course description (minimum 100 words)..."
                  />
                  <ErrorMessage name="description">
                    {(msg) => (
                      <div className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {msg}
                      </div>
                    )}
                  </ErrorMessage>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Course Benefits
                    </label>
                    <Field
                      as="textarea"
                      name="benefits"
                      rows={4}
                      className={`w-full p-3 bg-gray-100 rounded-lg border ${
                        errors.benefits && touched.benefits
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="What will students gain from this course?..."
                    />
                    <ErrorMessage name="benefits">
                      {(msg) => (
                        <div className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {msg}
                        </div>
                      )}
                    </ErrorMessage>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Prerequisites & Requirements
                    </label>
                    <Field
                      as="textarea"
                      name="requirements"
                      rows={4}
                      className={`w-full p-3 bg-gray-100 rounded-lg border ${
                        errors.requirements && touched.requirements
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Prerequisites and requirements for this course..."
                    />
                    <ErrorMessage name="requirements">
                      {(msg) => (
                        <div className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {msg}
                        </div>
                      )}
                    </ErrorMessage>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Course Price (Enter 0 for free course)
                  </label>
                  <Field
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    className={`w-full lg:w-1/3 p-3 bg-gray-100 rounded-lg border ${
                      errors.price && touched.price
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="0.00"
                  />
                  <ErrorMessage name="price">
                    {(msg) => (
                      <div className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {msg}
                      </div>
                    )}
                  </ErrorMessage>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="border-2 border-gray-300 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    Course Content Structure
                  </h2>
                  <button
                    type="button"
                    onClick={() => addChapter(values.chapters, setFieldValue)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Chapter</span>
                  </button>
                </div>

                {errors.chapters && touched.chapters && (
                  <div className="text-red-500 text-sm mb-4 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {typeof errors.chapters === "string"
                      ? errors.chapters
                      : "Please check chapter requirements"}
                  </div>
                )}

                {values.chapters.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-gray-400 mb-4">
                      <FileText className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No chapters yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start by adding your first chapter to organize your course
                      content
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {values.chapters.map((chapter, chapterIndex) => (
                      <div
                        key={chapter.id}
                        className="border border-gray-200 rounded-lg"
                      >
                        <div className="bg-gray-50 p-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                Chapter {chapterIndex + 1}
                              </span>
                              <input
                                type="text"
                                value={chapter.title}
                                onChange={(e) =>
                                  updateChapter(
                                    values.chapters,
                                    setFieldValue,
                                    chapter.id,
                                    "title",
                                    e.target.value
                                  )
                                }
                                placeholder="Chapter Title"
                                className={`flex-1 bg-transparent border-none focus:outline-none text-lg font-medium ${
                                  isChapterErrorArray(errors.chapters) &&
                                  errors.chapters[chapterIndex]?.title &&
                                  touched.chapters?.[chapterIndex]?.title
                                    ? "text-red-500"
                                    : ""
                                }`}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedChapter(
                                    expandedChapter === chapter.id
                                      ? null
                                      : chapter.id
                                  )
                                }
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {expandedChapter === chapter.id ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  deleteChapter(
                                    values.chapters,
                                    setFieldValue,
                                    chapter.id
                                  )
                                }
                                className="p-1 hover:bg-red-100 rounded text-red-600"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={chapter.description}
                            onChange={(e) =>
                              updateChapter(
                                values.chapters,
                                setFieldValue,
                                chapter.id,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Chapter description..."
                            rows={2}
                            className={`w-full mt-3 bg-white p-3 rounded border ${
                              isChapterErrorArray(errors.chapters) &&
                              errors.chapters[chapterIndex]?.description &&
                              touched.chapters?.[chapterIndex]?.description
                                ? "border-red-500"
                                : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                          />
                          {isChapterErrorArray(errors.chapters) &&
                            errors.chapters[chapterIndex]?.title &&
                            touched.chapters?.[chapterIndex]?.title && (
                              <div className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Chapter title is required
                              </div>
                            )}
                          {isChapterErrorArray(errors.chapters) &&
                            errors.chapters[chapterIndex]?.description &&
                            touched.chapters?.[chapterIndex]?.description && (
                              <div className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Chapter description is required
                              </div>
                            )}
                        </div>

                        {expandedChapter === chapter.id && (
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-700">
                                Lessons ({chapter.lessons.length})
                              </h4>
                              <button
                                type="button"
                                onClick={() =>
                                  addLesson(
                                    values.chapters,
                                    setFieldValue,
                                    chapter.id
                                  )
                                }
                                className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors text-sm"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Add Lesson</span>
                              </button>
                            </div>

                            {isChapterErrorArray(errors.chapters) &&
                              errors.chapters[chapterIndex]?.lessons &&
                              touched.chapters?.[chapterIndex]?.lessons && (
                                <div className="text-red-500 text-sm mb-4 flex items-center">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  Each chapter must have at least one lesson
                                </div>
                              )}

                            {chapter.lessons.length === 0 ? (
                              <div className="text-center py-8 bg-gray-50 rounded border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 mb-2">
                                  No lessons in this chapter
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    addLesson(
                                      values.chapters,
                                      setFieldValue,
                                      chapter.id
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  Add your first lesson
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {chapter.lessons.map((lesson, lessonIndex) => (
                                  <div
                                    key={lesson.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-3 flex-1">
                                        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                                          Lesson {lessonIndex + 1}
                                        </span>
                                        <input
                                          type="text"
                                          value={lesson.title}
                                          onChange={(e) =>
                                            updateLesson(
                                              values.chapters,
                                              setFieldValue,
                                              chapter.id,
                                              lesson.id,
                                              "title",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Lesson Title"
                                          className={`flex-1 border-none focus:outline-none font-medium ${
                                            isChapterErrorArray(
                                              errors.chapters
                                            ) &&
                                            isLessonErrorArray(
                                              errors.chapters[chapterIndex]
                                                ?.lessons
                                            ) &&
                                            errors.chapters[chapterIndex]
                                              ?.lessons?.[lessonIndex]?.title &&
                                            touched.chapters?.[chapterIndex]
                                              ?.lessons?.[lessonIndex]?.title
                                              ? "text-red-500"
                                              : ""
                                          }`}
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteLesson(
                                            values.chapters,
                                            setFieldValue,
                                            chapter.id,
                                            lesson.id
                                          )
                                        }
                                        className="p-1 hover:bg-red-100 rounded text-red-600"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>

                                    <textarea
                                      value={lesson.description}
                                      onChange={(e) =>
                                        updateLesson(
                                          values.chapters,
                                          setFieldValue,
                                          chapter.id,
                                          lesson.id,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Lesson description..."
                                      rows={2}
                                      className={`w-full mb-4 p-3 bg-gray-50 rounded border ${
                                        isChapterErrorArray(errors.chapters) &&
                                        isLessonErrorArray(
                                          errors.chapters[chapterIndex]?.lessons
                                        ) &&
                                        errors.chapters[chapterIndex]
                                          ?.lessons?.[lessonIndex]
                                          ?.description &&
                                        touched.chapters?.[chapterIndex]
                                          ?.lessons?.[lessonIndex]?.description
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                                    />

                                    {isChapterErrorArray(errors.chapters) &&
                                      isLessonErrorArray(
                                        errors.chapters[chapterIndex]?.lessons
                                      ) &&
                                      errors.chapters[chapterIndex]?.lessons?.[
                                        lessonIndex
                                      ]?.title &&
                                      touched.chapters?.[chapterIndex]
                                        ?.lessons?.[lessonIndex]?.title && (
                                        <div className="text-red-500 text-sm mb-2 flex items-center">
                                          <AlertCircle className="w-4 h-4 mr-1" />
                                          Lesson title is required
                                        </div>
                                      )}

                                    {isChapterErrorArray(errors.chapters) &&
                                      isLessonErrorArray(
                                        errors.chapters[chapterIndex]?.lessons
                                      ) &&
                                      errors.chapters[chapterIndex]?.lessons?.[
                                        lessonIndex
                                      ]?.description &&
                                      touched.chapters?.[chapterIndex]
                                        ?.lessons?.[lessonIndex]
                                        ?.description && (
                                        <div className="text-red-500 text-sm mb-4 flex items-center">
                                          <AlertCircle className="w-4 h-4 mr-1" />
                                          Lesson description is required
                                        </div>
                                      )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          <FileText className="w-4 h-4 inline mr-1" />
                                          Documents
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center bg-gray-50">
                                          <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                                            onChange={(e) =>
                                              handleFileUpload(
                                                values.chapters,
                                                setFieldValue,
                                                chapter.id,
                                                lesson.id,
                                                "documents",
                                                e.target.files
                                              )
                                            }
                                            className="hidden"
                                            id={`docs-${chapter.id}-${lesson.id}`}
                                          />
                                          <label
                                            htmlFor={`docs-${chapter.id}-${lesson.id}`}
                                            className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm"
                                          >
                                            Upload Documents
                                          </label>
                                        </div>

                                        {lesson.documents.map((file) => (
                                          <div
                                            key={file.id}
                                            className="flex items-center justify-between bg-white p-2 rounded border mt-2"
                                          >
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium text-gray-900 truncate">
                                                {file.name}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                {formatFileSize(file.size)}
                                              </p>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeFile(
                                                  values.chapters,
                                                  setFieldValue,
                                                  chapter.id,
                                                  lesson.id,
                                                  "documents",
                                                  file.id
                                                )
                                              }
                                              className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                              <X className="w-4 h-4" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          <Video className="w-4 h-4 inline mr-1" />
                                          Videos
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center bg-gray-50">
                                          <input
                                            type="file"
                                            multiple
                                            accept="video/*"
                                            onChange={(e) =>
                                              handleFileUpload(
                                                values.chapters,
                                                setFieldValue,
                                                chapter.id,
                                                lesson.id,
                                                "videos",
                                                e.target.files
                                              )
                                            }
                                            className="hidden"
                                            id={`videos-${chapter.id}-${lesson.id}`}
                                          />
                                          <label
                                            htmlFor={`videos-${chapter.id}-${lesson.id}`}
                                            className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm"
                                          >
                                            Upload Videos
                                          </label>
                                        </div>

                                        {lesson.videos.map((file) => (
                                          <div
                                            key={file.id}
                                            className="flex items-center justify-between bg-white p-2 rounded border mt-2"
                                          >
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium text-gray-900 truncate">
                                                {file.name}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                {formatFileSize(file.size)}
                                              </p>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeFile(
                                                  values.chapters,
                                                  setFieldValue,
                                                  chapter.id,
                                                  lesson.id,
                                                  "videos",
                                                  file.id
                                                )
                                              }
                                              className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                              <X className="w-4 h-4" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="border-2 border-gray-300 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-green-700">
                    Review Course Details
                  </h2>
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="text-sm">Ready to create</span>
                  </div>
                </div>

                {errors.courseImage && touched.courseImage && (
                  <div className="text-red-500 text-sm mb-4 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.courseImage}
                  </div>
                )}

                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Course Overview
                    </h3>
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit Details</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">
                          Course Title
                        </h4>
                        <p className="text-gray-900">
                          {values.title || "No title provided"}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">
                          Category
                        </h4>
                        <p className="text-gray-900">
                          {values.category
                            ? getCategoryName(values.category)
                            : "No category selected"}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">
                          Price
                        </h4>
                        <p className="text-gray-900">
                          {values.price === "0" || values.price === ""
                            ? "Free"
                            : `₹${values.price}`}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {values.courseImage && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">
                            Course Thumbnail
                          </h4>
                          <img
                            src={values.courseImage.preview}
                            alt="Course thumbnail"
                            className="w-32 h-24 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        Description
                      </h4>
                      <p className="text-gray-900 text-sm leading-relaxed">
                        {values.description || "No description provided"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">
                          Benefits
                        </h4>
                        <p className="text-gray-900 text-sm leading-relaxed">
                          {values.benefits || "No benefits listed"}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">
                          Requirements
                        </h4>
                        <p className="text-gray-900 text-sm leading-relaxed">
                          {values.requirements || "No requirements specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Course Statistics
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {values.chapters.length}
                      </div>
                      <div className="text-sm text-gray-600">Chapters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {getTotalLessonsCount(values.chapters)}
                      </div>
                      <div className="text-sm text-gray-600">Lessons</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {getTotalFilesCount(values.chapters).documents}
                      </div>
                      <div className="text-sm text-gray-600">Documents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {getTotalFilesCount(values.chapters).videos}
                      </div>
                      <div className="text-sm text-gray-600">Videos</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Course Content Structure
                    </h3>
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit Content</span>
                    </button>
                  </div>

                  {values.chapters.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No chapters added yet</p>
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Add chapters and lessons
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {values.chapters.map((chapter, chapterIndex) => (
                        <div
                          key={chapter.id}
                          className="border border-gray-200 rounded-lg"
                        >
                          <div className="bg-gray-50 p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  Chapter {chapterIndex + 1}
                                </span>
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {chapter.title ||
                                      `Chapter ${chapterIndex + 1}`}
                                  </h4>
                                  {chapter.description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {chapter.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">
                                  {chapter.lessons.length} lessons
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedVerifyChapter(
                                      expandedVerifyChapter === chapter.id
                                        ? null
                                        : chapter.id
                                    )
                                  }
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  {expandedVerifyChapter === chapter.id ? (
                                    <ChevronUp className="w-5 h-5" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {expandedVerifyChapter === chapter.id && (
                            <div className="p-4">
                              {chapter.lessons.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                  No lessons in this chapter
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  {chapter.lessons.map(
                                    (lesson, lessonIndex) => (
                                      <div
                                        key={lesson.id}
                                        className="bg-gray-50 rounded-lg p-4"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                                                Lesson {lessonIndex + 1}
                                              </span>
                                              <h5 className="font-medium text-gray-900">
                                                {lesson.title ||
                                                  `Lesson ${lessonIndex + 1}`}
                                              </h5>
                                            </div>
                                            {lesson.description && (
                                              <p className="text-sm text-gray-600 mb-3 ml-12">
                                                {lesson.description}
                                              </p>
                                            )}

                                            <div className="ml-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                <div className="flex items-center space-x-1 mb-2">
                                                  <FileText className="w-4 h-4 text-gray-500" />
                                                  <span className="text-sm font-medium text-gray-700">
                                                    Documents (
                                                    {lesson.documents.length})
                                                  </span>
                                                </div>
                                                {lesson.documents.length > 0 ? (
                                                  <div className="space-y-1">
                                                    {lesson.documents.map(
                                                      (file) => (
                                                        <div
                                                          key={file.id}
                                                          className="text-xs text-gray-600 bg-white p-2 rounded border"
                                                        >
                                                          <div className="font-medium truncate">
                                                            {file.name}
                                                          </div>
                                                          <div className="text-gray-500">
                                                            {formatFileSize(
                                                              file.size
                                                            )}
                                                          </div>
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                ) : (
                                                  <p className="text-xs text-gray-500">
                                                    No documents
                                                  </p>
                                                )}
                                              </div>

                                              <div>
                                                <div className="flex items-center space-x-1 mb-2">
                                                  <Video className="w-4 h-4 text-gray-500" />
                                                  <span className="text-sm font-medium text-gray-700">
                                                    Videos (
                                                    {lesson.videos.length})
                                                  </span>
                                                </div>
                                                {lesson.videos.length > 0 ? (
                                                  <div className="space-y-1">
                                                    {lesson.videos.map(
                                                      (file) => (
                                                        <div
                                                          key={file.id}
                                                          className="text-xs text-gray-600 bg-white p-2 rounded border"
                                                        >
                                                          <div className="font-medium truncate">
                                                            {file.name}
                                                          </div>
                                                          <div className="text-gray-500">
                                                            {formatFileSize(
                                                              file.size
                                                            )}
                                                          </div>
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                ) : (
                                                  <p className="text-xs text-gray-500">
                                                    No videos
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {currentStep === 1 ? "Cancel" : "Previous"}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleNext(validateForm, values, setTouched, resetForm)
                }
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === 1
                  ? "Next: Add Content"
                  : currentStep === 2
                  ? "Next: Review Course"
                  : isSubmitting
                  ? "Creating Course..."
                  : "Create Course"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddCourse;
