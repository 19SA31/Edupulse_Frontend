import React, { useState, useEffect, useCallback } from "react";
import Table, { TableColumn } from "../common/Table";
import { getAdminRevenue } from "../../services/adminService";

interface RevenueRecord {
  id: string;
  userName: string;
  userEmail: string;
  courseName: string;
  tutorName: string;
  categoryName: string;
  price: number;
  adminCommission: number;
  tutorEarnings: number;
  paymentDate: string;
  paymentMethod: string;
  paymentId: string;
  status: "completed" | "pending" | "failed" | "refunded";
  userPhone?: string;
  courseId: string;
  tutorId: string;
  userId: string;
}

interface AdminRevenueData {
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
  adminCommission: number;
  tutorEarnings: number;
  paymentId: string;
  paymentMethod: string;
  status: string;
  dateOfEnrollment: string;
}

interface ApiResponse {
  revenues: AdminRevenueData[];
  totalPages: number;
  totalCount: number;
  totalRevenue: number;
  totalCommission: number;
}

interface PurchaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  revenueRecord: RevenueRecord | null;
}

function PurchaseDetailsModal({
  isOpen,
  onClose,
  revenueRecord,
}: PurchaseDetailsModalProps) {
  if (!isOpen || !revenueRecord) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Purchase Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              User Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Name
                </label>
                <p className="text-gray-900">{revenueRecord.userName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-gray-900">{revenueRecord.userEmail}</p>
              </div>
              {revenueRecord.userPhone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phone
                  </label>
                  <p className="text-gray-900">{revenueRecord.userPhone}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  User ID
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {revenueRecord.userId}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Course Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Course Name
                </label>
                <p className="text-gray-900">{revenueRecord.courseName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Category
                </label>
                <p className="text-gray-900">{revenueRecord.categoryName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tutor Name
                </label>
                <p className="text-gray-900">{revenueRecord.tutorName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Course ID
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {revenueRecord.courseId}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Payment ID
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {revenueRecord.paymentId}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Payment Method
                </label>
                <p className="text-gray-900">{revenueRecord.paymentMethod}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Payment Date
                </label>
                <p className="text-gray-900">
                  {new Date(revenueRecord.paymentDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    revenueRecord.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : revenueRecord.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : revenueRecord.status === "refunded"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {revenueRecord.status.charAt(0).toUpperCase() +
                    revenueRecord.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              Financial Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <label className="text-sm font-medium text-gray-500">
                  Total Price
                </label>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{revenueRecord.price.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <label className="text-sm font-medium text-gray-500">
                  Admin Commission
                </label>
                <p className="text-2xl font-bold text-green-600">
                  ₹{revenueRecord.adminCommission.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <label className="text-sm font-medium text-gray-500">
                  Tutor Earnings
                </label>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{revenueRecord.tutorEarnings.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded border text-center">
              <p className="text-sm text-gray-600">
                Commission Rate:{" "}
                {(
                  (revenueRecord.adminCommission / revenueRecord.price) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function RevenueManagement() {
  const [revenues, setRevenues] = useState<RevenueRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRevenue, setSelectedRevenue] = useState<RevenueRecord | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  const transformRevenueData = (
    revenueData: AdminRevenueData
  ): RevenueRecord => {
    return {
      id: revenueData._id,
      userName: revenueData.userId.name,
      userEmail: revenueData.userId.email,
      userPhone: revenueData.userId.phone,
      userId: revenueData.userId._id,
      courseName: revenueData.courseId.title,
      courseId: revenueData.courseId._id,
      tutorName: revenueData.tutorId.name,
      tutorId: revenueData.tutorId._id,
      categoryName: revenueData.categoryId.name,
      price: revenueData.price,
      adminCommission: revenueData.adminCommission,
      tutorEarnings: revenueData.tutorEarnings,
      paymentDate: revenueData.dateOfEnrollment,
      paymentMethod: revenueData.paymentMethod,
      paymentId: revenueData.paymentId,
      status: revenueData.status as
        | "completed"
        | "pending"
        | "failed"
        | "refunded",
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
  }, [debouncedSearch, statusFilter, dateFilter]);

  const fetchRevenues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminRevenue(
        currentPage,
        debouncedSearch,
        statusFilter,
        dateFilter
      );
      const apiData: ApiResponse = response.data || {
        revenues: [],
        totalPages: 1,
        totalCount: 0,
        totalRevenue: 0,
        totalCommission: 0,
      };

      const transformedRevenues = apiData.revenues.map(transformRevenueData);
      setRevenues(transformedRevenues);
      setTotalPages(apiData.totalPages);
      setTotalCount(apiData.totalCount);
      setTotalRevenue(apiData.totalRevenue);
      setTotalCommission(apiData.totalCommission);
    } catch (err) {
      console.error("Failed to fetch revenue data:", err);
      setError("Failed to load revenue data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, dateFilter]);

  useEffect(() => {
    fetchRevenues();
  }, [fetchRevenues]);

  const handleViewDetails = (revenue: RevenueRecord) => {
    setSelectedRevenue(revenue);
    setIsModalOpen(true);
  };

  const columns: TableColumn<RevenueRecord>[] = [
    {
      key: "userName",
      title: "User Name",
      align: "left",
      width: "15%",
      render: (revenue: RevenueRecord) => (
        <div>
          <p className="font-medium text-gray-900">{revenue.userName}</p>
          <p className="text-sm text-gray-500">{revenue.userEmail}</p>
        </div>
      ),
    },
    {
      key: "courseName",
      title: "Course",
      align: "left",
      width: "20%",
      render: (revenue: RevenueRecord) => (
        <div>
          <p className="font-medium text-gray-900">{revenue.courseName}</p>
          <p className="text-sm text-gray-500">by {revenue.tutorName}</p>
        </div>
      ),
    },
    {
      key: "price",
      title: "Price",
      align: "right",
      width: "10%",
      render: (revenue: RevenueRecord) => (
        <span className="font-semibold text-gray-900">
          ₹{revenue.price.toFixed(2)}
        </span>
      ),
    },
    {
      key: "adminCommission",
      title: "Commission",
      align: "right",
      width: "10%",
      render: (revenue: RevenueRecord) => (
        <span className="font-semibold text-green-600">
          ₹{revenue.adminCommission.toFixed(2)}
        </span>
      ),
    },
    {
      key: "paymentDate",
      title: "Date",
      align: "center",
      width: "12%",
      render: (revenue: RevenueRecord) => (
        <span className="text-gray-600">
          {new Date(revenue.paymentDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      align: "center",
      width: "10%",
      render: (revenue: RevenueRecord) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            revenue.status === "completed"
              ? "bg-green-100 text-green-800"
              : revenue.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : revenue.status === "refunded"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {revenue.status.charAt(0).toUpperCase() + revenue.status.slice(1)}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      align: "center",
      width: "10%",
      render: (revenue: RevenueRecord) => (
        <button
          onClick={() => handleViewDetails(revenue)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          View
        </button>
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
            Revenue Management
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
                onClick={fetchRevenues}
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Revenue Management
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Commission
                </p>
                <p className="text-2xl font-semibold text-green-600">
                  ₹{totalCommission.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6H8z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Transactions
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avg. Commission Rate
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalRevenue > 0
                    ? ((totalCommission / totalRevenue) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Table<RevenueRecord>
        data={revenues}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        searchPlaceholder="Search by user name, course, or tutor..."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={10}
        emptyMessage="No revenue data found"
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        }
        loadingMessage="Loading revenue data..."
        showSearch={true}
        getItemId={(revenue) => revenue.id}
        className="shadow-lg"
      />

      <PurchaseDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        revenueRecord={selectedRevenue}
      />
    </div>
  );
}

export default RevenueManagement;
