import React from 'react'
import { Routes,Route } from 'react-router-dom'
import LoginPage from '../pages/admin/LoginPage'
import DashboardPage from '../pages/admin/DashboardPage'
import { Toaster } from 'sonner';

function AdminRoutes() {
  return (
    <div>
      <Toaster richColors position="top-center"/>

      <Routes>
        <Route path='login' element={<LoginPage/>}/>
        <Route path='dashboard' element={<DashboardPage/>}/>
      </Routes>
    </div>
  )
}

export default AdminRoutes
