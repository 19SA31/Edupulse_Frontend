import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { logoutAdminAction } from "../../redux/actions/adminActions";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import {
  getCategories,
  addCategoryService,
  updateCategoryService,
  toggleCategoryStatus,
} from "../../services/adminService";
import { Category } from "../../interfaces/adminInterface";
import Table, { TableColumn, TableAction } from "../../components/common/Table";

function AddCourseCategory() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Category listing states
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .min(2, "Category name must be at least 2 characters")
        .required("Category name is required"),
      description: Yup.string()
        .trim()
        .min(10, "Description must be at least 10 characters")
        .required("Description is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        console.log(
          isEditMode ? "inside editcategory" : "inside addcategory",
          values
        );

        let response;
        if (isEditMode && editingCategoryId) {
          response = await updateCategoryService(
            editingCategoryId,
            values.name.trim(),
            values.description.trim()
          );
        } else {
          // Add new category
          response = await addCategoryService(
            values.name.trim(),
            values.description.trim()
          );
        }

        if (response.success) {
          resetForm();
          setIsEditMode(false);
          setEditingCategoryId(null);

          toast.success(
            isEditMode
              ? "Category updated successfully!"
              : "Category added successfully!"
          );

          await fetchCategories(currentPage, searchQuery);

          console.log(
            isEditMode
              ? "Category updated successfully:"
              : "Category added successfully:",
            response.data
          );
        }
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          console.error("Unauthorized: Redirecting to login page.");
          await dispatch(logoutAdminAction());
          navigate("/admin/login");
        } else {
          console.error(
            isEditMode ? "Error updating category:" : "Error adding category:",
            error
          );
          const message =
            error?.response?.data?.message ||
            error?.message ||
            `Failed to ${
              isEditMode ? "update" : "add"
            } category. Please try again.`;
          toast.error(message);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fetchCategories = async (page: number, search: string) => {
    try {
      setLoading(true);
      console.log("Fetching categories, page:", page, "search:", search);

      const response = await getCategories(page, search);
      console.log("Full response:", response);

      if (response.data && response.data.success && response.data.data) {
        // Fix: Change 'category' to 'categories'
        const { categories, totalPages } = response.data.data;

        setCategories(categories || []);
        setTotalPages(totalPages || 1);

        console.log("Categories set:", categories);
        console.log("Total pages:", totalPages);
      } else {
        console.log("Response unsuccessful or no data");
        setCategories([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized: Redirecting to login page.");
        await dispatch(logoutAdminAction());
        navigate("/admin/login");
      } else {
        console.error("Error fetching categories:", error);
        setCategories([]);
        toast.error("Failed to fetch categories");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage, searchQuery);
  }, [currentPage]);

  const toggleListState = async (id: string) => {
    try {
      console.log("Toggling category state:", id);

      const result = await toggleCategoryStatus(id);

      if (result.success) {
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category.id === id ? result.data : category
          )
        );
        toast.success(
          result.message || "Category status updated successfully!"
        );
      } else {
        throw new Error(result.message || "Failed to update category status");
      }
    } catch (error: any) {
      console.error("Error toggling category list state:", error);
      toast.error(error.message || "Failed to update category status");
    }
  };

  // Edit functionality
  const handleEditCategory = (category: Category) => {
    setIsEditMode(true);
    setEditingCategoryId(category.id);
    formik.setValues({
      name: category.name,
      description: category.description,
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePagination = (direction: string) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "previous" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCategories(1, searchQuery);
  };

  const handleReset = () => {
    formik.resetForm();
    setIsEditMode(false);
    setEditingCategoryId(null);
  };

  const categoryColumns: TableColumn<Category>[] = [
    {
      key: "name",
      title: "Name",
      align: "left",
      render: (category) => (
        <div className="font-medium text-gray-900">{category.name}</div>
      ),
    },
    {
      key: "description",
      title: "Description",
      align: "left",
      render: (category) => (
        <div
          className="text-gray-600 text-sm max-w-md truncate"
          title={category.description}
        >
          {category.description}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      align: "center",
      render: (category) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            category.isListed
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {category.isListed ? "Listed" : "Unlisted"}
        </span>
      ),
    },
  ];

  const categoryActions: TableAction<Category>[] = [
    {
      label: "Edit",
      onClick: (category) => handleEditCategory(category),
      variant: "primary",
    },
    {
      label: (category: Category) => (category.isListed ? "Unlist" : "List"),
      onClick: (category) => toggleListState(category.id),
      variant: (category: Category) =>
        category.isListed ? "danger" : "success",
    },
  ];

  return (
    <div className="p-3 mt-4">
      {/* Main content container with proper spacing */}
      <div className="pt-20 px-6 pb-6">
        {/* Add/Edit Category Form */}
        <div className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden mb-8">
          <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {isEditMode ? "Edit Category" : "Add New Category"}
            </h2>
          </div>

          <form onSubmit={formik.handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formik.touched.name && formik.errors.name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter category name"
                  disabled={formik.isSubmitting}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formik.touched.description && formik.errors.description
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter category description"
                  disabled={formik.isSubmitting}
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formik.isSubmitting}
              >
                {isEditMode ? "Cancel" : "Reset"}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Adding..."
                  : isEditMode
                  ? "Update Category"
                  : "Add Category"}
              </button>
            </div>
          </form>
        </div>

        {/* Category Listing Section */}
        <div className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">


          {loading ? (
            <div className="flex justify-center py-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading categories...</p>
              </div>
            </div>
          ) : (
            <>
              {categories && categories.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table
                    data={categories}
                    columns={categoryColumns}
                    actions={categoryActions}
                    loading={loading}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSearch={handleSearch}
                    searchPlaceholder="Search Categories"
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePagination}
                    itemsPerPage={10}
                    emptyMessage="No categories found"
                    emptyIcon={
                      <svg
                        className="mx-auto h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m14 0H4"
                        />
                      </svg>
                    }
                    loadingMessage="Loading categories..."
                    getItemId={(category) => category.id}
                    
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m14 0H4"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg mb-2">
                    No categories found
                  </p>
                  <p className="text-gray-500 text-sm">
                    Add a category using the form above
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddCourseCategory;
