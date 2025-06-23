import React, { useEffect, useState } from 'react'
import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import Banner from '../../components/common/Banner'

function HomePage() {
  const [userRole, setUserRole] = useState<"user" | "tutor" | null>(null);

  useEffect(() => {
    // Determine user role based on what's stored in localStorage
    const checkUserRole = () => {
      const accessToken = localStorage.getItem("accessToken");
      
      if (accessToken) {
        const userData = localStorage.getItem("user");
        const tutorData = localStorage.getItem("tutor");
        
        if (tutorData) {
          setUserRole("tutor");
        } else if (userData) {
          setUserRole("user");
        }
      }
    };

    checkUserRole();
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