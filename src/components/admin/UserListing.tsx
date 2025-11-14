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
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchUsers = async (page: number, search: string) => {
    try {
      setLoading(true);
      const response = await getUsers(page, search);

      if (response.data) {
        console.log("response.data", response.data);
        let usersData = [];
        let totalPages = 1;
        let totalCount = 0;

        if (response.data.response) {
          usersData = response.data.response.users || [];
          totalPages = response.data.response.totalPages || 1;
          totalCount = response.data.response.users?.length || 0;
        } else if (response.data.success && response.data.data) {
          usersData = response.data.data.users || [];
          totalPages = response.data.data.totalPages || 1;
          totalCount = response.data.data.users?.length || 0;
        } else {
          usersData = [];
          totalPages = 1;
          totalCount = 0;
        }

        setUsers(usersData);
        setTotalPages(totalPages);
        setTotalCount(totalCount);
      } else {
        setUsers([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized: Redirecting to login page.");
        await dispatch(logoutAdminAction());
        navigate("/admin/login");
      } else {
        console.error("Error fetching user details:", error);
        setUsers([]);
        setTotalCount(0);
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

  const handlePagination = (direction: "next" | "previous" | number) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "previous" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (typeof direction === "number") {
      setCurrentPage(direction);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
        <p className="text-gray-600">Manage Users</p>
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
        totalCount={totalCount}
        onPageChange={handlePagination}
        itemsPerPage={7}
        emptyMessage="No users found."
        loadingMessage="Loading Users..."
        getItemId={(user) => user.id}
      />

      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={
          selectedUser
            ? {
                id: selectedUser.id,
                name: selectedUser.name,
                email: selectedUser.email,
                phone: selectedUser.phone,
                avatar: selectedUser.avatar,
                createdAt: selectedUser.createdAt,
                isBlocked: selectedUser.isBlocked,
              }
            : null
        }
        title="User Details"
      />
    </div>
  );
}

export default UserListing;
