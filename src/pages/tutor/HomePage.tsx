import React, { useEffect, useState } from 'react'
import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import Banner from '../../components/common/Banner'

function HomePage() {
  const [userRole, setUserRole] = useState<"user" | "tutor" | null>(null);

  useEffect(() => {
    // Determine user role based on what's stored in localStorage
    const checkUserRole = () => {
      // Check for tutor authentication first
      const tutorAccessToken = localStorage.getItem("tutorAccessToken");
      const tutorData = localStorage.getItem("tutor");
      
      // Check for user authentication
      const userAccessToken = localStorage.getItem("userAccessToken");
      const userData = localStorage.getItem("user");
      

      
      if (tutorAccessToken && tutorData) {
        setUserRole("tutor");
        
      } else if (userAccessToken && userData) {
        setUserRole("user");
        
      } else {
        setUserRole(null);
        
      }
    };

    checkUserRole();
  }, []);

  console.log('🏠 HomePage rendering with userRole:', userRole);

  return (
    <div className="pt-14">
      <Header role={userRole} />
      <Banner/>
      <Footer />
    </div>
  )
}

export default HomePage