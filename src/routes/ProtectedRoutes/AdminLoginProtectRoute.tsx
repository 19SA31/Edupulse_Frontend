import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { useEffect, useState } from 'react';

interface LoginProtectRouteProps {
  children: React.ReactNode;
}

function AdminLoginProtectRoute({ children }: LoginProtectRouteProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  // Access the admin slice directly with careful null checking
  const adminState = useSelector((state: RootState) => state.admin);
  const isLoggedIn = adminState && adminState.admin !== null;
  
  // Also check localStorage directly as a fallback
  const checkLocalStorageAuth = () => {
    const adminData = localStorage.getItem('admin');
    return adminData !== null && adminData !== undefined;
  };

  console.log("protected route adminlogin - Redux state:", adminState);
  console.log("protected route adminlogin - localStorage check:", checkLocalStorageAuth());
  
  useEffect(() => {
    // Short delay to ensure store is fully hydrated
    const authCheck = setTimeout(() => {
      const hasLocalAuth = checkLocalStorageAuth();
      
      // If already logged in according to either Redux or localStorage, redirect to dashboard
      if (isLoggedIn || hasLocalAuth) {
        console.log("Already logged in, redirecting to dashboard");
        navigate('/admin/dashboard', {
          state: { message: 'Already logged in' },
          replace: true,
        });
      }
      
      setIsChecking(false);
    }, 100);
    
    return () => clearTimeout(authCheck);
  }, [navigate, isLoggedIn, adminState]);
  
  // Show nothing while checking auth status
  if (isChecking) {
    return null;
  }
  
  // After checking, if NOT logged in by both Redux and localStorage, show login page
  return (!isLoggedIn && !checkLocalStorageAuth()) ? <>{children}</> : null;
}

export default AdminLoginProtectRoute;
