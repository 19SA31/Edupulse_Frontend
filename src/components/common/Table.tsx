import React from "react";
import { Search } from "lucide-react";

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
  totalCount?: number;
  onPageChange: (page: number) => void;
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
        <div className="bg-gray-600 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex space-x-4 items-center w-full sm:w-auto ml-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-lg border text-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
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
            <div className="overflow-x-auto max-w-full">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className={`py-3 px-4 border-b border-gray-300 text-gray-700 font-medium ${getAlignmentClass(
                          column.align
                        )} whitespace-nowrap`}
                        style={{
                          width: column.width || "200px",
                          maxWidth: "200px",
                        }}
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
                          className={`py-3 px-4 border-b border-gray-200 ${getAlignmentClass(
                            column.align
                          )} max-w-[200px] truncate whitespace-nowrap overflow-hidden`}
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
          <div className="flex items-center space-x-2">
            {(() => {
              const pages = [];
              const maxVisiblePages = 5;
              let startPage = Math.max(
                1,
                currentPage - Math.floor(maxVisiblePages / 2)
              );
              let endPage = Math.min(
                totalPages,
                startPage + maxVisiblePages - 1
              );

              if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
              }

              if (startPage > 1) {
                pages.push(
                  <button
                    key={1}
                    className={`flex items-center justify-center px-3 py-1 h-8 text-sm font-medium ${
                      currentPage === 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    } rounded-md shadow-sm min-w-[2rem]`}
                    onClick={() => onPageChange(1)}
                  >
                    1
                  </button>
                );

                if (startPage > 2) {
                  pages.push(
                    <span key="ellipsis-start" className="px-1">
                      ...
                    </span>
                  );
                }
              }

              for (let page = startPage; page <= endPage; page++) {
                pages.push(
                  <button
                    key={page}
                    className={`flex items-center justify-center px-3 py-1 h-8 text-sm font-medium ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    } rounded-md shadow-sm min-w-[2rem]`}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </button>
                );
              }

              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(
                    <span key="ellipsis-end" className="px-1">
                      ...
                    </span>
                  );
                }

                pages.push(
                  <button
                    key={totalPages}
                    className={`flex items-center justify-center px-3 py-1 h-8 text-sm font-medium ${
                      currentPage === totalPages
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    } rounded-md shadow-sm min-w-[2rem]`}
                    onClick={() => onPageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
