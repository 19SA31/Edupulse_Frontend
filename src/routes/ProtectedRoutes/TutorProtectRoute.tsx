import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { useEffect, useState } from 'react';

interface TutorProtectRouteProps {
  children: React.ReactNode;
}

function TutorProtectRoute({ children }: TutorProtectRouteProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  // Access the tutor slice directly with careful null checking
  const tutorState = useSelector((state: RootState) => state.tutor);
  const isLoggedIn = tutorState && (tutorState.user !== null || tutorState.isAuthenticated);
  
  // Also check localStorage directly as a fallback
  const checkLocalStorageAuth = () => {
    const tutorData = localStorage.getItem('persist:tutor');
    if (tutorData) {
      try {
        const parsedData = JSON.parse(tutorData);
        const user = JSON.parse(parsedData.user || 'null');
        const isAuthenticated = JSON.parse(parsedData.isAuthenticated || 'false');
        return user !== null || isAuthenticated === true;
      } catch (error) {
        console.error('Error parsing tutor data from localStorage:', error);
        return false;
      }
    }
    return false;
  };

  console.log("tutor protect route - Redux state:", tutorState);
  console.log("tutor protect route - localStorage check:", checkLocalStorageAuth());
  
  useEffect(() => {
    // Short delay to ensure store is fully hydrated
    const authCheck = setTimeout(() => {
      const hasLocalAuth = checkLocalStorageAuth();
      
      // If not logged in according to both Redux and localStorage, redirect to login
      if (!isLoggedIn && !hasLocalAuth) {
        console.log("Not logged in, redirecting to login page");
        navigate('/tutor/', {
          state: { message: 'Authorization required' },
          replace: true,
        });
      }
      
      setIsChecking(false);
    }, 100);
    
    return () => clearTimeout(authCheck);
  }, [navigate, isLoggedIn, tutorState]);
  
  // Show nothing while checking auth status
  if (isChecking) {
    return null;
  }
  
  // After checking, if logged in by either Redux or localStorage, show children
  return (isLoggedIn || checkLocalStorageAuth()) ? <>{children}</> : null;
}

export default TutorProtectRoute;