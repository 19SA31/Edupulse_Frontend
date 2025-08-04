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


interface ChapterErrors {
  title?: string;
  description?: string;
  lessons?: LessonErrors[] | string;
}

interface LessonErrors {
  title?: string;
  description?: string;
}