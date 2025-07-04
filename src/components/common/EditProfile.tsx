import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, User, Phone, Calendar, Users, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { updateUserProfile } from '../../services/authService';
import img from '../../assets/unknown-user.jpg';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    name?: string;
    email?: string;
    phone?: string;
    DOB?: string;
    gender?: string;
    avatar?: string;
  };
  role: 'user' | 'tutor';
  onProfileUpdate?: (updatedData: any) => void;
}

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Please enter exactly 10 digits')
    .required('Phone is required'),
  DOB: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .nullable(),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other', ''], 'Please select a valid gender')
    .nullable(),
});

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userData,
  role,
  onProfileUpdate
}) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(userData?.avatar || img);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial form values
  const initialValues = {
    name: userData?.name || '',
    phone: userData?.phone || '',
    DOB: userData?.DOB ? userData.DOB.split('T')[0] : '',
    gender: userData?.gender || '',
  };

  // Reset form when modal opens with new userData
  useEffect(() => {
    if (isOpen && userData) {
      setAvatarPreview(userData.avatar || img);
      setAvatarFile(null);
    }
  }, [isOpen, userData]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
    try {
      setIsLoading(true);
      
      // Check if there are any changes
      const hasFormChanges = Object.keys(values).some(
        key => values[key as keyof typeof values] !== initialValues[key as keyof typeof initialValues]
      );
      
      if (!hasFormChanges && !avatarFile) {
        toast.info('No changes to update');
        return;
      }

      // Prepare update data with only changed fields
      const updateData: any = {};
      
      if (values.name !== initialValues.name) updateData.name = values.name;
      if (values.phone !== initialValues.phone) updateData.phone = values.phone;
      if (values.DOB !== initialValues.DOB) updateData.DOB = values.DOB;
      if (values.gender !== initialValues.gender) updateData.gender = values.gender;
      if (avatarFile) updateData.avatar = avatarFile;

      console.log("inside edit modal:", updateData);
      
      // Call the API service
      const result = await updateUserProfile(updateData);
      console.log(result);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        
        // Update local storage based on role
        const storageKey = role === 'user' ? 'user' : 'tutor';
        const currentData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const updatedData = { 
          ...currentData, 
          ...values,
          // If avatar was updated and returned from API, use that
          ...(result.data?.user && { avatar: result.data.user.avatar })
        };
        localStorage.setItem(storageKey, JSON.stringify(updatedData));
        
        // Dispatch custom event to notify other components (like Header)
        window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
          detail: { role, updatedData } 
        }));
        
        // Call parent callback if provided
        if (onProfileUpdate) {
          onProfileUpdate(updatedData);
        }
        
        onClose();
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleClose = (dirty: boolean) => {
    if (dirty && !isLoading) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
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
          enableReinitialize={true}
        >
          {({ dirty, isSubmitting, errors, touched }) => (
            <>
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
                <button
                  type="button"
                  onClick={() => handleClose(dirty || !!avatarFile)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <Form className="p-6 space-y-6">
                {/* Avatar Upload */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full mx-auto overflow-hidden border-2 border-gray-600">
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = img;
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <p className="text-gray-400 text-sm mt-2">Click camera to change avatar</p>
                </div>

                {/* Name Field */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <User size={16} className="inline mr-2" />
                    Name *
                  </label>
                  <Field
                    name="name"
                    type="text"
                    disabled={isLoading}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.name && touched.name ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  <ErrorMessage name="name" component="div" className="text-red-400 text-sm mt-1" />
                </div>

                {/* Email Field (Read-only) */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userData?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-600 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
                  />
                  <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
                </div>

                {/* Phone Field */}
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
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      // Allow only numbers
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'Clear', 'Copy', 'Paste'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      // Remove any non-numeric characters
                      const target = e.target as HTMLInputElement;
                      target.value = target.value.replace(/[^0-9]/g, '');
                    }}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.phone && touched.phone ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  <ErrorMessage name="phone" component="div" className="text-red-400 text-sm mt-1" />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Date of Birth
                  </label>
                  <Field
                    name="DOB"
                    type="date"
                    disabled={isLoading}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.DOB && touched.DOB ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  <ErrorMessage name="DOB" component="div" className="text-red-400 text-sm mt-1" />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <Users size={16} className="inline mr-2" />
                    Gender
                  </label>
                  <Field
                    name="gender"
                    as="select"
                    disabled={isLoading}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.gender && touched.gender ? 'border-red-500' : 'border-gray-600'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Field>
                  <ErrorMessage name="gender" component="div" className="text-red-400 text-sm mt-1" />
                </div>

                {/* Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => handleClose(dirty || !!avatarFile)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || isSubmitting || (!(dirty || avatarFile))}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader size={16} className="animate-spin" />}
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </Form>
            </>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditProfileModal;