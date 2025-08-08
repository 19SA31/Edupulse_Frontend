import { useEffect, useState } from "react";
import { UserDetails } from "../../interfaces/userInterface";
import { useNavigate } from "react-router-dom";
import { logoutAdminAction } from "../../redux/actions/adminActions";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { getUsers, listUnlistUser } from "../../services/adminService";
import Table, { TableColumn, TableAction } from "../../components/common/Table";
import UserDetailsModal from "../../components/common/UserDetailsModal";

function UserListing() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);

  const fetchUsers = async (page: number, search: string) => {
    try {
      setLoading(true);
      const response = await getUsers(page, search);
      
      if (response.data) {
        if (response.data.response) {
          setUsers(response.data.response.users || []);
          setTotalPages(response.data.response.totalPages || 1);
        } else if (response.data.success && response.data.data) {
          setUsers(response.data.data.users || []);
          setTotalPages(response.data.data.totalPages || 1);
        } else {
          setUsers([]);
          setTotalPages(1);
        }
      } else {
        setUsers([]);
        setTotalPages(1);
      }
      
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized: Redirecting to login page.");
        await dispatch(logoutAdminAction());
        navigate("/admin/login");
      } else {
        console.error("Error fetching user details:", error);
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchQuery);
  }, [currentPage]);

  const toggleListState = async (id: string) => {
    try {
      await listUnlistUser(id);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, isBlocked: !user.isBlocked } : user
        )
      );
    } catch (error) {
      console.error("Error toggling list state:", error);
    }
  };

  const handlePagination = (direction: "next" | "previous") => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "previous" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchQuery);
  };

  const handleViewUser = (user: UserDetails) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  console.log("frontend listing", users);


  const columns: TableColumn<UserDetails>[] = [
    {
      key: "name",
      title: "Name",
      align: "center",
    },
    {
      key: "email",
      title: "Email",
      align: "center",
    },
    {
      key: "view",
      title: "View Details",
      align: "center",
      render: (user) => (
        <button
          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
          onClick={() => handleViewUser(user)}
        >
          View
        </button>
      ),
    },
  ];


  const actions: TableAction<UserDetails>[] = [
    {
      label: (user: UserDetails) => (user.isBlocked ? "List" : "Unlist"),
      onClick: (user) => toggleListState(user.id), 
      variant: (user: UserDetails) => (user.isBlocked ? "success" : "danger"),
    },
  ];

  return (
    <div className="p-6 mt-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Users
        </h1>
        <p className="text-gray-600">
          Manage Users
        </p>
      </div>
      <Table
        data={users}
        columns={columns}
        actions={actions}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        searchPlaceholder="Search Users"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePagination}
        itemsPerPage={7}
        emptyMessage="No users found."
        loadingMessage="Loading Users..."
        getItemId={(user) => user.id} 
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser ? {
          id: selectedUser.id, 
          name: selectedUser.name,
          email: selectedUser.email,
          phone: selectedUser.phone,
          avatar: selectedUser.avatar,
          createdAt: selectedUser.createdAt,
          isBlocked: selectedUser.isBlocked
        } : null}
        title="User Details"
      />
    </div>
  );
}

export default UserListing;