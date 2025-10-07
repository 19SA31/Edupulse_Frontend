import { createAxiosInstance } from "../api/axiosInstance";
import { CourseDetails } from "../interfaces/courseInterface";
import { AxiosError } from "axios";

const tutorAxiosInstance = createAxiosInstance("tutor");

import {
  FormData as CourseFormData,
  Chapter,
} from "../interfaces/courseInterface";
import { slotRequest } from "../interfaces/slotBookingInterface";
import {
  CropData,
  UpdateProfileData,
  VerificationDocuments,
} from "../interfaces/tutorInterface";

export const tutorSignUpService = async (
  name: string,
  email: string,
  phone: string,
  password: string
) => {
  try {
    const response = await tutorAxiosInstance.post("/send-otp", {
      name,
      email,
      phone,
      password,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const tutorVerifyOtpService = async (
  name: string,
  email: string,
  phone: string,
  password: string,
  otp: string
) => {
  try {
    const response = await tutorAxiosInstance.post("/verify-otp", {
      name,
      email,
      phone,
      password,
      otp,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const tutorLoginService = async (email: string, password: string) => {
  try {
    const response = await tutorAxiosInstance.post("/login", {
      email,
      password,
    });

    const tutorData = response.data.data.tutor;

    if (response.data.success && response.data.data) {
      localStorage.setItem("tutorAccessToken", response.data.data.accessToken);
      localStorage.setItem("tutor", JSON.stringify(response.data.data.tutor));
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
};

export const logoutTutor = async () => {
  try {
    const response = await tutorAxiosInstance.post("/logout");

    if (response.data.success) {
      localStorage.removeItem("tutorAccessToken");
      localStorage.removeItem("tutor");
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
};

export const tutorForgotPasswordService = async (
  email: string,
  isForgot: boolean
) => {
  try {
    const response = await tutorAxiosInstance.post("/send-otp", {
      email,
      isForgot,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const tutorVerifyForgotOtpService = async (
  email: string,
  otp: string,
  isForgot: boolean
) => {
  try {
    const response = await tutorAxiosInstance.post("/verify-otp", {
      email,
      otp,
      isForgot,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const tutorPasswordChangeService = async (
  email: string,
  password: string
) => {
  try {
    const response = await tutorAxiosInstance.patch("/reset-password", {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const tutorVerificationService = async (
  documents: VerificationDocuments
) => {
  try {
    const formData = new FormData();

    formData.append("avatar", documents.avatar);
    formData.append("degree", documents.degree);
    formData.append("aadharFront", documents.aadharFront);
    formData.append("aadharBack", documents.aadharBack);

    if (documents.email) {
      formData.append("email", documents.email);
    }
    if (documents.phone) {
      formData.append("phone", documents.phone);
    }

    if (!documents.email || !documents.phone) {
      const tutorData = localStorage.getItem("tutor");
      if (tutorData) {
        const tutor = JSON.parse(tutorData);
        if (!documents.email && tutor.email) {
          formData.append("email", tutor.email);
        }
        if (!documents.phone && tutor.phone) {
          formData.append("phone", tutor.phone);
        }
      }
    }

    const response = await tutorAxiosInstance.post(
      "/verify-documents",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Tutor verification error:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const getTutorVerificationStatus = async () => {
  try {
    const response = await tutorAxiosInstance.get("/verification-status");
    return response.data;
  } catch (error: any) {
    console.error("Get verification status error:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const updateTutorProfile = async (
  profileData: UpdateProfileData
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    const formData = new FormData();
    if (profileData.name) formData.append("name", profileData.name);
    if (profileData.phone) formData.append("phone", profileData.phone);
    if (profileData.DOB) formData.append("DOB", profileData.DOB);
    if (profileData.gender) formData.append("gender", profileData.gender);
    if (profileData.avatar) formData.append("avatar", profileData.avatar);
    if (profileData.designation)
      formData.append("designation", profileData.designation);
    if (profileData.about) formData.append("about", profileData.about);

    const response = await tutorAxiosInstance.put("/update-profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000,
    });

    if (!response.data.success) {
      return {
        success: false,
        message: response.data.message || "Failed to update profile",
        data: null,
      };
    }

    const currentTutor = JSON.parse(localStorage.getItem("tutor") || "{}");
    const currentTutorData =
      response.data.data?.tutor || response.data.tutor || {};

    const updatedTutor = {
      ...currentTutor,
      ...currentTutorData,

      avatar: currentTutorData.avatar || currentTutor.avatar,
    };

    localStorage.setItem("tutor", JSON.stringify(updatedTutor));

    return {
      success: true,
      data: { tutor: updatedTutor },
      message: response.data.message || "Profile updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update profile",
      data: null,
    };
  }
};

export const getCurrentUserProfile = (): any | null => {
  try {
    const userStr = localStorage.getItem("tutor");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error getting tutor profile from localStorage:", error);
    return null;
  }
};

export const updateUserInStorage = (userData: any): void => {
  try {
    const currentUser = getCurrentUserProfile() || {};
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem("tutor", JSON.stringify(updatedUser));
  } catch (error) {
    console.error("Error updating tutor in localStorage:", error);
  }
};

export const clearUserData = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("tutor");
};

export const getCourseCategories = () => {
  return tutorAxiosInstance.get("/get-category");
};

export const createCourse = async (
  courseData: CourseFormData & { chapters: Chapter[] }
) => {
  try {
    const formData = new FormData();

    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    formData.append("benefits", courseData.benefits);
    formData.append("requirements", courseData.requirements);
    formData.append("category", courseData.category);
    formData.append("price", courseData.price.toString());

    if (courseData.thumbnailImage?.file) {
      formData.append("thumbnail", courseData.thumbnailImage.file);
    } else {
      console.log("No thumbnail file found");
    }

    formData.append("chapters", JSON.stringify(courseData.chapters));

    let totalDocuments = 0;
    let totalVideos = 0;
    let documentsAppended = 0;
    let videosAppended = 0;

    courseData.chapters.forEach((chapter, chapterIndex) => {
      chapter.lessons.forEach((lesson, lessonIndex) => {
        lesson.documents.forEach((doc, docIndex) => {
          totalDocuments++;

          if (doc.file && doc.file instanceof File) {
            const fieldName = `lesson_documents_${chapterIndex}_${lessonIndex}_${docIndex}`;
            formData.append(fieldName, doc.file);
            documentsAppended++;
          } else {
            console.log(`No valid file for document ${docIndex}`);
          }
        });

        lesson.videos.forEach((video, videoIndex) => {
          totalVideos++;

          if (video.file && video.file instanceof File) {
            const fieldName = `lesson_videos_${chapterIndex}_${lessonIndex}_${videoIndex}`;
            formData.append(fieldName, video.file);
            videosAppended++;
          } else {
            console.log(`No valid file for video ${videoIndex}`);
          }
        });
      });
    });

    const response = await tutorAxiosInstance.post("/create-course", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error creating course:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const getAllCoursesTutor = async (
  page: number = 1,
  limit: number = 10,
  search: string = ""
) => {
  try {
    const response = await tutorAxiosInstance.get("/tutor-courses", {
      params: { page, limit, search },
    });
    return response.data;
  } catch (error) {
    console.log("error in fetching tutor courses", error);
    throw error;
  }
};

export async function fetchCourseDetails(
  courseId: string
): Promise<CourseDetails> {
  const response = await tutorAxiosInstance.get(`/course-details/${courseId}`);
  return response.data;
}

export const editCourse = async (
  courseId: string,
  courseData: CourseFormData & { chapters: Chapter[] }
) => {
  try {
    console.log("courseData", courseData);
    const formData = new FormData();
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    formData.append("benefits", courseData.benefits);
    formData.append("requirements", courseData.requirements);
    formData.append("category", courseData.category);
    formData.append("price", courseData.price.toString());

    if (courseData.thumbnailImage) {
      if (
        courseData.thumbnailImage.file &&
        !courseData.thumbnailImage.isExisting
      ) {
        formData.append("thumbnail", courseData.thumbnailImage.file);
      } else if (courseData.thumbnailImage.isExisting) {
        formData.append(
          "thumbnailUrl",
          courseData.thumbnailImage.preview || ""
        );
      }
    }
    formData.append("chapters", JSON.stringify(courseData.chapters));

    let totalDocuments = 0;
    let totalVideos = 0;
    let documentsAppended = 0;
    let videosAppended = 0;

    courseData.chapters.forEach((chapter, chapterIndex) => {
      chapter.lessons.forEach((lesson, lessonIndex) => {
        lesson.documents.forEach((doc, docIndex) => {
          totalDocuments++;

          if (doc.file && doc.file instanceof File && !doc.isExisting) {
            const fieldName = `lesson_documents_${chapterIndex}_${lessonIndex}_${docIndex}`;
            formData.append(fieldName, doc.file);
            documentsAppended++;
          } else if (doc.isExisting) {
            const fieldName = `existing_document_${chapterIndex}_${lessonIndex}_${docIndex}`;
            formData.append(fieldName, doc.url || "");
          }
        });

        lesson.videos.forEach((video, videoIndex) => {
          totalVideos++;

          if (video.file && video.file instanceof File && !video.isExisting) {
            const fieldName = `lesson_videos_${chapterIndex}_${lessonIndex}_${videoIndex}`;
            formData.append(fieldName, video.file);
            videosAppended++;
          } else if (video.isExisting) {
            const fieldName = `existing_video_${chapterIndex}_${lessonIndex}_${videoIndex}`;
            formData.append(fieldName, video.url || "");
          }
        });
      });
    });

    const response = await tutorAxiosInstance.put(
      `/edit-course/${courseId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error editing course:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const createTutorSlots = async (slotData: slotRequest) => {
  try {
    const response = await tutorAxiosInstance.post("/create-slots", slotData);
    return response.data;
  } catch (error: unknown) {
    console.error("Error in creating slots:", error);
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    throw error;
  }
};
