import React, { useState, useEffect, useCallback } from "react";
import Table, { TableColumn } from "../common/Table";
import { getAdminRevenue } from "../../services/adminService";
import PurchaseDetailsModal from "../common/PurchaseDetailsModal";
import { RevenueRecord } from "../../interfaces/revenueInterface";

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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const transformRevenueData = (enrollmentData: any): RevenueRecord => {
    return {
      id: enrollmentData._id,
      userName: enrollmentData.userId?.name || "N/A",
      userEmail: enrollmentData.userId?.email || "N/A",
      userPhone: enrollmentData.userId?.phone,
      userId: enrollmentData.userId?._id || "N/A",
      courseName: enrollmentData.courseId?.title || "N/A",
      courseId: enrollmentData.courseId?._id || "N/A",
      tutorName: enrollmentData.tutorId?.name || "N/A",
      tutorId: enrollmentData.tutorId?._id || "N/A",
      categoryName: enrollmentData.categoryId?.name || "N/A",
      price: enrollmentData.price || 0,
      adminCommission: enrollmentData.adminCommission || 0,
      tutorEarnings: enrollmentData.tutorEarnings || 0,
      paymentDate:
        enrollmentData.dateOfEnrollment ||
        enrollmentData.paymentDate ||
        new Date().toISOString(),
      paymentMethod: enrollmentData.paymentMethod || "N/A",
      paymentId: enrollmentData.paymentId || "N/A",
      status:
        (enrollmentData.status as "paid" | "pending" | "failed") || "pending",
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
  }, [
    debouncedSearch,
    statusFilter,
    startDate,
    endDate,
    sortBy,
  ]);

  const applyClientSideFiltersAndSort = (
    data: RevenueRecord[]
  ): RevenueRecord[] => {
    let filteredData = [...data];

    if (startDate || endDate) {
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.paymentDate);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && end) {
          return itemDate >= start && itemDate <= end;
        } else if (start) {
          return itemDate >= start;
        } else if (end) {
          return itemDate <= end;
        }
        return true;
      });
    }

    if (sortBy) {
      filteredData.sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return a.userName.localeCompare(b.userName);
          case "name-desc":
            return b.userName.localeCompare(a.userName);
          case "course-asc":
            return a.courseName.localeCompare(b.courseName);
          case "course-desc":
            return b.courseName.localeCompare(a.courseName);
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "date-asc":
            return (
              new Date(a.paymentDate).getTime() -
              new Date(b.paymentDate).getTime()
            );
          case "date-desc":
            return (
              new Date(b.paymentDate).getTime() -
              new Date(a.paymentDate).getTime()
            );
          default:
            return 0;
        }
      });
    }

    return filteredData;
  };

  const fetchRevenues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminRevenue(
        currentPage,
        debouncedSearch,
        statusFilter,
        ""
      );

      const responseData = response.data || response;

      if (responseData.enrollments) {
        const transformedRevenues =
          responseData.enrollments.map(transformRevenueData);

        const filteredRevenues =
          applyClientSideFiltersAndSort(transformedRevenues);
        setRevenues(filteredRevenues);

        const pagination = responseData.pagination || {};
        setTotalPages(pagination.totalPages || 1);
        setTotalCount(filteredRevenues.length);

        const calculatedTotalRevenue = filteredRevenues.reduce(
          (sum: number, item: RevenueRecord) => sum + item.price,
          0
        );
        const calculatedTotalCommission = filteredRevenues.reduce(
          (sum: number, item: RevenueRecord) => sum + item.adminCommission,
          0
        );

        setTotalRevenue(calculatedTotalRevenue);
        setTotalCommission(calculatedTotalCommission);
      } else if (responseData.revenues) {
        const transformedRevenues =
          responseData.revenues.map(transformRevenueData);
        const filteredRevenues =
          applyClientSideFiltersAndSort(transformedRevenues);
        setRevenues(filteredRevenues);
        setTotalPages(responseData.totalPages || 1);
        setTotalCount(filteredRevenues.length);
        setTotalRevenue(responseData.totalRevenue || 0);
        setTotalCommission(responseData.totalCommission || 0);
      } else {
        setRevenues([]);
        setTotalPages(1);
        setTotalCount(0);
        setTotalRevenue(0);
        setTotalCommission(0);
      }
    } catch (err) {
      console.error("Failed to fetch revenue data:", err);
      setError("Failed to load revenue data. Please try again.");
      setRevenues([]);
      setTotalPages(1);
      setTotalCount(0);
      setTotalRevenue(0);
      setTotalCommission(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    debouncedSearch,
    statusFilter,
    startDate,
    endDate,
    sortBy,
  ]);

  useEffect(() => {
    fetchRevenues();
  }, [fetchRevenues]);

  const handleViewDetails = (revenue: RevenueRecord) => {
    setSelectedRevenue(revenue);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setSortBy("");
    setSearchQuery("");
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
            revenue.status === "paid"
              ? "bg-green-100 text-green-800"
              : revenue.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : revenue.status === "failed"
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Revenue Management
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow ">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-lg font-semibold">₹</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow ">
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

          <div className="bg-white p-4 rounded-lg shadow ">
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
        </div>

        <div className="bg-white p-4 rounded-lg shadow  mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Filters & Sorting
            </h3>
            <button
              onClick={handleClearFilters}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Default</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="course-asc">Course (A-Z)</option>
                <option value="course-desc">Course (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="date-desc">Date (Newest First)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {(statusFilter || startDate || endDate || sortBy) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {statusFilter && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter("")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {sortBy && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Sort:{" "}
                    {sortBy
                      .replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                    <button
                      onClick={() => setSortBy("")}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {startDate && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    From: {new Date(startDate).toLocaleDateString()}
                    <button
                      onClick={() => setStartDate("")}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {endDate && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    To: {new Date(endDate).toLocaleDateString()}
                    <button
                      onClick={() => setEndDate("")}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
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