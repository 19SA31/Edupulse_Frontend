import React from "react";

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
}

export interface TableAction<T> {
  label: string | ((item: T) => string);
  onClick: (item: T) => void;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | ((item: T) => "primary" | "secondary" | "danger" | "success");
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[] | ((item: T) => TableAction<T>[]);
  loading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearch?: () => void;
  searchPlaceholder?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (direction: "next" | "previous") => void;
  itemsPerPage?: number;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  showSearch?: boolean;
  loadingMessage?: string;
  className?: string;
  getItemId: (item: T) => string;
}

function Table<T>({
  data,
  columns,
  actions = [],
  loading = false,
  searchQuery = "",
  onSearchChange,
  onSearch,
  searchPlaceholder = "Search...",
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  emptyMessage = "No items found",
  emptyIcon,
  showSearch = true,
  loadingMessage = "Loading...",
  className = "",
  getItemId,
}: TableProps<T>) {
  const getButtonVariantClass = (variant: string = "primary") => {
    const variants = {
      primary: "bg-blue-500 hover:bg-blue-600 text-white",
      secondary: "bg-gray-500 hover:bg-gray-600 text-white",
      danger: "bg-red-500 hover:bg-red-600 text-white",
      success: "bg-green-500 hover:bg-green-600 text-white",
    };
    return variants[variant as keyof typeof variants] || variants.primary;
  };

  const renderCell = (item: T, column: TableColumn<T>) => {
    if (column.render) {
      return column.render(item);
    }

    const value = item[column.key as keyof T];
    return value as React.ReactNode;
  };

  const getAlignmentClass = (align: string = "left") => {
    return {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[align];
  };


  const getActionLabel = (action: TableAction<T>, item: T): string => {
    return typeof action.label === "function"
      ? action.label(item)
      : action.label;
  };

 
  const getActionVariant = (action: TableAction<T>, item: T): string => {
    return typeof action.variant === "function"
      ? action.variant(item)
      : action.variant || "primary";
  };

  const DefaultEmptyIcon = () => (
    <svg
      className="mx-auto h-12 w-12 text-gray-400"
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
  );

  return (
    <div
      className={`bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden ${className}`}
    >

      {showSearch && (
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex space-x-4 items-center w-full sm:w-auto ml-auto">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              className="text-sm px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 whitespace-nowrap"
              onClick={onSearch}
            >
              Search
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{loadingMessage}</p>
          </div>
        </div>
      ) : (
        <>

          {data && data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className={`py-3 px-6 border-b border-gray-300 text-gray-700 font-medium ${getAlignmentClass(
                          column.align
                        )}`}
                        style={{ width: column.width }}
                      >
                        {column.title}
                      </th>
                    ))}
                    {actions.length > 0 && (
                      <th className="py-3 px-6 border-b border-gray-300 text-center text-gray-700 font-medium">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr
                      key={getItemId(item)}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {columns.map((column, index) => (
                        <td
                          key={index}
                          className={`py-3 px-6 border-b border-gray-200 ${getAlignmentClass(
                            column.align
                          )}`}
                        >
                          {renderCell(item, column)}
                        </td>
                      ))}
                      {actions && (
                        <td className="py-3 px-6 border-b border-gray-200 text-center">
                          <div className="flex justify-center space-x-2">
                            {(typeof actions === "function"
                              ? actions(item)
                              : actions
                            ).map((action, actionIndex) => {
                              const label = getActionLabel(action, item);
                              const variant = getActionVariant(action, item);

                              return (
                                <button
                                  key={actionIndex}
                                  className={`px-3 py-1 rounded text-sm transition-colors ${getButtonVariantClass(
                                    variant
                                  )}`}
                                  onClick={() => action.onClick(item)}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (

            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {emptyIcon || <DefaultEmptyIcon />}
              </div>
              <p className="text-gray-600 text-lg mb-2">{emptyMessage}</p>
            </div>
          )}
        </>
      )}


      {data.length > 0 && (
        <div className="flex flex-col items-center py-6 border-t border-gray-200">
          <span className="text-sm text-slate-500 mb-4">
            Showing{" "}
            <span className="font-semibold text-gray-900">{data.length}</span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {totalPages * itemsPerPage}
            </span>{" "}
            Entries
          </span>

          <div className="inline-flex space-x-2">
            <button
              className={`flex items-center justify-center px-5 py-2 h-10 text-base font-medium ${
                currentPage === 1
                  ? "bg-slate-500 text-gray-100 cursor-not-allowed"
                  : "bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 text-white hover:scale-105 hover:shadow-xl hover:from-blue-600 hover:to-cyan-600"
              } rounded-l-md shadow-lg transform transition duration-300 ease-in-out`}
              onClick={() => onPageChange("previous")}
              disabled={currentPage === 1}
            >
              <svg
                className="w-4 h-4 mr-2 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 5H1m0 0 4 4M1 5l4-4"
                />
              </svg>
              Prev
            </button>

            <button
              className={`flex items-center justify-center px-5 py-2 h-10 text-base font-medium ${
                currentPage === totalPages
                  ? "bg-slate-500 text-gray-100 cursor-not-allowed"
                  : "bg-gradient-to-br from-gray-800 via-gray-600 to-gray-700 text-white hover:scale-105 hover:shadow-xl hover:from-cyan-600 hover:to-blue-600"
              } rounded-r-md shadow-lg transform transition duration-300 ease-in-out`}
              onClick={() => onPageChange("next")}
              disabled={currentPage === totalPages}
            >
              Next
              <svg
                className="w-4 h-4 ml-2 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
