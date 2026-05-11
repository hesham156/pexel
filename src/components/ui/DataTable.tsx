"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";

export interface Column<T> {
  key: string;
  title: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  emptyMessage = "لا توجد بيانات",
  onSort,
  sortKey,
  sortDirection,
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    const dir = sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    onSort(key, dir);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-start font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap",
                  col.sortable && "cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-200",
                  col.className
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.title}
                  {col.sortable && (
                    <span className="flex flex-col">
                      <ChevronUp
                        className={cn(
                          "h-3 w-3 -mb-1",
                          sortKey === col.key && sortDirection === "asc"
                            ? "text-primary-500"
                            : "text-gray-300 dark:text-gray-600"
                        )}
                      />
                      <ChevronDown
                        className={cn(
                          "h-3 w-3",
                          sortKey === col.key && sortDirection === "desc"
                            ? "text-primary-500"
                            : "text-gray-300 dark:text-gray-600"
                        )}
                      />
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-16 text-center text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 text-gray-900 dark:text-gray-100", col.className)}>
                    {col.render
                      ? col.render((row as Record<string, unknown>)[col.key], row)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSizeSelector?: boolean;
  showGoTo?: boolean;
  showTotalItems?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showGoTo = true,
  showTotalItems = true,
}: PaginationProps) {
  const [goToValue, setGoToValue] = useState("");

  if (totalPages <= 0) return null;

  // Build visible page numbers with ellipsis
  const getVisiblePages = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const visiblePages = getVisiblePages();

  const handleGoTo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = parseInt(goToValue);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onPageChange(page);
        setGoToValue("");
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 px-1 select-none">
      {/* Total items info */}
      {showTotalItems && totalItems !== undefined && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          إجمالي{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">{totalItems}</span>
          {" "}عنصر
        </span>
      )}

      {/* Pages */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
            "text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed",
            "dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          )}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="hidden sm:inline">السابق</span>
        </button>

        {/* Page numbers */}
        {visiblePages.map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 py-1.5 text-sm text-gray-400 dark:text-gray-600"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={cn(
                "min-w-[36px] h-9 px-2 rounded-lg text-sm font-semibold transition-all duration-150",
                page === currentPage
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/30 scale-105"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              )}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
            "text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed",
            "dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          )}
        >
          <span className="hidden sm:inline">التالي</span>
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Go to page */}
        {showGoTo && totalPages > 1 && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <span className="whitespace-nowrap">اذهب إلى</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={goToValue}
              onChange={(e) => setGoToValue(e.target.value)}
              onKeyDown={handleGoTo}
              placeholder="#"
              className={cn(
                "w-14 h-8 px-2 rounded-lg border text-center text-sm font-medium",
                "border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              )}
            />
            <span className="whitespace-nowrap">صفحة</span>
          </div>
        )}

        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className={cn(
              "h-8 px-2 rounded-lg border text-sm font-medium cursor-pointer",
              "border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500",
              "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            )}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / صفحة
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
