import { NavLink } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { FaChalkboardTeacher } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import logo from "../../../assets/ep-logo.png";
import { logoutAdminAction } from "../../../redux/actions/adminActions";
import { AppDispatch } from "../../../redux/store";

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    try {
      await dispatch(logoutAdminAction());
      localStorage.removeItem("accessToken");
      localStorage.removeItem("admin");
      navigate("/admin/login", { replace: true });
      console.log("Logout successful, redirecting to login page");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-black border-b border-gray-900">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <button
                data-drawer-target="logo-sidebar"
                data-drawer-toggle="logo-sidebar"
                aria-controls="logo-sidebar"
                type="button"
                className="inline-flex items-center p-2 text-sm text-gray-400 rounded-lg sm:hidden hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-600"
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
              <a className="flex ms-18 md:me-24">
                <img src={logo} alt="Edupulse Logo" className="h-8" />
              </a>
            </div>
            <div className="flex items-center">
              <div className="flex items-center ms-3">
                <div>
                  <button
                    type="button"
                    className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-600"
                    aria-expanded="false"
                    data-dropdown-toggle="dropdown-user"
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="w-8 h-8 rounded-full"
                      src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                      alt="user photo"
                    />
                  </button>
                </div>
                <div
                  className="hidden z-50 my-4 text-base list-none bg-gray-800 divide-y divide-gray-700 rounded shadow"
                  id="dropdown-user"
                >
                  <div className="px-4 py-3" role="none">
                    <p className="text-sm text-white" role="none">
                      Neil Sims
                    </p>
                    <p
                      className="text-sm font-medium text-gray-300 truncate"
                      role="none"
                    >
                      neil.sims@flowbite.com
                    </p>
                  </div>
                  <ul className="py-1" role="none">
                    <li>
                      <NavLink
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        role="menuitem"
                      >
                        Dashboard
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        role="menuitem"
                      >
                        Settings
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/earnings"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        role="menuitem"
                      >
                        Earnings
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/logout"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        role="menuitem"
                      >
                        Sign out
                      </NavLink>
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  className="ml-4 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <aside
        id="logo-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-black sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-1 pb-4 overflow-y-auto bg-black">
          <ul className="space-y-2 font-medium">
            <li>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }: { isActive: boolean }) =>
                  `group-hover:text-yellow-400 flex items-center p-2 rounded-lg group  ${
                    isActive
                      ? "bg-gray-800 text-yellow-400"
                      : "text-gray-300 hover:bg-gray-800"
                  }`
                }
              >
                <svg
                  className={`w-5 h-5 transition duration-75 ${(
                    isActive: boolean
                  ) =>
                    isActive
                      ? "text-yellow-400"
                      : "text-gray-400 group-hover:text-white"}`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ms-3">Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/tutorsList"
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center p-2 rounded-lg group ${
                    isActive
                      ? "bg-gray-800 text-yellow-400"
                      : "text-gray-300 hover:bg-gray-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <FaChalkboardTeacher
                      className={`w-5 h-5 flex-shrink-0 transition duration-75 ${
                        isActive
                          ? "text-yellow-400"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                    />
                    <span className="ms-3">Tutors</span>
                  </>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/usersList"
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center p-2 rounded-lg group ${
                    isActive
                      ? "bg-gray-800 text-yellow-400"
                      : "text-gray-300 hover:bg-gray-800"
                  }`
                }
              >
                <svg
                  className={`group-hover:text-yellow-400 flex-shrink-0 w-5 h-5 transition duration-75 ${(
                    isActive: boolean
                  ) =>
                    isActive
                      ? "text-yellow-400"
                      : "text-gray-400 group-hover:text-white"}`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 10C6.346 10 0 11.022 0 13v2.98C0 16.548 0 17 0 17h12c0 0 0-.452 0-1.02V13c0-1.978-6.346-3-8-3Zm6.5-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-1.882 1.598A5.028 5.028 0 0 1 16.048 12H20v4.98C20 16.548 20 17 20 17h-6v-1.02a5.992 5.992 0 0 0-1.382-4.382Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Users</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/addCourseCategory"
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center p-2 rounded-lg group ${
                    isActive
                      ? "bg-gray-800 text-yellow-400"
                      : "text-gray-300 hover:bg-gray-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <FaPlus
                      className={`w-5 h-5 flex-shrink-0 transition duration-75 ${
                        isActive
                          ? "text-yellow-400"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                    />
                    <span className="flex-1 ms-3 whitespace-nowrap">
                      Add Course
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
