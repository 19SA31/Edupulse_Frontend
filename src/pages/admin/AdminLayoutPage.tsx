import Sidebar from "../../components/common/adminCommon/Sidebar";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default AdminLayout
