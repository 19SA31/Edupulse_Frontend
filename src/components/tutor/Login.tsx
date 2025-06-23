import React from "react";
import LoginForm from "../auth/LoginForm";
import { useNavigate } from "react-router-dom";

const TutorLogin = () => {
  const navigate = useNavigate();
  return <LoginForm role="tutor" onLoginSuccess={() => navigate("/tutor/")} />;
};

export default TutorLogin;
