import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from '../pages/user/LoginPage'
import Register from '../pages/user/RegisterPage'
import VerifyOtp from '../pages/user/VerifyOtpPage'
import Dashboard from '../pages/user/DashboardPage'
import ForgotPassword from '../components/user/ForgotPassword'
import { Toaster } from 'sonner';
import PasswordUpdate from '../components/user/PasswordUpdate'

function UserRoutes() {
  return (
    <div>
      
      <Toaster richColors position="top-center"/>
      
      <Routes>
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />
        <Route path="verify-otp" element={<VerifyOtp />} />
        <Route path='dashboard' element={<Dashboard/>}/>
        <Route path='forgot-password' element={<ForgotPassword/>}/>
        <Route path='reset-password' element={<PasswordUpdate/>}/>
      </Routes>
    </div>
  )
}

export default UserRoutes;
