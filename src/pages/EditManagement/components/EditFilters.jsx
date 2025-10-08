import { useState } from 'react';

/**
 * Edit Filters Component
 * Filter panel for Edit Management page
 */
const EditFilters = ({ filters, onFilterChange }) => {
  const [dateRange, setDateRange] = useState('All Time');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    if (value === 'Custom Range') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-red-400">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Decision Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
          <select
            className="w-full px-3 py-2 bg-white text-red-400 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.decision}
            onChange={(e) => onFilterChange({ ...filters, decision: e.target.value })}
          >
            <option>All Decisions</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Decision Pending</option>
            <option>Modified & Approved</option>
          </select>
        </div>

        {/* Provider Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
          <select
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.provider}
            onChange={(e) => onFilterChange({ ...filters, provider: e.target.value })}
          >
            <option>All Providers</option>
            <option>MOI Teaching and Referral Hospital</option>
            <option>Kenyatta National Hospital</option>
            <option>Aga Khan University Hospital</option>
            <option>The Nairobi Hospital</option>
          </select>
        </div>

        {/* Benefit Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Benefit Type</label>
          <select
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.benefitType}
            onChange={(e) => onFilterChange({ ...filters, benefitType: e.target.value })}
          >
            <option>All Benefit Types</option>
            <option>OPD</option>
            <option>DENTAL</option>
            <option>OPTICAL</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
          >
            <option>All Time</option>
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Custom Range</option>
          </select>

          {/* Custom Date Range Picker Tooltip */}
          {showDatePicker && dateRange === 'Custom Range' && (
            <div className="absolute z-20 bottom-full mb-2 left-0 w-72 p-4 bg-white border border-gray-300 rounded-lg shadow-lg space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="w-full px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Amount Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Min (KSh)"
              value={filters.amountMin}
              onChange={(e) => onFilterChange({ ...filters, amountMin: e.target.value })}
              className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Max (KSh)"
              value={filters.amountMax}
              onChange={(e) => onFilterChange({ ...filters, amountMax: e.target.value })}
              className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFilters;
