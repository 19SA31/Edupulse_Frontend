import { useEffect, useState } from "react";
import { UserDetails } from "../../interfaces/userInterface";
import { useNavigate } from "react-router-dom";
import { logoutAdminAction } from "../../redux/actions/adminActions";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import {
  getTutorsForVerification,
  verifyTutor,
  rejectTutor,
} from "../../services/adminService";
import Table, { TableColumn, TableAction } from "../../components/common/Table";
import DocumentViewModal from "../../components/admin/DocumentViewModal";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface TutorWithDocuments {
  id: string;
  name: string;
  email: string;
  documents: {
    id: string;
    type: "avatar" | "degree" | "aadharFront" | "aadharBack";
    url: string;
    fileName: string;
    uploadedAt: string;
  }[];
  verificationStatus: "pending" | "verified" | "rejected";
  submittedAt: string;
  // Optional fields from UserDetails if needed
  userId?: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
  isBlocked?: boolean;
}

// Interface for the raw API response
interface RawTutorDoc {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorEmail: string;
  aadharFront: string;
  aadharBack: string;
  avatar: string;
  degree: string;
  verificationStatus: "pending" | "approved" | "rejected";
  submittedAt: string;
}

// Rejection form validation schema
const rejectionValidationSchema = Yup.object({
  reason: Yup.string()
    .trim()
    .min(10, "Reason must be at least 10 characters long")
    .max(500, "Reason must not exceed 500 characters")
    .required("Please provide a reason for rejection"),
});

// Rejection form initial values
interface RejectionFormValues {
  reason: string;
}

const initialRejectionValues: RejectionFormValues = {
  reason: "",
};

// Rejection Modal Component
interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  tutorName: string;
  loading: boolean;
}

const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tutorName,
  loading,
}) => {
  const handleSubmit = (values: RejectionFormValues) => {
    onConfirm(values.reason.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Reject Tutor Application
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={loading}
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

          <p className="text-gray-600 mb-4">
            You are about to reject the application for{" "}
            <strong>{tutorName}</strong>. Please provide a clear reason for the
            rejection.
          </p>

          <Formik
            initialValues={initialRejectionValues}
            validationSchema={rejectionValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isValid, dirty, values }) => (
              <Form>
                <div className="mb-4">
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Rejection Reason *
                  </label>
                  <Field
                    as="textarea"
                    id="reason"
                    name="reason"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    placeholder="Please provide a detailed reason for rejection..."
                    disabled={loading}
                  />
                  <ErrorMessage
                    name="reason"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {values.reason.length}/500 characters
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={loading || !isValid || !dirty}
                  >
                    {loading && (
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    )}
                    {loading ? "Rejecting..." : "Reject Application"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

function TutorVerification() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [tutors, setTutors] = useState<TutorWithDocuments[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isDocumentModalOpen, setIsDocumentModalOpen] =
    useState<boolean>(false);
  const [selectedTutorDocuments, setSelectedTutorDocuments] = useState<
    TutorWithDocuments["documents"]
  >([]);
  const [initialDocumentIndex, setInitialDocumentIndex] = useState<number>(0);

  // Rejection modal states
  const [isRejectionModalOpen, setIsRejectionModalOpen] =
    useState<boolean>(false);
  const [selectedTutorForRejection, setSelectedTutorForRejection] =
    useState<TutorWithDocuments | null>(null);
  const [rejectionLoading, setRejectionLoading] = useState<boolean>(false);

  const transformTutorData = (
    rawTutors: RawTutorDoc[]
  ): TutorWithDocuments[] => {
    return rawTutors.map((rawTutor) => {
      const documents = [];

      // Create document objects for each document type
      if (rawTutor.avatar) {
        documents.push({
          id: `${rawTutor.id}-avatar`,
          type: "avatar" as const,
          url: rawTutor.avatar,
          fileName: "avatar.png",
          uploadedAt: rawTutor.submittedAt,
        });
      }

      if (rawTutor.degree) {
        documents.push({
          id: `${rawTutor.id}-degree`,
          type: "degree" as const,
          url: rawTutor.degree,
          fileName: "degree.jpg",
          uploadedAt: rawTutor.submittedAt,
        });
      }

      if (rawTutor.aadharFront) {
        documents.push({
          id: `${rawTutor.id}-aadharFront`,
          type: "aadharFront" as const,
          url: rawTutor.aadharFront,
          fileName: "aadhar_front.png",
          uploadedAt: rawTutor.submittedAt,
        });
      }

      if (rawTutor.aadharBack) {
        documents.push({
          id: `${rawTutor.id}-aadharBack`,
          type: "aadharBack" as const,
          url: rawTutor.aadharBack,
          fileName: "aadhar_back.png",
          uploadedAt: rawTutor.submittedAt,
        });
      }

      return {
        id: rawTutor.tutorId, // Use tutorId as the main id
        name: rawTutor.tutorName,
        email: rawTutor.tutorEmail,
        documents,
        verificationStatus: rawTutor.verificationStatus,
        submittedAt: rawTutor.submittedAt,
        // Optional fields - you can add these if available in your API response
        userId: rawTutor.tutorId,
        phone: undefined, // Add if available in API
        avatar: rawTutor.avatar,
        createdAt: rawTutor.submittedAt,
        isBlocked: false, // Add logic if available in API
      } as TutorWithDocuments;
    });
  };

  const fetchTutorsForVerification = async (page: number, search: string) => {
    try {
      setLoading(true);
      const response = await getTutorsForVerification(page, search);

      console.log("tutor verific docs:", response);

      if (response && response.success) {
        // Transform the raw API data
        const rawTutors = response.data.tutorDocs || []; // Note: using tutorDocs not tutors
        const transformedTutors = transformTutorData(rawTutors);

        setTutors(transformedTutors);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setTutors([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized: Redirecting to login page.");
        await dispatch(logoutAdminAction());
        navigate("/admin/login");
      } else {
        console.error("Error fetching tutors for verification:", error);
        setTutors([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorsForVerification(currentPage, searchQuery);
  }, [currentPage]);

  const handleVerifyTutor = async (tutorId: string) => {
    try {
      await verifyTutor(tutorId);
      setTutors((prevTutors) =>
        prevTutors.map((tutor) =>
          tutor.id === tutorId
            ? { ...tutor, verificationStatus: "verified" as const }
            : tutor
        )
      );
    } catch (error) {
      console.error("Error verifying tutor:", error);
    }
  };

  const handleRejectTutor = async (tutorId: string, reason: string) => {
    try {
      setRejectionLoading(true);
      // You'll need to update your rejectTutor service to accept a reason parameter
      await rejectTutor(tutorId, reason);
      setTutors((prevTutors) =>
        prevTutors.map((tutor) =>
          tutor.id === tutorId
            ? { ...tutor, verificationStatus: "rejected" as const }
            : tutor
        )
      );
      setIsRejectionModalOpen(false);
      setSelectedTutorForRejection(null);
    } catch (error) {
      console.error("Error rejecting tutor:", error);
    } finally {
      setRejectionLoading(false);
    }
  };

  const handleOpenRejectionModal = (tutor: TutorWithDocuments) => {
    setSelectedTutorForRejection(tutor);
    setIsRejectionModalOpen(true);
  };

  const handleCloseRejectionModal = () => {
    setIsRejectionModalOpen(false);
    setSelectedTutorForRejection(null);
  };

  const handleConfirmRejection = (reason: string) => {
    if (selectedTutorForRejection) {
      handleRejectTutor(selectedTutorForRejection.id, reason);
    }
  };

  const handlePagination = (direction: "next" | "previous") => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "previous" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTutorsForVerification(1, searchQuery);
  };

  const handleViewDocuments = (
    tutor: TutorWithDocuments,
    documentIndex: number = 0
  ) => {
    setSelectedTutorDocuments(tutor.documents);
    setInitialDocumentIndex(documentIndex);
    setIsDocumentModalOpen(true);
  };

  const handleCloseDocumentModal = () => {
    setIsDocumentModalOpen(false);
    setSelectedTutorDocuments([]);
    setInitialDocumentIndex(0);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${
          statusStyles[status as keyof typeof statusStyles]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Define table columns
  const columns: TableColumn<TutorWithDocuments>[] = [
    {
      key: "name",
      title: "Name",
      align: "center",
    },
    {
      key: "email",
      title: "Email",
      align: "center",
    },
    {
      key: "submittedAt",
      title: "Submitted At",
      align: "center",
      render: (tutor: TutorWithDocuments) => (
        <span className="text-sm text-gray-600">
          {new Date(tutor.submittedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "documents",
      title: "Documents",
      align: "center",
      render: (tutor: TutorWithDocuments) => (
        <div className="flex justify-center">
          <button
            onClick={() => handleViewDocuments(tutor)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View
          </button>
        </div>
      ),
    },
  ];

  const getActions = (tutor: TutorWithDocuments): TableAction<TutorWithDocuments>[] => {
  if (tutor.verificationStatus === "pending") {
    return [
      {
        label: () => "Approve",
        onClick: () => handleVerifyTutor(tutor.id),
        variant: () => "success",
      },
      {
        label: () => "Reject",
        onClick: () => handleOpenRejectionModal(tutor),
        variant: () => "danger",
      },
    ];
  } else {
    return [
      {
        label: () =>
          tutor.verificationStatus === "verified" ? "Approved" : "Rejected",
        onClick: () => {}, // disabled or no-op
        variant: () => "secondary",
      },
    ];
  }
};


  const actions: TableAction<TutorWithDocuments>[] = [
    {
      label: (tutor: TutorWithDocuments) =>
        tutor.verificationStatus === "pending" ? "Approve" : "",
      onClick: (tutor: TutorWithDocuments) => handleVerifyTutor(tutor.id),
      variant: (tutor: TutorWithDocuments) =>
        tutor.verificationStatus === "pending" ? "success" : "primary",
    },
    {
      label: (tutor: TutorWithDocuments) =>
        tutor.verificationStatus === "pending" ? "Reject" : "",
      onClick: (tutor: TutorWithDocuments) => handleOpenRejectionModal(tutor),
      variant: (tutor: TutorWithDocuments) =>
        tutor.verificationStatus === "pending" ? "danger" : "primary",
    },
  ];

  return (
    <div className="p-6 mt-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tutor Verification</h1>
        <p className="text-gray-600 mt-2">
          Review and verify tutor submitted documents
        </p>
      </div>

      <Table
        data={tutors}
        columns={columns}
        actions={getActions}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        searchPlaceholder="Search Tutors"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePagination}
        itemsPerPage={7}
        emptyMessage="No tutors pending verification."
        loadingMessage="Loading tutors for verification..."
        getItemId={(tutor) => tutor.id}
      />

      {/* Enhanced Document View Modal */}
      <DocumentViewModal
        isOpen={isDocumentModalOpen}
        onClose={handleCloseDocumentModal}
        documents={selectedTutorDocuments}
        initialDocumentIndex={initialDocumentIndex}
      />

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={isRejectionModalOpen}
        onClose={handleCloseRejectionModal}
        onConfirm={handleConfirmRejection}
        tutorName={selectedTutorForRejection?.name || ""}
        loading={rejectionLoading}
      />
    </div>
  );
}

export default TutorVerification;
