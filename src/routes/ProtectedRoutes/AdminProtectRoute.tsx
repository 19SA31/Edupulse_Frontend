import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store";
import { useEffect, useState } from "react";

interface AdminProtectRouteProps {
  children: React.ReactNode;
}

function AdminProtectRoute({ children }: AdminProtectRouteProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  const adminState = useSelector((state: RootState) => state.admin);
  const isLoggedIn = adminState && adminState.admin !== null;

  const checkLocalStorageAuth = () => {
    const adminData = localStorage.getItem("admin");
    return adminData !== null && adminData !== undefined;
  };

  useEffect(() => {
    const authCheck = setTimeout(() => {
      const hasLocalAuth = checkLocalStorageAuth();

      if (!isLoggedIn && !hasLocalAuth) {
        navigate("/admin/login", {
          state: { message: "Authorization required" },
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

  return isLoggedIn || checkLocalStorageAuth() ? <>{children}</> : null;
}

export default AdminProtectRoute;
