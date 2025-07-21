import React, { useEffect, useState } from 'react'
import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import Banner from '../../components/common/Banner'

function HomePage() {
  const [userRole, setUserRole] = useState<"user" | "tutor" | "admin" | null>(null);

  useEffect(() => {
    
    const checkUserRole = () => {
      
      const adminToken = localStorage.getItem("adminAccessToken");
      if (adminToken) {
        setUserRole("admin");
        return;
      }

      
      const tutorToken = localStorage.getItem("tutorAccessToken");
      const tutorData = localStorage.getItem("tutor");
      if (tutorToken && tutorData) {
        setUserRole("tutor");
        return;
      }

      
      const userToken = localStorage.getItem("userAccessToken");
      const userData = localStorage.getItem("user");
      if (userToken && userData) {
        setUserRole("user");
        return;
      }

      
      setUserRole(null);
    };

    checkUserRole();

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "user" || 
        e.key === "tutor" || 
        e.key === "userAccessToken" || 
        e.key === "tutorAccessToken" || 
        e.key === "adminAccessToken"
      ) {
        checkUserRole();
      }
    };

    const handleCustomStorageChange = () => {
      checkUserRole();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userProfileUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userProfileUpdated', handleCustomStorageChange);
    };
  }, []);

  return (
    <div className="pt-14">
      <Header role={userRole} />
      <Banner/>
      <Footer />
    </div>
  )
}

export default HomePage