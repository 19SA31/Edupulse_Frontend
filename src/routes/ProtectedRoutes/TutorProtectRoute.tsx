import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store";
import { useEffect, useState } from "react";

interface TutorProtectRouteProps {
  children: React.ReactNode;
}

function TutorProtectRoute({ children }: TutorProtectRouteProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  const tutorState = useSelector((state: RootState) => state.tutor);
  const isLoggedIn =
    tutorState && (tutorState.user !== null || tutorState.isAuthenticated);

  const checkLocalStorageAuth = () => {
    const tutorData = localStorage.getItem("persist:tutor");
    if (tutorData) {
      try {
        const parsedData = JSON.parse(tutorData);
        const user = JSON.parse(parsedData.user || "null");
        const isAuthenticated = JSON.parse(
          parsedData.isAuthenticated || "false"
        );
        return user !== null || isAuthenticated === true;
      } catch (error) {
        console.error("Error parsing tutor data from localStorage:", error);
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    const authCheck = setTimeout(() => {
      const hasLocalAuth = checkLocalStorageAuth();

      if (!isLoggedIn && !hasLocalAuth) {
        navigate("/tutor/", {
          state: { message: "Authorization required" },
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

  return isLoggedIn || checkLocalStorageAuth() ? <>{children}</> : null;
}

export default TutorProtectRoute;
