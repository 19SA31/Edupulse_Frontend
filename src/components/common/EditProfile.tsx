import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Camera,
  User,
  Phone,
  Calendar,
  Users,
  Loader,
  RotateCcw,
  Check,
  Upload,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { updateUserProfile } from "../../services/userService";
import { updateTutorProfile } from "../../services/tutorService";
import img from "../../assets/unknown-user.jpg";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    DOB?: string;
    gender?: string;
    avatar?: string;
  };
  role: "user" | "tutor";
  onProfileUpdate?: (updatedData: any) => void;
}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FormValues {
  name: string;
  phone: string;
  DOB: string;
  gender: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters")
    .required("Name is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Please enter exactly 10 digits")
    .required("Phone number is required"),
  DOB: Yup.date()
    .max(new Date(), "Date of birth cannot be in the future")
    .test("age", "You must be at least 13 years old", function (value) {
      if (!value) return true;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        return age - 1 >= 13;
      }
      return age >= 13;
    })
    .nullable(),
  gender: Yup.string()
    .oneOf(["male", "female", "other", ""], "Please select a valid gender")
    .nullable(),
});

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userData,
  role,
  onProfileUpdate,
}) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    userData?.avatar || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropData, setCropData] = useState<CropData>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [finalCropData, setFinalCropData] = useState<CropData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({
    width: 0,
    height: 0,
  });
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<HTMLDivElement>(null);

  const initialValues: FormValues = {
    name: userData?.name || "",
    phone: userData?.phone || "",
    DOB: userData?.DOB
      ? new Date(userData.DOB).toISOString().split("T")[0]
      : "",
    gender: userData?.gender || "",
  };

  useEffect(() => {
    if (isOpen) {
      setAvatarPreview(userData?.avatar || "");
      setAvatarFile(null);
      setShowCropper(false);
      setFinalCropData(null);
      setUploadProgress(0);
      setUploadStatus("");
      setError("");
    }
  }, [isOpen, userData]);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "File size too large. Maximum size is 10MB.",
      };
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "Invalid file type. Please upload JPEG, PNG, or WebP images.",
      };
    }

    if (file.name.length > 255) {
      return { isValid: false, error: "File name too long." };
    }

    return { isValid: true };
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setError("");
    setIsImageLoading(true);
    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
      setShowCropper(true);
      setIsImageLoading(false);
    };
    reader.onerror = () => {
      setIsImageLoading(false);
      setError("Error reading file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight, clientWidth, clientHeight } =
        imageRef.current;
      setImageNaturalSize({ width: naturalWidth, height: naturalHeight });

      const minDimension = Math.min(clientWidth, clientHeight);
      const size = minDimension * 0.8;
      const newCropData = {
        x: (clientWidth - size) / 2,
        y: (clientHeight - size) / 2,
        width: size,
        height: size,
      };
      setCropData(newCropData);

      console.log("Initial crop data set:", newCropData);
      console.log("Image natural size:", {
        width: naturalWidth,
        height: naturalHeight,
      });
      console.log("Image client size:", {
        width: clientWidth,
        height: clientHeight,
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !imageRef.current) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const imageRect = imageRef.current.getBoundingClientRect();

      setCropData((prev) => ({
        ...prev,
        x: Math.max(0, Math.min(prev.x + deltaX, imageRect.width - prev.width)),
        y: Math.max(
          0,
          Math.min(prev.y + deltaY, imageRect.height - prev.height)
        ),
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleCropConfirm = () => {
    if (imageRef.current && cropData.width > 0 && cropData.height > 0) {
      const { clientWidth, clientHeight } = imageRef.current;
      const scaleX = imageNaturalSize.width / clientWidth;
      const scaleY = imageNaturalSize.height / clientHeight;

      const finalCrop = {
        x: Math.round(cropData.x * scaleX),
        y: Math.round(cropData.y * scaleY),
        width: Math.round(cropData.width * scaleX),
        height: Math.round(cropData.height * scaleY),
      };

      setFinalCropData(finalCrop);
      console.log("Final crop data stored:", finalCrop);
      console.log("Original crop data:", cropData);
      console.log("Scale factors:", { scaleX, scaleY });
    }
    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setAvatarFile(null);
    setFinalCropData(null);
    setAvatarPreview(userData?.avatar || "");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    setIsLoading(true);
    setSubmitting(true);
    setUploadProgress(0);
    setUploadStatus("");
    setError("");

    try {
      const hasFormChanges = Object.keys(values).some(
        (key) => values[key as keyof FormValues] !== (userData as any)?.[key]
      );

      if (!hasFormChanges && !avatarFile) {
        setError("No changes to update");
        setIsLoading(false);
        setSubmitting(false);
        return;
      }

      const updateData: any = { ...values };

      if (avatarFile) {
        updateData.avatar = avatarFile;
        setUploadProgress(20);
        setUploadStatus("Preparing image for upload...");

        if (finalCropData) {
          updateData.cropData = finalCropData;
          console.log("Using stored crop data:", finalCropData);
        } else {
          console.log("No crop data available - using full image");
        }

        setUploadProgress(40);
        setUploadStatus("Uploading to S3...");
      }

      setUploadProgress(60);
      setUploadStatus("Processing profile data...");

      console.log("Submitting profile update with S3 upload:", updateData);

      console.log("=== DEBUG: Profile Update Data ===");
      console.log("updateData keys:", Object.keys(updateData));
      console.log("avatarFile exists:", !!avatarFile);
      console.log("avatarFile details:", {
        name: avatarFile?.name,
        type: avatarFile?.type,
        size: avatarFile?.size,
        lastModified: avatarFile?.lastModified,
      });
      console.log("cropData:", updateData.cropData);
      console.log("Full updateData:", updateData);

      if (updateData.avatar) {
        console.log("Avatar in updateData:", {
          isFile: updateData.avatar instanceof File,
          constructor: updateData.avatar.constructor.name,
          name: updateData.avatar.name,
          type: updateData.avatar.type,
          size: updateData.avatar.size,
        });
      }

      let response;
      if (role === "tutor") {
        response = await updateTutorProfile(updateData);
      } else {
        response = await updateUserProfile(updateData);
      }

      setUploadProgress(90);
      setUploadStatus("Finalizing update...");

      if (response.success) {
        setUploadProgress(100);
        setUploadStatus("Profile updated successfully!");

        const storageKey = role === "user" ? "user" : "tutor";
        const userKey = role === "user" ? "user" : "tutor";
        localStorage.setItem(
          storageKey,
          JSON.stringify(response.data[userKey])
        );

        if (onProfileUpdate) {
          onProfileUpdate(response.data[userKey]);
        }

        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      if (error.message?.includes("timeout")) {
        setError("Upload timeout. Please check your connection and try again.");
      } else if (error.message?.includes("413")) {
        setError("File too large. Please select a smaller image.");
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus("");
      }, 2000);
    }
  };

  const handleClose = (values: FormValues, dirty: boolean) => {
    const hasAvatarChange = avatarFile !== null;

    if ((dirty || hasAvatarChange) && !isLoading) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to close?"
        )
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, isSubmitting, dirty }) => (
            <Form>
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  Edit Profile
                </h2>
                <button
                  type="button"
                  onClick={() => handleClose(values, dirty)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  <X size={24} />
                </button>
              </div>

              {showCropper && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-60">
                  <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      <ImageIcon size={20} className="inline mr-2" />
                      Crop Your Image
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Drag the selection box to crop your image. The image will
                      be processed on our servers using Sharp.
                    </p>

                    {isImageLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <Loader
                          className="animate-spin text-blue-500"
                          size={32}
                        />
                        <span className="ml-2 text-gray-300">
                          Loading image...
                        </span>
                      </div>
                    ) : (
                      <div className="relative mb-4">
                        {avatarPreview && (
                          <img
                            ref={imageRef}
                            src={avatarPreview}
                            alt="Crop preview"
                            className="w-full h-64 object-contain bg-gray-700 rounded"
                            onLoad={handleImageLoad}
                          />
                        )}

                        {cropData.width > 0 && (
                          <div
                            ref={cropperRef}
                            className="absolute border-2 border-blue-500 cursor-move z-30 shadow-lg bg-blue-500/10"
                            style={{
                              left: `${cropData.x}px`,
                              top: `${cropData.y}px`,
                              width: `${cropData.width}px`,
                              height: `${cropData.height}px`,
                            }}
                            onMouseDown={handleMouseDown}
                          >
                            <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              Drag to move
                            </div>

                            <div className="absolute top-0 left-0 w-3 h-3 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 rounded-full -translate-x-1/2 translate-y-1/2"></div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full translate-x-1/2 translate-y-1/2"></div>
                          </div>
                        )}

                        {cropData.width > 0 && (
                          <div className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none">
                            <div
                              className="absolute left-0 w-full bg-black bg-opacity-60"
                              style={{ height: `${cropData.y}px` }}
                            />

                            <div
                              className="absolute left-0 w-full bg-black bg-opacity-60"
                              style={{
                                top: `${cropData.y + cropData.height}px`,
                                bottom: 0,
                              }}
                            />

                            <div
                              className="absolute top-0 bg-black bg-opacity-60"
                              style={{
                                left: 0,
                                width: `${cropData.x}px`,
                                height: `${cropData.height}px`,
                                top: `${cropData.y}px`,
                              }}
                            />

                            <div
                              className="absolute top-0 bg-black bg-opacity-60"
                              style={{
                                left: `${cropData.x + cropData.width}px`,
                                right: 0,
                                height: `${cropData.height}px`,
                                top: `${cropData.y}px`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={handleCropCancel}
                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center gap-2"
                        disabled={isImageLoading}
                      >
                        <RotateCcw size={16} />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCropConfirm}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        disabled={isImageLoading}
                      >
                        <Check size={16} />
                        Confirm Crop
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle
                      size={20}
                      className="text-red-500 flex-shrink-0"
                    />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}

                {isLoading && uploadProgress > 0 && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300 flex items-center gap-2">
                        <Upload size={16} />
                        {uploadStatus || "Processing..."}
                      </span>
                      <span className="text-sm text-blue-400">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full mx-auto overflow-hidden border-2 border-gray-600">
                      <img
                        src={avatarPreview || img}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Click camera to change avatar
                  </p>
                  <p className="text-gray-500 text-xs">
                    Max 10MB • JPEG/PNG/WebP • Secure S3 storage
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <User size={16} className="inline mr-2" />
                    Name *
                  </label>
                  <Field
                    name="name"
                    type="text"
                    disabled={isLoading}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                      errors.name && touched.name
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-400 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userData?.email || ""}
                    disabled
                    className="w-full px-4 py-3 bg-gray-600 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <Phone size={16} className="inline mr-2" />
                    Phone * (10 digits)
                  </label>
                  <Field
                    name="phone"
                    type="tel"
                    disabled={isLoading}
                    maxLength={10}
                    placeholder="Enter 10 digit phone number"
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                      errors.phone && touched.phone
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  />
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="text-red-400 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Date of Birth
                  </label>
                  <Field
                    name="DOB"
                    type="date"
                    disabled={isLoading}
                    max={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                      errors.DOB && touched.DOB
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  />
                  <ErrorMessage
                    name="DOB"
                    component="div"
                    className="text-red-400 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <Users size={16} className="inline mr-2" />
                    Gender
                  </label>
                  <Field
                    as="select"
                    name="gender"
                    disabled={isLoading}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                      errors.gender && touched.gender
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Field>
                  <ErrorMessage
                    name="gender"
                    component="div"
                    className="text-red-400 text-sm mt-1"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => handleClose(values, dirty)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || isSubmitting}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader size={16} className="animate-spin" />}
                    {isLoading ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditProfileModal;
