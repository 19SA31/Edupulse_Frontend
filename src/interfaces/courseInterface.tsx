import { TutorDetailsList } from "./tutorInterface";

export interface CourseDocument {
  _id: string;
  fileName: string;
  signedUrl: string;
  originalName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}


export interface CourseVideo {
  _id: string;
  fileName: string;
  signedUrl: string;
  originalName: string;
}

export interface CourseLesson {
  _id: string;
  title: string;
  description: string;
  documents: CourseDocument[];
  videos: CourseVideo[];
  order: number;
}

export interface CourseChapter {
  _id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
  order: number;
}

export interface CourseTutor {
  _id: string;
  name: string;
  email: string;
  designation: string;
  about: string;
  avatar: string;
}

export interface CourseCategory {
  _id: string;
  name: string;
  description: string;
}

export interface CourseDetails {
  _id: string;
  title: string;
  description: string;
  benefits: string;
  requirements: string;
  category: CourseCategory;
  tutor: CourseTutor;
  price: number;
  thumbnailImage: string;
  chapters: CourseChapter[];
  isPublished: boolean;
  isListed: boolean;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDetailsComponentProps {
  courseData: CourseDetails;
}

export interface VideoPlayerProps {
  video: CourseVideo;
  onPaywallTrigger: () => void;
  freeWatchTime: number;
}

export interface DocumentViewerProps {
  documents: CourseDocument[];
  onClose: () => void;
}

export interface Category {
  id: number;
  name: string;
}

export interface CourseImage {
  file: File;
  preview: string;
  name: string;
}

export interface FormData {
  title: string;
  description: string;
  benefits: string;
  requirements: string;
  category: string;
  price: string;
  courseImage: CourseImage | null;
}

export interface UploadedFile {
  id: number;
  file: File;
  name: string;
  size: number;
  type: string;
  preview: string | null;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  documents: UploadedFile[];
  videos: UploadedFile[];
}

export interface Chapter {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  _id: string;
  title: string;
  description?: string;
  benefits?: string;
  requirements?: string;
  categoryId: {
    _id?: string;
    name: string;
  };
  price: number;
  thumbnailImage?: string;
  chapters?: Array<{
    title: string;
    description?: string;
    lessons?: Array<{
      title: string;
      description?: string;
      documents?: Array<{ fileName: string; _id?: string }>;
      videos?: Array<{ fileName: string; _id?: string }>;
      order?: number;
      _id?: string;
    }>;
    order?: number;
    _id?: string;
  }>;
  tutorId: {
    _id?: string;
    name: string;
    email?: string;
  };
  isPublished: string;
  isListed?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CourseListing {
  courseId: string;
  courseName: string;
  courseCategory: string;
  tutorName: string;
  isListed: boolean;
}


export interface TutorListingUser {
  tutorId: string;
  name: string;
  designation: string;
  about: string;
  avatar: string;
  isVerified: boolean;
}

export interface CourseListingUser {
  courseId: string;
  title: string;
  description: string;
  categoryName: string;
  tutorName: string;
  price: number;
  thumbnailImage: string;
  enrollmentCount: number;
}

export interface CategoryListingUser {
  name: string;
}

export interface CourseSearchParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'title_asc' | 'title_desc' | 'price_asc' | 'price_desc' | 'category_asc' | 'category_desc';
}

export interface CategoryDetailsList {
  _id: string;
  name: string;
  description: string;
}

export interface DocumentFileList {
  _id: string;
  fileName: string;
  signedUrl: string;
  originalName: string;
}

export interface VideoFileList {
  _id: string;
  fileName: string;
  signedUrl: string;
  originalName: string;
}

export interface LessonDetailsList {
  _id: string;
  title: string;
  description: string;
  documents: DocumentFileList[];
  videos: VideoFileList[];
  order: number;
}

export interface ChapterDetailsList {
  _id: string;
  title: string;
  description: string;
  lessons: LessonDetailsList[];
  order: number;
}

export interface CourseDetailsList {
  _id: string;
  title: string;
  description: string;
  benefits: string;
  requirements: string;
  category: CategoryDetailsList;
  tutor: TutorDetailsList;
  price: number;
  thumbnailImage: string;
  chapters: ChapterDetailsList[];
  isPublished: boolean;
  isListed: boolean;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}