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
  isPublished: boolean;
  isListed?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}


