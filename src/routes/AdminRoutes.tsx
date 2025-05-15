import React from 'react'
import { Routes,Route } from 'react-router-dom'
import { Toaster } from 'sonner';
import LoginPage from '../pages/admin/LoginPage'
import DashboardPage from '../pages/admin/DashboardPage'
import AdminLayoutPage from '../pages/admin/AdminLayoutPage'
import UsersListPage from '../pages/admin/UserListPage'
import TutorsListPage from '../pages/admin/TutorListPage';
import AdminLoginProtectRoute from './ProtectedRoutes/AdminLoginProtectRoute';
import AdminProtectRoute from './ProtectedRoutes/AdminProtectRoute';

function AdminRoutes() {
  return (
    <div>
      <Toaster richColors position="top-center"/>

      <Routes>
        <Route path='login' element={<AdminLoginProtectRoute><LoginPage/></AdminLoginProtectRoute>}/>
        <Route path='/' element={<AdminProtectRoute><AdminLayoutPage/></AdminProtectRoute>}>
              <Route path='dashboard' element={<DashboardPage/>}/>
              <Route path='home' element={<AdminLayoutPage/>}/>
              <Route path='usersList' element={<UsersListPage/>}/>
              <Route path='tutorsList' element={<TutorsListPage/>}/>
        </Route>
        
      </Routes>
    </div>
  )
}

export default AdminRoutes
