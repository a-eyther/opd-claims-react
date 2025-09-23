import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import useClaimsStore from '../store/useClaimsStore';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { formatCurrency, formatDate } from '../utils/formatters';
import { mockData } from '../utils/mockData';

const ClaimsListPage = () => {
  const navigate = useNavigate();
  const { filteredClaims, filters, setFilter, clearFilters } = useClaimsStore();
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClaims = filteredClaims.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Claims List</h1>
        <p className="text-sm text-gray-600 mt-1">Manage and review insurance claims</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Filter Claims</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-primary-500 hover:text-primary-600"
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {showFilters && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="label">Claim ID</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    className="input pl-8"
                    placeholder="Search claim ID..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilter('searchTerm', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label">Claim Type</label>
                <select
                  className="input"
                  value={filters.claimType}
                  onChange={(e) => setFilter('claimType', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="OPD">OPD</option>
                  <option value="IPD">IPD</option>
                </select>
              </div>

              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={filters.status}
                  onChange={(e) => setFilter('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="label">Provider</label>
                <select
                  className="input"
                  value={filters.provider}
                  onChange={(e) => setFilter('provider', e.target.value)}
                >
                  <option value="">All Providers</option>
                  {mockData.providers.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button>
                <Filter size={14} />
                Apply Filters
              </Button>
              <Button variant="secondary">
                <Download size={14} />
                Export
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Claims Table */}
      <div className="card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead sortable>Claim Seq ID</TableHead>
              <TableHead sortable>Claim Unique ID</TableHead>
              <TableHead>Claim Type</TableHead>
              <TableHead>Provider Name</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead sortable>Request Amount</TableHead>
              <TableHead sortable>Savings</TableHead>
              <TableHead>Create Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClaims.map((claim) => (
              <TableRow key={claim.claimSeqId}>
                <TableCell className="font-medium">{claim.claimSeqId}</TableCell>
                <TableCell className="text-xs">{claim.claimUniqueId}</TableCell>
                <TableCell>
                  <Badge variant="primary">{claim.claimType}</Badge>
                </TableCell>
                <TableCell className="text-xs">{claim.providerName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${claim.diagnosis !== 'NA' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs">{claim.diagnosis}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={claim.status === 'pending' ? 'warning' : 'success'}>
                    {claim.decision}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {formatCurrency(claim.totalRequestAmount)}
                </TableCell>
                <TableCell className="text-xs text-green-600 font-medium">
                  {formatCurrency(claim.totalSavings)}
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {claim.createTime}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/claim/${claim.claimUniqueId}/edit`)}
                  >
                    <Eye size={12} />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-xs text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredClaims.length)} of {filteredClaims.length} claims
          </div>
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimsListPage;