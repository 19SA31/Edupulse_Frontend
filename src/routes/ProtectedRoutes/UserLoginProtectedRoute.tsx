import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { useEffect, useState } from 'react';

interface UserLoginProtectRouteProps {
  children: React.ReactNode;
}

function UserLoginProtectRoute({ children }: UserLoginProtectRouteProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  // Access the user slice directly with careful null checking
  const userState = useSelector((state: RootState) => state.user);
  const isLoggedIn = userState && (userState.user !== null || userState.isAuthenticated);
  
  // Also check localStorage directly as a fallback
  const checkLocalStorageAuth = () => {
    const userData = localStorage.getItem('persist:user');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        const user = JSON.parse(parsedData.user || 'null');
        const isAuthenticated = JSON.parse(parsedData.isAuthenticated || 'false');
        return user !== null || isAuthenticated === true;
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        return false;
      }
    }
    return false;
  };

  console.log("protected route userlogin - Redux state:", userState);
  console.log("protected route userlogin - localStorage check:", checkLocalStorageAuth());
  
  useEffect(() => {
    // Short delay to ensure store is fully hydrated
    const authCheck = setTimeout(() => {
      const hasLocalAuth = checkLocalStorageAuth();
      
      // If already logged in according to either Redux or localStorage, redirect to dashboard
      if (isLoggedIn || hasLocalAuth) {
        console.log("Already logged in, redirecting to dashboard");
        navigate('/', {
          state: { message: 'Already logged in' },
          replace: true,
        });
      }
      
      setIsChecking(false);
    }, 100);
    
    return () => clearTimeout(authCheck);
  }, [navigate, isLoggedIn, userState]);
  
  // Show nothing while checking auth status
  if (isChecking) {
    return null;
  }
  
  // After checking, if NOT logged in by both Redux and localStorage, show login page
  return (!isLoggedIn && !checkLocalStorageAuth()) ? <>{children}</> : null;
}

export default UserLoginProtectRoute;