import React from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import VerifyTutor from "../../components/tutor/VerifyTutor";

function VerifyTutorPage() {
  return (
    <div className="pt-14">
      <Header role="tutor" />
      <VerifyTutor />
      <Footer />
    </div>
  );
}

export default VerifyTutorPage;
