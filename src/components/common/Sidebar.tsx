import { NavLink } from "react-router-dom";
import { ReactNode, useState } from "react";
import { SidebarItem,SidebarProps } from "../../interfaces/adminInterface";



function ReusableSidebar({
  sidebarItems = [],
  backgroundColor = "bg-black",
  activeColor = "text-yellow-400",
  hoverColor = "hover:bg-gray-800",
  textColor = "text-gray-300",
}: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const safeSidebarItems = Array.isArray(sidebarItems) ? sidebarItems : [];
  console.log("safeSidebarItems",safeSidebarItems)

  return (
    <>

      <button
        type="button"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-20 left-4 z-50 inline-flex items-center p-2 text-sm text-gray-400 rounded-lg sm:hidden hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-600"
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>


      <aside
        className={`fixed top-14 left-0 z-40 w-64 h-screen pt-6 transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${backgroundColor} sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className={`h-full px-1 pb-4 overflow-y-auto ${backgroundColor}`}>
          <ul className="space-y-2 font-medium">
            {safeSidebarItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  end={item.path === "/tutor/dashboard"}
                  className={({ isActive }: { isActive: boolean }) =>
                    `flex items-center p-2 rounded-lg group ${
                      isActive
                        ? `bg-gray-800 ${activeColor}`
                        : `${textColor} ${hoverColor}`
                    }`
                  }
                  onClick={() => setIsSidebarOpen(false)} 
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`w-5 h-5 flex-shrink-0 transition duration-75 ${
                          isActive
                            ? activeColor
                            : "text-gray-400 group-hover:text-white"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1 ms-3 whitespace-nowrap">
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>


      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}

export default ReusableSidebar;