import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom"; 
import {
  Upload,
  FileText,
  IdCard,
  Camera,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { tutorVerificationService } from "../../services/tutorService";

interface UploadedFile {
  file: File;
  preview: string;
}

interface FormValues {
  degree: UploadedFile | null;
  aadharFront: UploadedFile | null;
  aadharBack: UploadedFile | null;
}

const validationSchema = Yup.object({
  degree: Yup.mixed()
    .required("Degree certificate is required")
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return false;
      return (value as UploadedFile).file.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value) return false;
      return (value as UploadedFile).file.type.startsWith("image/");
    }),
  aadharFront: Yup.mixed()
    .required("Aadhar front side is required")
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return false;
      return (value as UploadedFile).file.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value) return false;
      return (value as UploadedFile).file.type.startsWith("image/");
    }),
  aadharBack: Yup.mixed()
    .required("Aadhar back side is required")
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return false;
      return (value as UploadedFile).file.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value) return false;
      return (value as UploadedFile).file.type.startsWith("image/");
    }),
});

function VerifyTutor() {
  const navigate = useNavigate(); // Add this hook
  
  const initialValues: FormValues = {
    degree: null,
    aadharFront: null,
    aadharBack: null,
  };

  const handleFileUpload = (
    file: File,
    setFieldValue: (field: string, value: any) => void,
    fieldName: string
  ) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload only image files (JPG, PNG, etc.)");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);

    setFieldValue(fieldName, { file, preview });
    toast.success("File uploaded successfully");
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    setFieldValue: (field: string, value: any) => void,
    fieldName: string
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file, setFieldValue, fieldName);
    }
  };

  const handleFileInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, setFieldValue, fieldName);
    }
  };

  const removeFile = (
    upload: UploadedFile,
    setFieldValue: (field: string, value: any) => void,
    fieldName: string
  ) => {
    URL.revokeObjectURL(upload.preview);
    setFieldValue(fieldName, null);
    toast.info("File removed");
  };

  // Updated handleSubmit function with redirect and localStorage update
  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    try {
      // Validate that all required files are present
      if (!values.degree || !values.aadharFront || !values.aadharBack) {
        toast.error("Please upload all required documents");
        return;
      }

      // Prepare documents for submission
      const documents = {
        degree: values.degree.file,
        aadharFront: values.aadharFront.file,
        aadharBack: values.aadharBack.file,
      };
      console.log("verify tutor ui", documents);
      
      // Call the verification service
      const result = await tutorVerificationService(documents);
      console.log("verifytutor front", result);
      
      if (result.success) {
        toast.success(
          "Verification documents submitted successfully! We will review your application and get back to you within 2-3 business days."
        );

        // Clean up preview URLs
        if (values.degree) URL.revokeObjectURL(values.degree.preview);
        if (values.aadharFront) URL.revokeObjectURL(values.aadharFront.preview);
        if (values.aadharBack) URL.revokeObjectURL(values.aadharBack.preview);

        // Update tutor data in localStorage to reflect verification status
        const tutorData = localStorage.getItem("tutor");
        if (tutorData) {
          try {
            const tutor = JSON.parse(tutorData);
            // Update verification status to pending (you can adjust this based on your backend response)
            tutor.verificationStatus = result.data.status; // 'pending'
            tutor.verificationId = result.data.verificationId;
            tutor.verificationSubmittedAt = result.data.submittedAt;
            
            // Save updated tutor data
            localStorage.setItem("tutor", JSON.stringify(tutor));
            
            // Trigger storage event for header to update
            window.dispatchEvent(new Event('userProfileUpdated'));
          } catch (error) {
            console.error("Error updating tutor data:", error);
          }
        }

        // Redirect to tutor dashboard
        navigate("/tutor");
      } else {
        toast.error(
          result.message || "Error submitting documents. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Verification submission error:", error);
      toast.error(
        error.message || "Error submitting documents. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const DocumentUpload = ({
    fieldName,
    title,
    icon: Icon,
    description,
    value,
    setFieldValue,
    error,
    touched,
  }: {
    fieldName: string;
    title: string;
    icon: React.ElementType;
    description: string;
    value: UploadedFile | null;
    setFieldValue: (field: string, value: any) => void;
    error?: string;
    touched?: boolean;
  }) => {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
        <div className="text-center">
          <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-4">{description}</p>

          {!value ? (
            <div
              onDrop={(e) => handleDrop(e, setFieldValue, fieldName)}
              onDragOver={(e) => e.preventDefault()}
              className="space-y-4"
            >
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileInput(e, setFieldValue, fieldName)
                    }
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={value.preview}
                  alt={title}
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeFile(value, setFieldValue, fieldName)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">
                  File uploaded successfully
                </span>
              </div>
              <p className="text-sm text-gray-500">{value.file.name}</p>
            </div>
          )}

          {error && touched && (
            <div className="mt-4 flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-black px-6 py-4">
            <h1 className="text-2xl font-bold text-white">
              Tutor Verification
            </h1>
            <p className="text-blue-100 mt-2">
              Upload your documents to verify your credentials and start
              teaching
            </p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isSubmitting, errors, touched }) => (
              <Form className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="md:col-span-2">
                    <DocumentUpload
                      fieldName="degree"
                      title="Degree Certificate"
                      icon={FileText}
                      description="Upload a clear image of your highest degree certificate"
                      value={values.degree}
                      setFieldValue={setFieldValue}
                      error={errors.degree}
                      touched={touched.degree}
                    />
                  </div>

                  <DocumentUpload
                    fieldName="aadharFront"
                    title="Aadhar Card - Front Side"
                    icon={IdCard}
                    description="Upload the front side of your Aadhar card"
                    value={values.aadharFront}
                    setFieldValue={setFieldValue}
                    error={errors.aadharFront}
                    touched={touched.aadharFront}
                  />

                  <DocumentUpload
                    fieldName="aadharBack"
                    title="Aadhar Card - Back Side"
                    icon={IdCard}
                    description="Upload the back side of your Aadhar card"
                    value={values.aadharBack}
                    setFieldValue={setFieldValue}
                    error={errors.aadharBack}
                    touched={touched.aadharBack}
                  />
                </div>

                <div className="border-t pt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Verification Guidelines
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <ul className="list-disc list-inside space-y-1">
                            <li>All documents must be clear and legible</li>
                            <li>
                              File size should not exceed 5MB per document
                            </li>
                            <li>
                              Verification process typically takes 2-3 business
                              days
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-black text-white font-semibold px-8 py-3 rounded-lg hover:text-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5 mr-2" />
                          Submit for Verification
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default VerifyTutor;