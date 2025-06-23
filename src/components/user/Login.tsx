import React from "react";
import LoginForm from "../auth/LoginForm";
import { useNavigate } from "react-router-dom";

const UserLogin = () => {
  const navigate = useNavigate();
  return <LoginForm role="user" onLoginSuccess={() => navigate("/")} />;
};

export default UserLogin;
