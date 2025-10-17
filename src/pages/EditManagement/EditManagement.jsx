import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import SearchBar from '../../components/common/SearchBar';
import DataTable from '../../components/common/DataTable';
import EditFilters from './components/EditFilters';
import { editManagementColumns } from './constants/columns';
import axiosInstance from '../../utils/axios';

/**
 * Edit Management Page
 * Displays claims data with stats, search, and table
 */
const EditManagement = () => {
  const navigate = useNavigate();
  const isInitialMount = useRef(true);
  const isSearchInitialized = useRef(
    sessionStorage.getItem('editManagement_searchInitialized') === 'true'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const prevSearchQuery = useRef('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    decision: 'All Decisions',
    provider: 'All Providers',
    benefitType: 'All Benefit Types',
    amountMin: '',
    amountMax: '',
    startDate: '',
    endDate: '',
    dateRange: 'All Time'
  });

  // Track previous filters to detect actual changes
  const prevFiltersRef = useRef(filters);

  const [claimsData, setClaimsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalClaims: 0,
    editDone: 0,
    editPending: 0
  });
  const [currentPage, setCurrentPage] = useState(() => {
    // Restore saved page from sessionStorage
    const savedPage = sessionStorage.getItem('editManagement_currentPage');
    const page = savedPage ? parseInt(savedPage, 10) : 1;
    console.log('EditManagement: Initializing currentPage from sessionStorage:', page);
    return page;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // Fetch claims with filters - wrapped in useCallback to avoid stale closures
  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();

      // Always include claim_type
      params.append('claim_type', 'OPD');

      // Add search query if present
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      // Add decision filter (final_decision in API)
      if (filters.decision && filters.decision !== 'All Decisions') {
        params.append('final_decision', filters.decision);
      }

      // Add provider filter (provider_name in API)
      if (filters.provider && filters.provider !== 'All Providers') {
        params.append('provider_name', filters.provider);
      }

      // Add benefit type filter (benefit_name in API)
      if (filters.benefitType && filters.benefitType !== 'All Benefit Types') {
        params.append('benefit_name', filters.benefitType);
      }

      // Add date range filters
      if (filters.startDate) {
        params.append('start_date', filters.startDate);
      }
      if (filters.endDate) {
        params.append('end_date', filters.endDate);
      }

      // Add amount range filters
      if (filters.amountMin) {
        params.append('min_amount', filters.amountMin);
      }
      if (filters.amountMax) {
        params.append('max_amount', filters.amountMax);
      }

      // Add pagination
      params.append('page', currentPage.toString());
      params.append('page_size', pageSize.toString());

      const response = await axiosInstance.get(`/claims/api/claims/?${params.toString()}`);
      const claims = response.data.results || response.data;
      setClaimsData(claims);

      // Calculate total pages from API count
      const totalClaims = response.data.count || claims.length;
      const calculatedTotalPages = Math.ceil(totalClaims / pageSize);
      setTotalPages(calculatedTotalPages);

      // Use stats from API response
      setStats({
        totalClaims,
        editDone: response.data.edit_done_count || 0,
        editPending: response.data.edit_pending_count || 0
      });
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, searchQuery, pageSize]);

  // Fetch data when dependencies change
  useEffect(() => {
    console.log('EditManagement: fetchClaims useEffect triggered, currentPage:', currentPage);
    fetchClaims();
  }, [fetchClaims]);

  // Reset to page 1 when filters actually change (not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      console.log('EditManagement: Initial mount, skipping filter reset');
      isInitialMount.current = false;
      return;
    }

    // Check if filters actually changed
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
    console.log('EditManagement: Filters changed?', filtersChanged);
    if (filtersChanged) {
      console.log('EditManagement: Resetting to page 1 due to filter change');
      setCurrentPage(1);
      prevFiltersRef.current = filters;
    }
  }, [filters]);

  // Reset to page 1 when search changes (debounced, not on initial mount)
  useEffect(() => {
    if (!isSearchInitialized.current) {
      console.log('EditManagement: First search render, skipping reset');
      isSearchInitialized.current = true;
      sessionStorage.setItem('editManagement_searchInitialized', 'true');
      prevSearchQuery.current = searchQuery;
      return;
    }

    // Only reset if search query actually changed
    if (prevSearchQuery.current === searchQuery) {
      console.log('EditManagement: Search query unchanged, skipping reset');
      return;
    }

    console.log('EditManagement: Search query changed from', prevSearchQuery.current, 'to', searchQuery);
    prevSearchQuery.current = searchQuery;

    const timeoutId = setTimeout(() => {
      console.log('EditManagement: Resetting to page 1 due to search query change');
      setCurrentPage(1);
    }, 1000); // 1000ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Save current page to sessionStorage whenever it changes
  useEffect(() => {
    console.log('EditManagement: Saving currentPage to sessionStorage:', currentPage);
    sessionStorage.setItem('editManagement_currentPage', currentPage.toString());
  }, [currentPage]);

  // Handle row click - navigate to PatientClaimInfo with claim_unique_id
  const handleRowClick = (claim) => {
    if (claim.claim_unique_id) {
      navigate(`/claim/${claim.claim_unique_id}`);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <PageHeader title="Edit Management" />

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            label="Total Claims"
            value={stats.totalClaims}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            iconColor="text-gray-500"
          />
          <StatsCard
            label="Edit Done"
            value={stats.editDone}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconColor="text-green-500"
          />
          <StatsCard
            label="Edit Pending"
            value={stats.editPending}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconColor="text-yellow-500"
          />
        </div>

        {/* Search Bar with Export and Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchBar
              placeholder="Search Visit Number and Claim ID, for more search use Filters option"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/*<button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">*/}
          {/*  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
          {/*    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />*/}
          {/*  </svg>*/}
          {/*  <span className="text-sm font-medium">Export</span>*/}
          {/*</button>*/}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* Filter Section */}
        {showFilters && <EditFilters filters={filters} onFilterChange={setFilters} />}

        {/* Data Table */}
        <DataTable
          columns={editManagementColumns}
          data={claimsData}
          rowsPerPage={pageSize}
          loading={loading}
          onRowClick={handleRowClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default EditManagement;
