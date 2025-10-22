export interface RevenueRecord {
  id: string;
  userName: string;
  userEmail: string;
  courseName: string;
  tutorName: string;
  categoryName: string;
  price: number;
  platformFee: number;
  tutorEarnings: number;
  paymentDate: string;
  paymentMethod: string;
  paymentId: string;
  status: "paid" | "pending" | "failed";
  userPhone?: string;
  courseId: string;
  tutorId: string;
  userId: string;
}

export interface AdminRevenueData {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  courseId: {
    _id: string;
    title: string;
    price: number;
    thumbnailImage: string;
  };
  tutorId: {
    _id: string;
    name: string;
    email: string;
  };
  categoryId: {
    _id: string;
    name: string;
  };
  price: number;
  platformFee: number;
  tutorEarnings: number;
  paymentId: string;
  paymentMethod: string;
  status: string;
  dateOfEnrollment: string;
}

export interface ApiResponse {
  enrollments: AdminRevenueData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message: string;
  success: boolean;
}

export interface PurchaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  revenueRecord: RevenueRecord | null;
}
