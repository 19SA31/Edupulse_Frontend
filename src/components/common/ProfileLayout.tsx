import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, User, Mail, Phone, Calendar, Users as GenderIcon } from "lucide-react";
import img from "../../assets/unknown-user.jpg";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import EditProfileModal from "./EditProfile";

interface ProfileProps {
  role: "user" | "tutor" | "admin";
}

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  DOB?: string;
  gender?: string;
  avatar?: string;
}

interface Category {
  name?: string;
  description?: string;
}

const ProfileLayout: React.FC<ProfileProps> = ({ role }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const loadUserData = useCallback(() => {
    setIsLoading(true);
    try {
      if (role === "user") {
        const storedUser = localStorage.getItem("user");
        console.log("Loading user data:", storedUser);
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData({
            name: user?.name || null,
            email: user?.email || null,
            phone: user?.phone || null,
            DOB: user?.DOB || null,
            gender: user?.gender || null,
            avatar: user?.avatar || null,
          });
        } else {
          setUserData(null);
        }
      } else if (role === "tutor") {
        const storedTutor = localStorage.getItem("tutor");
        console.log("Loading tutor data:", storedTutor);
        if (storedTutor) {
          const tutor = JSON.parse(storedTutor);
          setUserData({
            name: tutor?.name || null,
            email: tutor?.email || null,
            phone: tutor?.phone || null,
            DOB: tutor?.DOB || null,
            gender: tutor?.gender || null,
            avatar: tutor?.avatar || null,
          });
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setAvatarError(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      setUserData(null);
      toast.error("Error loading profile data");
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleProfileUpdate = useCallback(() => {
    toast.success("Profile updated successfully!");
    
    setTimeout(() => {
      loadUserData();
    }, 100);
  }, [loadUserData]);

  const handleModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleAvatarError = useCallback(() => {
    setAvatarError(true);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderUserDetails = () => {
    if (role === "admin") {
      return (
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-white mb-4">
            Welcome Admin!
          </h1>
          <p className="text-lg text-gray-200 mb-6">
            You are now logged as admin to the dashboard. Feel free to explore.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="mb-6 text-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-600 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2 mx-auto mb-2"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-6">
        
        <div className="mb-6">
          <div className="w-24 h-24 rounded-full mx-auto overflow-hidden border-2 border-gray-500 shadow-lg">
            <img
              src={avatarError ? img : (userData?.avatar || img)}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={handleAvatarError}
            />
          </div>
        </div>

        
        <h1 className="text-2xl font-semibold text-white mb-6 text-center">
          Welcome{" "}
          {userData?.name ||
            `${role.charAt(0).toUpperCase() + role.slice(1)}`}
          !
        </h1>

        
        <div className="space-y-4">
          {userData?.name && (
            <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
              <User size={20} className="text-blue-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-gray-400 text-sm block">Name</span>
                <p className="text-white text-base font-medium truncate">{userData.name}</p>
              </div>
            </div>
          )}

          {userData?.email && (
            <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
              <Mail size={20} className="text-green-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-gray-400 text-sm block">Email</span>
                <p className="text-white text-base font-medium break-all">{userData.email}</p>
              </div>
            </div>
          )}

          {userData?.phone && (
            <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
              <Phone size={20} className="text-purple-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-gray-400 text-sm block">Phone</span>
                <p className="text-white text-base font-medium">{userData.phone}</p>
              </div>
            </div>
          )}

          {userData?.DOB && (
            <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
              <Calendar size={20} className="text-orange-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-gray-400 text-sm block">Date of Birth</span>
                <p className="text-white text-base font-medium">{formatDate(userData.DOB)}</p>
              </div>
            </div>
          )}

          {userData?.gender && (
            <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
              <GenderIcon size={20} className="text-pink-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-gray-400 text-sm block">Gender</span>
                <p className="text-white text-base font-medium capitalize">{userData.gender}</p>
              </div>
            </div>
          )}

          
          {(!userData?.name && !userData?.phone && !userData?.DOB && !userData?.gender) && (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">
                Complete your profile to get started!
              </p>
            </div>
          )}
        </div>

       
        <div className="mt-6">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Edit size={18} />
            Edit Profile
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-center items-center w-full min-h-screen p-4 bg-transparent">
        <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-lg">
          {renderUserDetails()}
        </div>
      </div>

      
      {(role === "user" || role === "tutor") && userData && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          userData={userData}
          role={role}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </>
  );
};

export default ProfileLayout;