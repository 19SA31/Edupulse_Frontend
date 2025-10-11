import { Outlet } from "react-router-dom";
import Header from "../../components/common/Header";
import ReusableSidebar from "../../components/common/Sidebar";
import { SidebarItem } from "../../interfaces/userInterface";
import {
  MdLibraryAdd,
  MdDashboard,
  MdPerson,
  MdMenuBook,
} from "react-icons/md";
import { FiClock } from "react-icons/fi";


function TutorLayout() {
  const tutorSidebarItems: SidebarItem[] = [
    {
      path: "/tutor/dashboard",
      label: "Dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
    },
    {
      path: "/tutor/dashboard/profile",
      label: "Profile",
      icon: <MdPerson className="w-5 h-5" />,
    },
    {
      path: "/tutor/dashboard/add-course",
      label: "Add Course",
      icon: <MdLibraryAdd className="w-5 h-5" />,
    },
    {
      path: "/tutor/dashboard/course-management",
      label: "Course Management",
      icon: <MdMenuBook className="w-5 h-5" />,
    },
    {
      path: "/tutor/dashboard/add-slot",
      label: "Add Slot",
      icon: <FiClock className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-10">
        <Header role="tutor" />
      </div>
      <div className="flex flex-1 pt-14">
        <ReusableSidebar
          sidebarItems={tutorSidebarItems}
          backgroundColor="bg-black"
          activeColor="text-yellow-400"
          hoverColor="hover:bg-gray-800"
          textColor="text-gray-300"
        />
        <main className="flex-1 ml-0 sm:ml-64 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default TutorLayout;
