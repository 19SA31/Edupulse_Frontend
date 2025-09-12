import React from "react";

import {
  RevenueRecord,
  PurchaseDetailsModalProps,
} from "../../interfaces/revenueInterface";

function PurchaseDetailsModal({
  isOpen,
  onClose,
  revenueRecord,
}: PurchaseDetailsModalProps) {
  if (!isOpen || !revenueRecord) return null;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
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
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-90 mb-3 flex items-center">
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
                    revenueRecord.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : revenueRecord.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : revenueRecord.status === "failed"
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

export default PurchaseDetailsModal;