import { useEffect, useState } from "react";
import { UserDetails } from "../../interfaces/userInterface";
import { useNavigate } from "react-router-dom";
import { logoutAdminAction } from "../../redux/actions/adminActions";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { getTutors, listUnlistTutor } from "../../services/adminService";
import Table, { TableColumn, TableAction } from "../../components/common/Table";
import UserDetailsModal from "../../components/common/UserDetailsModal";

function TutorListing() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [tutors, setTutors] = useState<UserDetails[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTutor, setSelectedTutor] = useState<UserDetails | null>(null);

  const fetchTutors = async (page: number, search: string) => {
    try {
      setLoading(true);
      const response = await getTutors(page, search);

      if (response.data && response.data.success) {
        setTutors(response.data.data.tutors || []);
        setTotalPages(response.data.data.totalPages || 1);
      } else {
        setTutors([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized: Redirecting to login page.");
        await dispatch(logoutAdminAction());
        navigate("/admin/login");
      } else {
        console.error("Error fetching tutor details:", error);
        setTutors([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors(currentPage, searchQuery);
  }, [currentPage]);

  const toggleListState = async (id: string) => {
    try {
      await listUnlistTutor(id);
      setTutors((prevTutors) =>
        prevTutors.map((tutor) =>
          tutor.id === id ? { ...tutor, isBlocked: !tutor.isBlocked } : tutor
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
    fetchTutors(1, searchQuery);
  };

  const handleViewTutor = (tutor: UserDetails) => {
    setSelectedTutor(tutor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTutor(null);
  };

  // Define table columns
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
      render: (tutor) => (
        <button
          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
          onClick={() => handleViewTutor(tutor)}
        >
          View
        </button>
      ),
    },
  ];

  // Define table actions
  const actions: TableAction<UserDetails>[] = [
    {
      label: (tutor: UserDetails) => (tutor.isBlocked ? "List" : "Unlist"),
      onClick: (tutor) => toggleListState(tutor.id),
      variant: (tutor: UserDetails) => (tutor.isBlocked ? "success" : "danger"),
    },
  ];

  return (
    <div className="p-6 mt-4">
      <Table
        data={tutors}
        columns={columns}
        actions={actions}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        searchPlaceholder="Search Tutors"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePagination}
        itemsPerPage={7}
        emptyMessage="No tutors found."
        loadingMessage="Loading tutors..."
        getItemId={(tutor) => tutor.id}
      />

      {/* Tutor Details Modal */}
      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={selectedTutor ? {
          id: selectedTutor.id,
          name: selectedTutor.name,
          email: selectedTutor.email,
          phone: selectedTutor.phone,
          avatar: selectedTutor.avatar,
          createdAt: selectedTutor.createdAt,
          isBlocked: selectedTutor.isBlocked
        } : null}
        title="Tutor Details"
      />
    </div>
  );
}

export default TutorListing;