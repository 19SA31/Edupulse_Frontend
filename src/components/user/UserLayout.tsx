import { Outlet } from "react-router-dom";
import Header from "../../components/common/Header";
import ReusableSidebar from "../../components/common/Sidebar";
import { SidebarItem } from "../../interfaces/userInterface";

function UserLayout() {
  const userSidebarItems: SidebarItem[] = [
    {
      path: "/profile",
      label: "Profile",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header role="user" />
      <div className="flex pt-14">
        <ReusableSidebar
          sidebarItems={userSidebarItems}
          backgroundColor="bg-black"
          activeColor="text-yellow-400"
          hoverColor="hover:bg-gray-800"
          textColor="text-gray-300"
        />
        <div className="flex-1 ml-0 sm:ml-64 p-4 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default UserLayout;
