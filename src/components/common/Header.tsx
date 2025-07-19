import React, { useState, useEffect } from "react";
import logo from "../../assets/ep-logo.png";
import img from "../../assets/unknown-user.jpg";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { logout } from "../../redux/actions/userActions";
import { logoutTutorAction } from "../../redux/actions/tutorActions";
import { logoutAdminAction } from "../../redux/actions/adminActions";

interface HeaderProps {
  role?: "user" | "tutor" | "admin" | null;
}

function Header({ role = null }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const checkAuthStatus = () => {
    
    
    let accessToken = null;
    
    // Get the correct access token based on role
    if (role === "admin") {
      accessToken = localStorage.getItem("adminAccessToken");
    } else if (role === "tutor") {
      accessToken = localStorage.getItem("tutorAccessToken");
    } else {
      accessToken = localStorage.getItem("userAccessToken");
    }

    

    if (accessToken) {
      if (role === "admin") {
        setUserName("Admin");
        setIsLoggedIn(true);
        setUserImage(img);
        setIsVerified(true);
        setVerificationStatus(null);
        
      } else {
        let userData = null;
        if (role === "tutor") {
          userData = localStorage.getItem("tutor");
          
        } else {
          userData = localStorage.getItem("user");
          
        }

        if (userData && userData !== "undefined" && userData !== "null") {
          try {
            const user = JSON.parse(userData);
            
            
            setUserName(user?.name || "User");
            setIsLoggedIn(true);
            setUserImage(user?.avatar || ""); 
            
            // Check verification status for tutors
            if (role === "tutor") {
              setIsVerified(user?.isVerified || false);
              setVerificationStatus(user?.verificationStatus || null);
              
            } else {
              setIsVerified(true);
              setVerificationStatus(null);
            }
            
            
          } catch (error) {
            
            
            if (role === "tutor") {
              localStorage.removeItem("tutor");
              localStorage.removeItem("tutorAccessToken");
            } else {
              localStorage.removeItem("user");
              localStorage.removeItem("userAccessToken");
            }
            setIsLoggedIn(false);
            setIsVerified(true);
            setVerificationStatus(null);
          }
        } else {
          
          setIsLoggedIn(false);
          setIsVerified(true);
          setVerificationStatus(null);
        }
      }
    } else {
      
      setIsLoggedIn(false);
      setIsVerified(true);
      setVerificationStatus(null);
    }
    
    
  };

  useEffect(() => {
    
    checkAuthStatus();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      
      // Check if the changed key is relevant to our component
      if (
        e.key === "user" || 
        e.key === "tutor" || 
        e.key === "userAccessToken" || 
        e.key === "tutorAccessToken" || 
        e.key === "adminAccessToken"
      ) {
        
        checkAuthStatus();
      }
    };

    // Listen for custom storage events (for same-tab updates)
    const handleCustomStorageChange = () => {
      
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userProfileUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userProfileUpdated', handleCustomStorageChange);
    };
  }, [role]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🚪 Starting logout process for role:", role);

    try {
      if (role === "user") {
        localStorage.removeItem("userAccessToken");
        localStorage.removeItem("user");
        await dispatch(logout()).unwrap();
        navigate("/login");
      } else if (role === "tutor") {
        localStorage.removeItem("tutorAccessToken");
        localStorage.removeItem("tutor");
        await dispatch(logoutTutorAction()).unwrap();
        navigate("/tutor/login");
      } else if (role === "admin") {
        localStorage.removeItem("adminAccessToken");
        await dispatch(logoutAdminAction()).unwrap();
        navigate("/admin/login");
      }

      setIsLoggedIn(false);
      setUserName(null);
      setIsProfileOpen(false);
      setVerificationStatus(null);
      toast.success("Logged out successfully");
      
    } catch (error) {
      console.error("❌ Logout failed:", error);

      if (typeof error === "string" && error.includes("Successfully")) {
        setIsLoggedIn(false);
        setUserName(null);
        setIsProfileOpen(false);
        setVerificationStatus(null);
        toast.success("Logged out successfully");
        if (role === "tutor") {
          navigate("/tutor/login");
        } else if (role === "admin") {
          navigate("/admin/login");
        } else {
          navigate("/login");
        }
      } else {
        toast.error("Logout failed");
      }
    }
  };

  const getLoginPath = () => {
    if (role === "tutor") return "/tutor/login";
    if (role === "admin") return "/admin/login";
    return "/login";
  };

  const handleProfileOrVerify = () => {
    if (role === "tutor" && !isVerified && verificationStatus !== "pending") {
      navigate("/tutor/verify-tutor");
    } else {
      navigate("/profile");
    }
    setIsProfileOpen(false);
  };

  // Function to get the appropriate button text and status
  const getVerificationButtonText = () => {
    if (role === "tutor") {
      if (isVerified) {
        return "Profile";
      } else if (verificationStatus === "pending") {
        return "Verification Pending";
      } else if (verificationStatus === "rejected") {
        return "Resubmit Verification";
      } else {
        return "Verify";
      }
    }
    return "Profile";
  };

  // Function to check if verification button should be disabled
  const isVerificationDisabled = () => {
    return role === "tutor" && verificationStatus === "pending";
  };

  // Debug render
 

  // Admin header - with profile dropdown or simple logout button
  if (role === "admin") {
    return (
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center bg-black text-white p-4 shadow-xl">
        <div>
          <Link to="/admin/dashboard">
            <img src={logo} alt="Logo" className="w-max h-7" />
          </Link>
        </div>

        <div className="relative">
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to={getLoginPath()}
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded transition-colors duration-200"
            >
              Login
            </Link>
          )}
        </div>

        {isProfileOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsProfileOpen(false)}
          />
        )}
      </header>
    );
  }

  // Regular header for user and tutor roles
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center bg-black text-white p-4 shadow-xl">
      <div>
        <Link to="/">
          <img src={logo} alt="Logo" className="w-max h-7" />
        </Link>
      </div>

      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          {/* Add your menu icons here */}
        </button>
      </div>

      <nav
        className={`${
          isOpen ? "block" : "hidden"
        } md:flex md:space-x-8 absolute md:static bg-gray-800 md:bg-transparent w-full md:w-auto top-14 md:top-auto left-0 md:left-auto shadow-lg md:shadow-none`}
      >
        <ul className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8 p-4 md:p-0">
          <li>
            <Link
              to="/"
              className="hover:text-yellow-400 transition-colors duration-200"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/aboutUs"
              className="hover:text-yellow-400 transition-colors duration-200"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/tutors"
              className="hover:text-yellow-400 transition-colors duration-200"
            >
              Tutors
            </Link>
          </li>
          <li>
            <button className="hover:text-yellow-400 transition-colors duration-200">
              Services
            </button>
          </li>

          {/* Mobile auth section */}
          <li className="block md:hidden">
            {isLoggedIn ? (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={userImage || img}
                    alt="User"
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = img;
                    }}
                  />
                  <span className="text-white">{userName}</span>
                </div>
                <button
                  onClick={handleProfileOrVerify}
                  disabled={isVerificationDisabled()}
                  className={`transition-colors duration-200 ${
                    isVerificationDisabled()
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-blue-400 hover:text-blue-300"
                  }`}
                >
                  {getVerificationButtonText()}
                </button>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to={getLoginPath()}
                className="hover:text-yellow-400 transition-colors duration-200"
              >
                Login
              </Link>
            )}
          </li>
        </ul>
      </nav>

      {/* Desktop auth section */}
      <div className="relative hidden md:block">
        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors duration-200"
            >
              <img
                src={userImage || img}
                alt="User"
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = img;
                }}
              />
              <span className="text-white">{userName}</span>
              <svg
                className={`w-4 h-4 text-white transition-transform duration-200 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {isProfileOpen && (
              <div
                className="cursor-pointer absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleProfileOrVerify}
                  disabled={isVerificationDisabled()}
                  className={`w-full text-left px-4 py-2 border-b border-gray-700 text-sm transition-colors duration-200 ${
                    isVerificationDisabled()
                      ? "text-gray-500 cursor-not-allowed bg-gray-700"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {getVerificationButtonText()}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to={getLoginPath()}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded transition-colors duration-200"
          >
            Login
          </Link>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </header>
  );
}

export default Header;