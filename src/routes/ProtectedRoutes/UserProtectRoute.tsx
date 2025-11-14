import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store";
import { useEffect, useState } from "react";

interface UserProtectRouteProps {
  children: React.ReactNode;
}

function UserProtectRoute({ children }: UserProtectRouteProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);


  const userState = useSelector((state: RootState) => state.user);
  const isLoggedIn =
    userState && (userState.user !== null || userState.isAuthenticated);


  const checkLocalStorageAuth = () => {
    const persistedData = localStorage.getItem("persist:user");
    if (persistedData) {
      try {
        const parsedData = JSON.parse(persistedData);
        const user = parsedData.user ? JSON.parse(parsedData.user) : null;
        const isAuthenticated = parsedData.isAuthenticated
          ? JSON.parse(parsedData.isAuthenticated)
          : false;

        return user !== null || isAuthenticated === true;
      } catch (error) {
        console.error("Error parsing localStorage:", error);
        return false;
      }
    }
    return false;
  };

  console.log("user protect route - Redux state:", userState);
  console.log(
    "user protect route - localStorage check:",
    checkLocalStorageAuth()
  );

  useEffect(() => {

    const authCheck = setTimeout(() => {
      const hasLocalAuth = checkLocalStorageAuth();


      if (!isLoggedIn && !hasLocalAuth) {
        console.log("Not logged in, redirecting to login page");
        navigate("/", {
          state: { message: "Authorization required" },
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


  return isLoggedIn || checkLocalStorageAuth() ? <>{children}</> : null;
}

export default UserProtectRoute;
