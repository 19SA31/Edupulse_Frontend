import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from '../pages/tutor/LoginPage'
import Register from '../pages/tutor/RegisterPage'
import VerifyOtp from '../pages/tutor/VerifyOtpPage'
import Dashboard from '../pages/tutor/DashboardPage'
import ForgotPassword from '../components/tutor/ForgotPassword'
import { Toaster } from 'sonner';
import PasswordUpdate from '../components/tutor/PasswordUpdate'

function TutorRoutes() {
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

export default TutorRoutes
