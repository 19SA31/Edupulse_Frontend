import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  BookOpen,
  User,
  Clock,
  Award,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import { fetchCourseDetails } from "../../services/userService";

interface EnrollmentData {
  _id: string;
  status: string;
  course?: {
    title: string;
    tutor: string;
  };
  enrollmentDate?: string;
}

interface PaymentSuccessProps {
  courseId?: string;
  sessionId?: string | null;
  paymentParam?: string | null;
  verifyPayment: (sessionId: string) => Promise<any>;
  onNavigate: (path: string) => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  courseId,
  sessionId,
  paymentParam,
  verifyPayment,
  onNavigate,
}) => {
  const [paymentStatus, setPaymentStatus] = useState<
    "loading" | "success" | "failed" | "cancelled"
  >("loading");
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(
    null
  );
  const [error, setError] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();

  const processPayment = async (isRetry = false) => {
    console.log("processPayment called with:", {
      paymentParam,
      sessionId,
      isRetry,
    });

    if (paymentParam === "cancelled") {
      console.log("Payment was cancelled");
      setPaymentStatus("cancelled");
      return;
    }

    if (paymentParam === "success" && sessionId) {
      try {
        if (isRetry) {
          setIsRetrying(true);
        } else {
          setPaymentStatus("loading");
        }

        console.log("Verifying payment with sessionId:", sessionId);
        const result = await verifyPayment(sessionId);
        console.log("Payment verification result:", result);

        if (result && result.success) {
          setPaymentStatus("success");
          setEnrollmentData(result.data);
          console.log(result.data);
          setError("");
          console.log("Payment verified successfully:", result.data);
        } else {
          console.error("Payment verification failed:", result);
          setPaymentStatus("failed");
          setError(result?.message || "Payment verification failed");
        }
      } catch (error: any) {
        console.error("Payment verification error:", error);
        setPaymentStatus("failed");

        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else if (error.message) {
          setError(error.message);
        } else {
          setError("An error occurred while verifying payment");
        }
      } finally {
        setIsRetrying(false);
      }
    } else {
      console.error("Invalid payment parameters:", { paymentParam, sessionId });
      setPaymentStatus("failed");
      setError(
        "Invalid payment parameters - missing session ID or payment status"
      );
    }
  };

  useEffect(() => {
    console.log("PaymentSuccess useEffect triggered with:", {
      courseId,
      sessionId,
      paymentParam,
    });

    if (courseId) {
      processPayment();
    } else {
      setPaymentStatus("failed");
      setError("Course ID not found");
    }
  }, [courseId, sessionId, paymentParam]);

  const handleRetryVerification = async () => {
    if (retryCount < 3 && sessionId) {
      console.log("Retrying payment verification, attempt:", retryCount + 1);
      setRetryCount((prev) => prev + 1);
      await processPayment(true);
    }
  };

  const handleGoToCourse = async (id?: string) => {
    try {
      const targetCourseId = id;
      if (!targetCourseId) {
        setError("Course ID missing, cannot navigate");
        return;
      }

      const courseDetails = await fetchCourseDetails(targetCourseId);
      navigate("/course-details", {
        state: {
          id,
          courseDetails,
        },
      });
    } catch (error) {
      console.error("Error fetching course details:", error);
      setError("Failed to load course details. Please try again.");
    }
  };

  const handleGoToMyCourses = () => {
    onNavigate("/course-listing");
  };

  const handleRetryPayment = () => {
    onNavigate(`/course/${courseId}`);
  };

  const isDevelopment = import.meta.env.DEV;

  if (paymentStatus === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6">
            {isRetrying ? (
              <RefreshCw className="w-full h-full text-green-600 animate-spin" />
            ) : (
              <Loader2 className="w-full h-full text-green-600 animate-spin" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isRetrying ? "Retrying Verification" : "Processing Payment"}
          </h2>
          <p className="text-gray-600">
            {isRetrying
              ? "Attempting to verify your payment again..."
              : "Please wait while we verify your payment..."}
          </p>
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">This may take a few moments</p>
            {retryCount > 0 && (
              <p className="text-xs text-green-600 mt-2">
                Retry attempt {retryCount}/3
              </p>
            )}
            {isDevelopment && (
              <div className="mt-4 text-xs text-gray-400 text-left">
                <p>Debug Info:</p>
                <p>Course ID: {courseId}</p>
                <p>Session ID: {sessionId}</p>
                <p>Payment Param: {paymentParam}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 text-green-500">
            <CheckCircle className="w-full h-full" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Payment Successful! 🎉
          </h1>

          <p className="text-lg text-gray-600 mb-2">
            Congratulations! You have successfully enrolled in the course.
          </p>

          {enrollmentData?.course && (
            <div className="bg-green-50 rounded-lg p-4 my-6">
              <h3 className="font-semibold text-green-800 mb-2">
                {enrollmentData.course.title}
              </h3>
              <p className="text-sm text-green-600">
                Instructor: {enrollmentData.course.tutor}
              </p>
              <div className="flex items-center justify-center space-x-2 text-green-700 mt-3">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Course Access Granted</span>
              </div>
            </div>
          )}

          <div className="space-y-3 mt-8">
            <button
              onClick={handleGoToMyCourses}
              className="w-full bg-yellow-300 text-black py-3 px-6 rounded-lg font-semibold hover:bg-yellow-400 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <User className="w-5 h-5" />
              <span>Go to My Courses</span>
            </button>

            <button
              onClick={() => handleGoToCourse(courseId!)}
              className="w-full border-2 border-green-400 text-black py-3 px-6 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>Start Learning Now</span>
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-800">
                Lifetime Access
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <Award className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-yellow-800">Certificate</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "cancelled") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 text-yellow-500">
            <XCircle className="w-full h-full" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Payment Cancelled
          </h2>

          <p className="text-gray-600 mb-6">
            You cancelled the payment process. No charges have been made to your
            account.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleRetryPayment}
              className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
            >
              Try Payment Again
            </button>

            <button
              onClick={() => handleGoToCourse(courseId!)}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Course</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 text-red-500">
          <XCircle className="w-full h-full" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Payment Verification Failed
        </h2>

        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 text-red-700 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error Details</span>
          </div>
          <p className="text-sm text-red-600">
            {error ||
              "There was an issue processing your payment. Please try again."}
          </p>
          {isDevelopment && (
            <div className="mt-3 text-xs text-red-500 text-left">
              <p>Debug Info:</p>
              <p>Course ID: {courseId}</p>
              <p>Session ID: {sessionId}</p>
              <p>Payment Param: {paymentParam}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {retryCount < 3 && sessionId && (
            <button
              onClick={handleRetryVerification}
              disabled={isRetrying}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Retrying...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Verification</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleRetryPayment}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Make New Payment
          </button>

          <button
            onClick={() => handleGoToCourse(courseId!)}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course</span>
          </button>
        </div>

        {retryCount >= 3 && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              Maximum retry attempts reached
            </p>
            <p className="text-xs text-yellow-700">
              Please contact support if the issue persists
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
