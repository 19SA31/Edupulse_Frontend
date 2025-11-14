import { Outlet } from "react-router-dom";
import Header from "../../components/common/Header";
import ReusableSidebar from "../../components/common/Sidebar";
import { SidebarItem } from "../../interfaces/userInterface";
import { HiUser, HiCreditCard, HiAcademicCap } from "react-icons/hi";

function UserLayout() {
  const userSidebarItems: SidebarItem[] = [
    {
      path: "/profile",
      label: "Profile",
      icon: <HiUser className="w-5 h-5" />,
    },
    {
      path: "/profile/payment-history",
      label: "Payment History",
      icon: <HiCreditCard className="w-5 h-5" />,
    },
    {
      path: "/profile/user-courses",
      label: "My Courses",
      icon: <HiAcademicCap className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header role="user" />
      <div className="flex pt-14 h-screen overflow-hidden">
        <ReusableSidebar
          sidebarItems={userSidebarItems}
          backgroundColor="bg-black"
          activeColor="text-yellow-400"
          hoverColor="hover:bg-gray-800"
          textColor="text-gray-300"
        />

        <div className="flex-1 ml-0 sm:ml-64 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default UserLayout;
