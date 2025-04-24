import React from "react";
import LoginForm from "../auth/LoginForm";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  return <LoginForm role="admin" onLoginSuccess={() => navigate("/admin/dashboard")} />;
};

export default AdminLogin;
