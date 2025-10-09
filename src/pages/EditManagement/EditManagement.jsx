import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import SearchBar from '../../components/common/SearchBar';
import DataTable from '../../components/common/DataTable';
import EditFilters from './components/EditFilters';
import { statsData } from '../../constants/mockData';
import { editManagementColumns } from './constants/columns';
import axiosInstance from '../../utils/axios';

/**
 * Edit Management Page
 * Displays claims data with stats, search, and table
 */
const EditManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    decision: 'All Decisions',
    provider: 'All Providers',
    benefitType: 'All Benefit Types',
    amountMin: '',
    amountMax: ''
  });

  const [claimsData, setClaimsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/claims/api/v2/claims/?claim_type=OPD&claim_number&provider_name&scheme_name&start_date&end_date&page=1&ordering'); // Claims List API
        setClaimsData(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch claims:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  // Filter data based on search query and filters
  const filteredData = claimsData.filter((claim) => {
    // Search filter
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      claim.id.toLowerCase().includes(query) ||
      claim.visit_number?.toLowerCase().includes(query) ||  
      claim.provider_name?.toLowerCase().includes(query) ||
      claim.diagnosis?.toLowerCase().includes(query) ||
      claim.benefit_name?.toLowerCase().includes(query)
    );

    // Decision filter
    const matchesDecision = filters.decision === 'All Decisions' ||
      claim.decision === filters.decision;

    // Provider filter
    const matchesProvider = filters.provider === 'All Providers' ||
      claim.provider === filters.provider;

    // Benefit Type filter
    const matchesBenefitType = filters.benefitType === 'All Benefit Types' ||
      claim.benefitType === filters.benefitType;

    return matchesSearch && matchesDecision && matchesProvider && matchesBenefitType;
  });

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
            value={statsData.totalClaims}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            iconColor="text-gray-500"
          />
          <StatsCard
            label="Edit Done"
            value={statsData.editDone}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconColor="text-green-500"
          />
          <StatsCard
            label="Edit Pending"
            value={statsData.editPending}
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
              placeholder="Search claims, providers, benefit types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium">Export</span>
          </button>
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
          data={filteredData}
          rowsPerPage={10}
          loading={loading}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
};

export default EditManagement;
