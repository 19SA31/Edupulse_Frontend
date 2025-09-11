import { Outlet } from "react-router-dom";
import Header from "../../components/common/Header";
import ReusableSidebar from "../../components/common/Sidebar";
import { SidebarItem } from "../../interfaces/adminInterface";
import { FiUploadCloud, FiBook } from "react-icons/fi";
import { FiDollarSign } from "react-icons/fi";

function AdminLayout() {
  const adminSidebarItems: SidebarItem[] = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
    },
    {
      path: "/admin/usersList",
      label: "Users",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    {
      path: "/admin/tutorsList",
      label: "Tutors",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
        </svg>
      ),
    },
    {
      path: "/admin/addCourseCategory",
      label: "Add Category",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      ),
    },
    {
      path: "/admin/tutorVerification",
      label: "Verify Tutor",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a3 3 0 110 6 3 3 0 010-6zm0 14.2a7.2 7.2 0 01-6-3.2c.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1a7.2 7.2 0 01-6 3.2zm7.71-9.21a1 1 0 10-1.42-1.42l-3.3 3.3-1.3-1.29a1 1 0 10-1.42 1.42l2 2a1 1 0 001.42 0l4-4z" />
        </svg>
      ),
    },
    {
      path: "/admin/coursePublish",
      label: "Publish Course",
      icon: <FiUploadCloud className="w-5 h-5" />,
    },
    {
      path: "/admin/courseManagement",
      label: "Manage Course",
      icon: <FiBook className="w-5 h-5" />,
    },
    {
      path: "/admin/revenueManagement",
      label: "Revenue Management",
      icon: <FiDollarSign className="w-5 h-5" />, 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header role="admin" />
      <div className="flex pt-14">
        <ReusableSidebar
          sidebarItems={adminSidebarItems}
          backgroundColor="bg-black"
          activeColor="text-yellow-400"
          hoverColor="hover:bg-gray-800"
          textColor="text-gray-300"
        />
        <div className="flex-1 ml-0 sm:ml-64 p-4 overflow-y-auto overflow-x-hidden h-screen">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
