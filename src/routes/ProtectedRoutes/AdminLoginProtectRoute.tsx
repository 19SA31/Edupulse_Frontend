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
  
 
  const adminState = useSelector((state: RootState) => state.admin);
  const isLoggedIn = adminState && adminState.admin !== null;
  

  const checkLocalStorageAuth = () => {
    const adminData = localStorage.getItem('admin');
    return adminData !== null && adminData !== undefined;
  };

  console.log("protected route adminlogin - Redux state:", adminState);
  console.log("protected route adminlogin - localStorage check:", checkLocalStorageAuth());
  
  useEffect(() => {
    
    const authCheck = setTimeout(() => {
      const hasLocalAuth = checkLocalStorageAuth();
      
     
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
  
 
  if (isChecking) {
    return null;
  }
  

  return (!isLoggedIn && !checkLocalStorageAuth()) ? <>{children}</> : null;
}

export default AdminLoginProtectRoute;
