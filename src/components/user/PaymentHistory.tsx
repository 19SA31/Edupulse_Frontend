import React, { useState, useEffect, useCallback } from "react";
import Table, { TableColumn } from "../common/Table";
import { getUserEnrollments } from "../../services/userService";

interface Payment {
  id: string;
  courseName: string;
  tutorName: string;
  price: number;
  paymentDate: string;
  status: "completed" | "pending" | "failed";
}

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    price: number;
    thumbnailImage: string;
  };
  tutorId: {
    _id: string;
    name: string;
  };
  categoryId: {
    _id: string;
    name: string;
  };
  price: number;
  paymentId: string;
  paymentMethod: string;
  status: string;
  dateOfEnrollment: string;
}

interface ApiResponse {
  enrollments: Enrollment[];
  totalPages: number;
  totalCount: number;
}

function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformEnrollmentToPayment = (enrollment: Enrollment): Payment => {
    let courseName = "Unknown Course";
    let tutorName = "Unknown Tutor";

    if (enrollment.courseId && typeof enrollment.courseId === 'object') {
      courseName = enrollment.courseId.title || courseName;
    }

    if (enrollment.tutorId && typeof enrollment.tutorId === 'object') {
      console.log("$$$$",enrollment.tutorId.name)
      tutorName = enrollment.tutorId.name || tutorName;
    }

    return {
      id: enrollment._id,
      courseName,
      tutorName,
      price: enrollment.price,
      paymentDate: enrollment.dateOfEnrollment,
      status: enrollment.status === "paid" ? "completed" : "pending",
    };
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserEnrollments(currentPage, debouncedSearch);
      
      const apiData: ApiResponse = response.data || {
        enrollments: [],
        totalPages: 1,
        totalCount: 0,
      };


      const transformedPayments = apiData.enrollments.map((enrollment) => {
        try {
          return transformEnrollmentToPayment(enrollment);
        } catch (transformError) {
          console.error("Error transforming enrollment:", transformError, enrollment);
          return {
            id: enrollment._id || 'unknown',
            courseName: "Error loading course",
            tutorName: "Error loading tutor", 
            price: enrollment.price || 0,
            paymentDate: enrollment.dateOfEnrollment || new Date().toISOString(),
            status: "pending" as const,
          };
        }
      });

      setPayments(transformedPayments);
      setTotalPages(apiData.totalPages);
      setTotalCount(apiData.totalCount);
    } catch (err) {
      console.error("Failed to fetch payment history:", err);
      setError("Failed to load payment history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const columns: TableColumn<Payment>[] = [
    {
      key: "courseName",
      title: "Course Name",
      align: "left",
      width: "30%",
    },
    {
      key: "tutorName",
      title: "Tutor Name",
      align: "left",
      width: "20%",
    },
    {
      key: "price",
      title: "Price",
      align: "right",
      width: "20%",
      render: (payment: Payment) => (
        <span className="font-semibold text-green-600">
          ₹{payment.price.toFixed(2)}
        </span>
      ),
    },
    {
      key: "paymentDate",
      title: "Payment Date",
      align: "center",
      width: "20%",
      render: (payment: Payment) => (
        <span className="text-gray-600">
          {new Date(payment.paymentDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      align: "center",
      width: "20%",
      render: (payment: Payment) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            payment.status === "completed"
              ? "bg-green-100 text-green-800"
              : payment.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
        </span>
      ),
    },
  ];

  const handlePageChange = (direction: "next" | "previous") => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "previous" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment History
          </h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchPayments}
                className="text-sm text-red-800 underline mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 mt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment History
        </h1>
        <p className="text-gray-600">
          View all your course payment transactions.
        </p>
      </div>

      <Table<Payment>
        data={payments}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        searchPlaceholder="Search by course..."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={10}
        emptyMessage="No payment history found"
        emptyIcon={
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        }
        loadingMessage="Loading payment history..."
        showSearch={true}
        getItemId={(payment) => payment.id}
        className="shadow-lg"
      />
    </div>
  );
}

export default PaymentHistory;