import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { useEffect, useState } from 'react';

interface TutorLoginProtectRouteProps {
  children: React.ReactNode;
}

function TutorLoginProtectRoute({ children }: TutorLoginProtectRouteProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  

  const tutorState = useSelector((state: RootState) => state.tutor);
  const isLoggedIn = tutorState && (tutorState.user !== null || tutorState.isAuthenticated);
  

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

  console.log("protected route tutorlogin - Redux state:", tutorState);
  console.log("protected route tutorlogin - localStorage check:", checkLocalStorageAuth());
  
  useEffect(() => {

    const authCheck = setTimeout(() => {
      const hasLocalAuth = checkLocalStorageAuth();
      
    
      if (isLoggedIn || hasLocalAuth) {
        console.log("Already logged in, redirecting to dashboard");
        navigate('/tutor/', {
          state: { message: 'Already logged in' },
          replace: true,
        });
      }
      
      setIsChecking(false);
    }, 100);
    
    return () => clearTimeout(authCheck);
  }, [navigate, isLoggedIn, tutorState]);
  

  if (isChecking) {
    return null;
  }
  
 
  return (!isLoggedIn && !checkLocalStorageAuth()) ? <>{children}</> : null;
}

export default TutorLoginProtectRoute;