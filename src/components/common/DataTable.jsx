import { useState } from 'react';

/**
 * Reusable Data Table Component
 * @param {Object} props
 * @param {Array} props.columns - Column definitions [{key, header, render}]
 * @param {Array} props.data - Table data
 * @param {number} props.rowsPerPage - Rows per page for pagination
 * @param {Function} props.onRowClick - Optional callback when row is clicked
 * @param {boolean} props.loading - Loading state
 * @param {number} props.currentPage - Current page (server-side pagination)
 * @param {number} props.totalPages - Total pages (server-side pagination)
 * @param {Function} props.onPageChange - Page change callback (server-side pagination)
 * @param {Function} props.onPageSizeChange - Page size change callback
 */
const DataTable = ({
  columns,
  data,
  rowsPerPage = 10,
  onRowClick,
  loading = false,
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  onPageChange,
  onPageSizeChange
}) => {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Use external pagination if provided, otherwise use internal
  const isServerPagination = onPageChange !== undefined;
  const currentPage = isServerPagination ? externalCurrentPage : internalCurrentPage;
  const setCurrentPage = isServerPagination ? onPageChange : setInternalCurrentPage;

  // Sorting logic
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = isServerPagination ? externalTotalPages : Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = isServerPagination ? sortedData : sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7; // Show max 7 page buttons

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);

      // Adjust if near start
      if (currentPage <= 3) {
        endPage = 5;
      }

      // Adjust if near end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider
                    ${column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable !== false && sortConfig.key === column.key && (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {sortConfig.direction === 'asc' ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                         cursor-pointer"
              value={rowsPerPage}
              onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
              disabled={!onPageSizeChange}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium
                         text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
              title="Previous page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors
                      ${currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium
                         text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
              title="Next page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
