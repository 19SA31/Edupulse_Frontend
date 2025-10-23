export interface CourseCategory {
  _id: string;
  name: string;
  description: string;
}

export interface Tutor {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  benefits: string;
  requirements: string;
  category: CourseCategory;
  tutor: Tutor;
  price: number;
  thumbnailImage: string;
  chapters?: any[];
  isPublished: string;
  isListed: boolean;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PopulatedUser {
  name: string;
  email: string;
}

interface PopulatedTutor {
  name: string;
  email: string;
}

interface PopulatedCourse {
  title: string;
}

export interface CourseStats {
  revenue: number;
  enrollmentCount: number;
  enrolledUsers: PopulatedEnrollment[];
}

export interface PopulatedEnrollment {
  _id?: string;
  userId?: PopulatedUser; 
  tutorId?: PopulatedTutor;
  courseId?: PopulatedCourse;
  categoryId?: string;
  price: number;
  paymentId: string;
  paymentMethod?: string;
  status: "pending" | "paid" | "failed";
  dateOfEnrollment: string;
  progress?: number;
}

export interface TutorRevenueCourse {
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  coursePrice: number;
  enrollmentCount: number;
  totalRevenue: number;
  tutorEarnings: number;
  platformFee: number;
}

export interface TutorRevenueData {
  tutorId: string;
  tutorName: string;
  totalRevenue: number;
  totalTutorEarnings: number;
  totalPlatformFee: number;
  totalEnrollments: number;
  courses: TutorRevenueCourse[];
}
