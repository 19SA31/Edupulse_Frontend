import Sidebar from "../../components/common/adminCommon/Sidebar";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default AdminLayout
