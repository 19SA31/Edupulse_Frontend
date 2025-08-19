import React, { useState } from "react";
import Table, { TableColumn } from "../common/Table";


interface Payment {
  id: string;
  courseName: string;
  tutorName: string;
  price: number;
  paymentDate: string;
  status: "completed" | "pending" | "failed";
}

function PaymentHistory() {
  const [payments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading] = useState(false);


  const columns: TableColumn<Payment>[] = [
    {
      key: "courseName",
      title: "Course Name",
      align: "left",
      width: "300px",
    },
    {
      key: "tutorName", 
      title: "Tutor Name",
      align: "left",
      width: "200px",
    },
    {
      key: "price",
      title: "Price",
      align: "right",
      width: "120px",
      render: (payment: Payment) => (
        <span className="font-semibold text-green-600">
          ${payment.price.toFixed(2)}
        </span>
      ),
    },
    {
      key: "paymentDate",
      title: "Payment Date",
      align: "center", 
      width: "150px",
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
      width: "120px",
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
    if (direction === "next") {
      setCurrentPage(prev => prev + 1);
    } else {
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  };

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  const totalPages = Math.max(1, Math.ceil(payments.length / 10));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment History
        </h1>
        <p className="text-gray-600">
          View all your course payment transactions
        </p>
      </div>

      <Table<Payment>
        data={payments}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        searchPlaceholder="Search by course or tutor name..."
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
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2-2v6.5l.5 2L7 13h8a2 2 0 002-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 12h.01M8 21h8"
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