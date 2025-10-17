import {useState, useEffect, useRef} from 'react';
import claimsService from '../../../services/claimsService';

/**
 * Edit Filters Component
 * Filter panel for Edit Management page
 */
const EditFilters = ({ filters, onFilterChange }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  // Local state for amount inputs to enable debouncing
  const [localAmountMin, setLocalAmountMin] = useState(filters.amountMin || '');
  const [localAmountMax, setLocalAmountMax] = useState(filters.amountMax || '');

  // Dropdown options state
  const [dropdownOptions, setDropdownOptions] = useState({
    providers: [],
    benefitTypes: [],
    decisions: []
  });
  const [loading, setLoading] = useState(true);

  // Searchable provider and benefit type states

    const [providerSearch, setProviderSearch] = useState('');
    const [benefitSearch, setBenefitSearch] = useState('');
    const [showProviderDropdown, setShowProviderDropdown] = useState(false);
    const [showBenefitDropdown, setShowBenefitDropdown] = useState(false);

    const providerRef = useRef(null);
    const benefitRef = useRef(null);

  //   When user will click outside then the dropdown should close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (providerRef.current && !providerRef.current.contains(e.target)){
                setShowProviderDropdown(false);
            }
            if (benefitRef.current && !benefitRef.current.contains(e.target)){
                setShowBenefitDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

  // Fetch dropdown options on component mount
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        setLoading(true);
        const response = await claimsService.getDropdownOptions();
 
        if (response.success && response.data) {
          setDropdownOptions({
            providers: response.data.providers || [],
            benefitTypes: response.data.benefit_types || [],
            decisions: response.data.decisions || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch dropdown options:', error);
        // Keep empty arrays as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownOptions();
  }, []);

  // Debounce amount filter updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({
        ...filters,
        amountMin: localAmountMin,
        amountMax: localAmountMax
      });
    }, 800); // 800ms debounce for amount inputs

    return () => clearTimeout(timeoutId);
  }, [localAmountMin, localAmountMax]);

  const handleDateRangeChange = (value) => {
    if (value === 'Custom Range') {
      setShowDatePicker(true);
      onFilterChange({ ...filters, dateRange: value });
    } else {
      setShowDatePicker(false);
      // Calculate date range for preset options
      const today = new Date();
      let startDate = '';
      let endDate = '';

      if (value !== 'All Time') {
        endDate = today.toISOString().split('T')[0]; // Today in YYYY-MM-DD

        if (value === 'Today') {
          startDate = endDate;
        } else if (value === 'Last 7 Days') {
          const last7Days = new Date(today);
          last7Days.setDate(last7Days.getDate() - 7);
          startDate = last7Days.toISOString().split('T')[0];
        } else if (value === 'Last 30 Days') {
          const last30Days = new Date(today);
          last30Days.setDate(last30Days.getDate() - 30);
          startDate = last30Days.toISOString().split('T')[0];
        }
      }

      // Update filters with calculated dates and dateRange
      onFilterChange({ ...filters, startDate, endDate, dateRange: value });
    }
  };

  const handleCustomDateApply = () => {
    setShowDatePicker(false);
    onFilterChange({
      ...filters,
      startDate: customDateRange.start,
      endDate: customDateRange.end,
      dateRange: 'Custom Range'
    });
  };

  // provider and benefit list filtered
    const filteredProviders = dropdownOptions.providers.filter((p) =>
        p.name.toLowerCase().includes(providerSearch.toLowerCase())
    );
    const filteredBenefits = dropdownOptions.benefitTypes.filter((b) =>
        b.label.toLowerCase().includes(benefitSearch.toLowerCase())
    );

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-black">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Decision Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Decision</label>
          <select
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.decision}
            onChange={(e) => onFilterChange({ ...filters, decision: e.target.value })}
            disabled={loading}
          >
            <option value="All Decisions">All Decisions</option>
            {dropdownOptions.decisions.map((decision) => (
              <option key={decision.value} value={decision.value}>
                {decision.label}
              </option>
            ))}
          </select>
        </div>

        {/* Provider Filter with search functionality */}
        <div ref={providerRef} className="relative">
          <label className="block text-sm font-medium mb-2">Provider</label>
            <div onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer focus:ring-2 focus:ring-blue-500"
            >
                {filters.provider || 'All Providers'}
            </div>

            {showProviderDropdown && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              <div className="sticky top-0 bg-white p-2 border-b">
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={providerSearch}
                  onChange={(e) => setProviderSearch(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="p-1">
                <div
                  className="px-3 py-1.5 text-sm hover:bg-blue-50 rounded cursor-pointer"
                  onClick={() => {
                    onFilterChange({ ...filters, provider: 'All Providers' });
                    setShowProviderDropdown(false);
                  }}
                >
                  All Providers
                </div>
                {filteredProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="px-3 py-1.5 text-sm hover:bg-blue-50 rounded cursor-pointer"
                    onClick={() => {
                      onFilterChange({ ...filters, provider: provider.name });
                      setShowProviderDropdown(false);
                    }}
                  >
                    {provider.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Benefit Type Filter with search functionality */}
        <div ref={benefitRef} className="relative">
          <label className="block text-sm font-medium mb-2">Benefit Type</label>
          <div
            onClick={() => setShowBenefitDropdown(!showBenefitDropdown)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer focus:ring-2 focus:ring-blue-500"
          >
            {filters.benefitType || 'All Benefit Types'}
          </div>

          {showBenefitDropdown && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              <div className="sticky top-0 bg-white p-2 border-b">
                <input
                  type="text"
                  placeholder="Search benefit types..."
                  value={benefitSearch}
                  onChange={(e) => setBenefitSearch(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="p-1">
                <div
                  className="px-3 py-1.5 text-sm hover:bg-blue-50 rounded cursor-pointer"
                  onClick={() => {
                    onFilterChange({ ...filters, benefitType: 'All Benefit Types' });
                    setShowBenefitDropdown(false);
                  }}
                >
                  All Benefit Types
                </div>
                {filteredBenefits.map((benefitType) => (
                  <div
                    key={benefitType.value}
                    className="px-3 py-1.5 text-sm hover:bg-blue-50 rounded cursor-pointer"
                    onClick={() => {
                      onFilterChange({ ...filters, benefitType: benefitType.value });
                      setShowBenefitDropdown(false);
                    }}
                  >
                    {benefitType.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="relative">
          <label className="block text-sm font-medium mb-2">Date Range</label>
          <select
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.dateRange || 'All Time'}
            onChange={(e) => handleDateRangeChange(e.target.value)}
          >
            <option>All Time</option>
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Custom Range</option>
          </select>

          {/* Custom Date Range Picker Tooltip */}
          {showDatePicker && filters.dateRange === 'Custom Range' && (
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
                  onClick={handleCustomDateApply}
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
          <label className="block text-sm font-medium mb-2">Amount Range</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Min (KSh)"
              value={localAmountMin}
              onChange={(e) => setLocalAmountMin(e.target.value)}
              className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Max (KSh)"
              value={localAmountMax}
              onChange={(e) => setLocalAmountMax(e.target.value)}
              className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFilters;
