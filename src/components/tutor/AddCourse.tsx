import React, { useState, ChangeEvent, useEffect } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
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
import {
  getCourseCategories,
  fetchCourseDetails,
  createCourse,
  editCourse,
} from "../../services/tutorService";
import {
  Category,
  FormData,
  UploadedFile,
  Lesson,
  Chapter,
} from "../../interfaces/courseInterface";

// Generate unique string IDs to avoid conflicts between DB IDs and new IDs
const generateUniqueId = () =>
  `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
  thumbnailImage: Yup.mixed()
    .nullable()
    .test("required", "Course thumbnail image is required", function (value) {
      return value !== null && value !== undefined;
    })
    .test("fileType", "Please upload a valid image file", function (value) {
      if (!value) return false;
      if (value.preview && value.isExisting) return true;
      if (value.file) {
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/webp",
        ];
        return validTypes.includes(value.file.type);
      }
      return false;
    }),
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

const getValidationSchema = (step: number) => {
  switch (step) {
    case 1:
      return step1ValidationSchema;
    case 2:
      return step2ValidationSchema;
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

const StepIndicator: React.FC<{ currentStep: number; isEditMode: boolean }> = ({
  currentStep,
  isEditMode,
}) => (
  <div className="flex items-center mb-8">
    {[1, 2].map((step) => (
      <React.Fragment key={step}>
        <div
          className={`flex items-center ${
            currentStep >= step ? "text-black" : "text-gray-400"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= step ? "bg-black text-yellow-400" : "bg-gray-200"
            }`}
          >
            {step}
          </div>
          <span className="ml-2 font-medium">
            {step === 1 ? "Course Details" : "Chapters & Lessons"}
          </span>
        </div>
        {step < 2 && (
          <div
            className={`h-1 w-20 mx-4 ${
              currentStep > step ? "bg-black" : "bg-gray-200"
            }`}
          ></div>
        )}
      </React.Fragment>
    ))}
  </div>
);

const FileUploadSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  accept: string;
  files: UploadedFile[];
  onUpload: (files: FileList | null) => void;
  onRemove: (fileId: string | number) => void;
  chapterId: string | number;
  lessonId: string | number;
}> = ({
  title,
  icon,
  accept,
  files,
  onUpload,
  onRemove,
  chapterId,
  lessonId,
}) => {
  // Create unique ID for each file input to avoid conflicts
  const id = `file-upload-${title
    .replace(/\s+/g, "-")
    .toLowerCase()}-${chapterId}-${lessonId}`;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {icon}
        {title} ({files.length})
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center bg-gray-50">
        <input
          type="file"
          multiple
          accept={accept}
          onChange={(e) => onUpload(e.target.files)}
          className="hidden"
          id={id}
        />
        <label
          htmlFor={id}
          className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm"
        >
          Upload {title}
        </label>
      </div>

      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          onRemove={() => onRemove(file.id)}
        />
      ))}
    </div>
  );
};

const FileItem: React.FC<{ file: UploadedFile; onRemove: () => void }> = ({
  file,
  onRemove,
}) => (
  <div className="flex items-center justify-between bg-white p-2 rounded border mt-2">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
      <p className="text-xs text-gray-500">
        {file.isExisting ? (
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            {file.originalName} - View File
          </a>
        ) : (
          file.name
        )}
      </p>
    </div>
    <button
      type="button"
      onClick={onRemove}
      className="ml-2 text-red-500 hover:text-red-700"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

const AddCourse: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [expandedChapter, setExpandedChapter] = useState<
    string | number | null
  >(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [loadingCourseData, setLoadingCourseData] = useState<boolean>(false);

  const initialValues: FormValues = {
    title: "",
    description: "",
    benefits: "",
    requirements: "",
    category: "",
    price: "",
    thumbnailImage: null,
    chapters: [],
  };

  const [formValues, setFormValues] = useState<FormValues>(initialValues);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const editCourseId = urlParams.get("edit");

    if (editCourseId) {
      setIsEditMode(true);
      setCourseId(editCourseId);
      fetchCourseForEdit(editCourseId);
    }
  }, [location.search]);

  const fetchCourseForEdit = async (courseId: string) => {
    setLoadingCourseData(true);
    try {
      const response = await fetchCourseDetails(courseId);
      if (response.success) {
        const courseData = response.data;

        const transformedData: FormValues = {
          title: courseData.title || "",
          description: courseData.description || "",
          benefits: courseData.benefits || "",
          requirements: courseData.requirements || "",
          category: courseData.category
            ? courseData.category._id || courseData.category.id || ""
            : "",
          price: courseData.price?.toString() || "0",
          thumbnailImage: courseData.thumbnailImage
            ? {
                file: null,
                preview: courseData.thumbnailImage,
                name: "existing-image",
                isExisting: true,
              }
            : null,
          chapters:
            courseData.chapters?.map((chapter: any, chapterIndex: number) => ({
              id: chapter._id || generateUniqueId(),
              title: chapter.title || "",
              description: chapter.description || "",
              lessons:
                chapter.lessons?.map((lesson: any, lessonIndex: number) => ({
                  id: lesson._id || generateUniqueId(),
                  title: lesson.title || "",
                  description: lesson.description || "",
                  documents:
                    lesson.documents?.map((doc: any, docIndex: number) => ({
                      id: doc._id || generateUniqueId(),
                      file: null,
                      name: `Lesson ${lessonIndex + 1} Doc ${docIndex + 1}`,
                      size: 0,
                      type: "application/octet-stream",
                      preview: null,
                      isExisting: true,
                      url: doc.signedUrl || doc.fileName,
                      originalName: doc.originalName || "document",
                    })) || [],
                  videos:
                    lesson.videos?.map((video: any, videoIndex: number) => ({
                      id: video._id || generateUniqueId(),
                      file: null,
                      name: `Lesson ${lessonIndex + 1} Video ${videoIndex + 1}`,
                      size: 0,
                      type: "video/mp4",
                      preview: null,
                      isExisting: true,
                      url: video.signedUrl || video.fileName,
                      originalName: video.originalName || "video",
                    })) || [],
                })) || [],
            })) || [],
        };

        setFormValues(transformedData);
        toast.success("Course data loaded for editing");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course data");
    } finally {
      setLoadingCourseData(false);
    }
  };

  const confirmDelete = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const confirmed = window.confirm(message);
      resolve(confirmed);
    });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const fetchedResponse = await getCourseCategories();
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

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id.toString() === categoryId);
    return category ? category.name : "Unknown Category";
  };

  const handleThumbnailUpload = (
    e: ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikProps<FormValues>["setFieldValue"]
  ): void => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      const maxSize = 5 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, JPG, WEBP)");
        e.target.value = "";
        return;
      }

      if (file.size > maxSize) {
        toast.error("Image file size must be less than 5MB");
        e.target.value = "";
        return;
      }

      const previewUrl = URL.createObjectURL(file);

      const thumbnailData = {
        file,
        preview: previewUrl,
        name: file.name,
        isExisting: false,
      };

      console.log("Setting thumbnail data:", thumbnailData);

      setFieldValue("thumbnailImage", thumbnailData, true);

      setTimeout(() => {
        setFieldValue("thumbnailImage", thumbnailData, true);
      }, 0);
    }
  };

  const removeThumbnail = async (
    setFieldValue: FormikProps<FormValues>["setFieldValue"],
    currentImage: any
  ): Promise<void> => {
    const confirmed = await confirmDelete(
      "Are you sure you want to remove the course thumbnail? This action cannot be undone."
    );
    if (!confirmed) return;

    if (currentImage?.preview && !currentImage.isExisting) {
      URL.revokeObjectURL(currentImage.preview);
    }
    setFieldValue("thumbnailImage", null);
  };

  const addChapter = (
    chapters: Chapter[],
    setFieldValue: FormikProps<FormValues>["setFieldValue"]
  ): void => {
    const newChapter: Chapter = {
      id: generateUniqueId(),
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
    chapterId: string | number,
    field: keyof Omit<Chapter, "id" | "lessons">,
    value: string
  ): void => {
    const updatedChapters = chapters.map((chapter) =>
      chapter.id === chapterId ? { ...chapter, [field]: value } : chapter
    );
    setFieldValue("chapters", updatedChapters);
  };

  const deleteChapter = async (
    chapters: Chapter[],
    setFieldValue: FormikProps<FormValues>["setFieldValue"],
    chapterId: string | number
  ): Promise<void> => {
    const confirmed = await confirmDelete(
      "Are you sure you want to delete this chapter? This action cannot be undone."
    );
    if (!confirmed) return;

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
    chapterId: string | number
  ): void => {
    const newLesson: Lesson = {
      id: generateUniqueId(),
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
    chapterId: string | number,
    lessonId: string | number,
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

  const deleteLesson = async (
    chapters: Chapter[],
    setFieldValue: FormikProps<FormValues>["setFieldValue"],
    chapterId: string | number,
    lessonId: string | number
  ): Promise<void> => {
    const confirmed = await confirmDelete(
      "Are you sure you want to delete this lesson? This action cannot be undone."
    );
    if (!confirmed) return;

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
    chapterId: string | number,
    lessonId: string | number,
    fileType: "documents" | "videos",
    files: FileList | null
  ): void => {
    console.log(
      `Uploading files for Chapter ${chapterId}, Lesson ${lessonId}, Type: ${fileType}`
    );

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
        toast.error(
          `Invalid file type: ${file.name}. Please upload valid ${fileType}.`
        );
        continue;
      }

      if (file.size > maxFileSize) {
        toast.error(`File too large: ${file.name}. Maximum size is 100MB.`);
        continue;
      }

      newFiles.push({
        id: generateUniqueId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
        isExisting: false,
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

    console.log("Updated chapters:", updatedChapters);
    setFieldValue("chapters", updatedChapters);
  };

  const removeFile = async (
    chapters: Chapter[],
    setFieldValue: FormikProps<FormValues>["setFieldValue"],
    chapterId: string | number,
    lessonId: string | number,
    fileType: "documents" | "videos",
    fileId: string | number
  ): Promise<void> => {
    const confirmed = await confirmDelete(
      "Are you sure you want to delete this file? This action cannot be undone."
    );
    if (!confirmed) return;

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

  const handleNext = async (
    validateForm: FormikProps<FormValues>["validateForm"],
    values: FormValues,
    setTouched: FormikProps<FormValues>["setTouched"]
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
    } else {
      setIsSubmitting(true);
      try {
        let courseResponse;
        if (isEditMode && courseId) {
          courseResponse = await editCourse(courseId, values);
          if (courseResponse.success) {
            toast.success("Course updated successfully!");
          }
        } else {
          courseResponse = await createCourse(values);
          if (courseResponse.success) {
            toast.success(
              "Course has been applied for verification successfully!"
            );
          }
        }

        setTimeout(() => {
          navigate("/tutor/dashboard/course-management");
        }, 1000);
      } catch (error) {
        console.log(error);
        toast.error(
          `Failed to ${
            isEditMode ? "update" : "create"
          } course. Please try again.`
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = (): void => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      navigate("/tutor/dashboard/course-management");
    }
  };

  if (loadingCourseData) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <Formik
        initialValues={formValues}
        validationSchema={getValidationSchema(currentStep)}
        onSubmit={() => {}}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          setTouched,
          validateForm,
        }) => (
          <Form>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "Edit Course" : "Create Course"}
                </h1>
                {isEditMode && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Editing Mode
                  </span>
                )}
              </div>
            </div>

            <StepIndicator currentStep={currentStep} isEditMode={isEditMode} />

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
                            handleThumbnailUpload(e, setFieldValue)
                          }
                          className="hidden"
                          id="thumbnail-upload"
                        />
                        <label
                          htmlFor="thumbnail-upload"
                          className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm"
                        >
                          Choose Image
                        </label>
                      </div>
                    </div>

                    {values.thumbnailImage && (
                      <div className="relative">
                        <img
                          src={values.thumbnailImage.preview}
                          alt="Course thumbnail"
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeThumbnail(
                              setFieldValue,
                              values.thumbnailImage
                            )
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <ErrorMessage name="thumbnailImage">
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
                                      <FileUploadSection
                                        title="Documents"
                                        icon={
                                          <FileText className="w-4 h-4 inline mr-1" />
                                        }
                                        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                                        files={lesson.documents}
                                        chapterId={chapter.id}
                                        lessonId={lesson.id}
                                        onUpload={(files) =>
                                          handleFileUpload(
                                            values.chapters,
                                            setFieldValue,
                                            chapter.id,
                                            lesson.id,
                                            "documents",
                                            files
                                          )
                                        }
                                        onRemove={(fileId) =>
                                          removeFile(
                                            values.chapters,
                                            setFieldValue,
                                            chapter.id,
                                            lesson.id,
                                            "documents",
                                            fileId
                                          )
                                        }
                                      />

                                      <FileUploadSection
                                        title="Videos"
                                        icon={
                                          <Video className="w-4 h-4 inline mr-1" />
                                        }
                                        accept="video/*"
                                        files={lesson.videos}
                                        chapterId={chapter.id}
                                        lessonId={lesson.id}
                                        onUpload={(files) =>
                                          handleFileUpload(
                                            values.chapters,
                                            setFieldValue,
                                            chapter.id,
                                            lesson.id,
                                            "videos",
                                            files
                                          )
                                        }
                                        onRemove={(fileId) =>
                                          removeFile(
                                            values.chapters,
                                            setFieldValue,
                                            chapter.id,
                                            lesson.id,
                                            "videos",
                                            fileId
                                          )
                                        }
                                      />
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
                onClick={() => handleNext(validateForm, values, setTouched)}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === 1
                  ? "Next: Add Content"
                  : isSubmitting
                  ? isEditMode
                    ? "Updating Course..."
                    : "Creating Course..."
                  : isEditMode
                  ? "Update Course"
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
