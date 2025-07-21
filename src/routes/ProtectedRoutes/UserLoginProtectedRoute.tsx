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

  const userState = useSelector((state: RootState) => state.user);
  const isLoggedIn = userState && (userState.user !== null || userState.isAuthenticated);
  

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

    const authCheck = setTimeout(() => {
      const hasLocalAuth = checkLocalStorageAuth();

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
  

  if (isChecking) {
    return null;
  }
  

  return (!isLoggedIn && !checkLocalStorageAuth()) ? <>{children}</> : null;
}

export default UserLoginProtectRoute;