import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, ChevronDown, ChevronUp, FileText, Download } from 'lucide-react';
import useClaimsStore from '../store/useClaimsStore';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/formatters';

const ClaimDetailsPage = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { currentClaim, setCurrentClaim } = useClaimsStore();
  const [expandedSections, setExpandedSections] = useState({
    files: true,
    policy: false,
    history: false,
    adjudications: false,
  });

  useEffect(() => {
    setCurrentClaim(claimId || 'ABHI28800381331');
  }, [claimId, setCurrentClaim]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!currentClaim) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft size={14} />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Claim Details</h1>
            <p className="text-sm text-gray-600">View and manage claim information</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/claim/${claimId}/edit`)}>
          <Edit3 size={14} />
          Start Verification
        </Button>
      </div>

      {/* Claim Information */}
      <div className="card p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Claim Number</p>
            <p className="text-sm font-medium">{currentClaim.claimNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Visit Number</p>
            <p className="text-sm font-medium">{currentClaim.visitNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Beneficiary Name</p>
            <p className="text-sm font-medium">{currentClaim.beneficiaryName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Invoice Date</p>
            <p className="text-sm font-medium">{currentClaim.invoiceDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Created At</p>
            <p className="text-sm font-medium">{currentClaim.createdAt}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <Badge variant="warning">PENDING</Badge>
          </div>
        </div>
      </div>

      {/* Claim Files */}
      <div className="card overflow-hidden">
        <button
          onClick={() => toggleSection('files')}
          className="accordion-header"
        >
          <span className="text-sm font-medium">Claim Files</span>
          {expandedSections.files ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.files && (
          <div className="p-4 space-y-2">
            {currentClaim.files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="text-primary-500" size={20} />
                  <div>
                    <p className="text-sm font-medium">File {file.id}</p>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  <Download size={12} />
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Policy Data */}
      <div className="card overflow-hidden">
        <button
          onClick={() => toggleSection('policy')}
          className="accordion-header"
        >
          <span className="text-sm font-medium">Policy/Underwriting Data</span>
          {expandedSections.policy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.policy && (
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Policy Number</p>
                <p className="text-sm font-medium">{currentClaim.policyData.policyNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Scheme Name</p>
                <p className="text-sm font-medium">{currentClaim.policyData.schemeName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Policy Start Date</p>
                <p className="text-sm font-medium">{currentClaim.policyData.policyStartDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Policy End Date</p>
                <p className="text-sm font-medium">{currentClaim.policyData.policyEndDate}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Claims History */}
      <div className="card overflow-hidden">
        <button
          onClick={() => toggleSection('history')}
          className="accordion-header"
        >
          <span className="text-sm font-medium">Claims History (For the Same Visit)</span>
          {expandedSections.history ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.history && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-primary-500 text-white">
                <tr>
                  <th className="px-3 py-2 text-left">Benefit Type</th>
                  <th className="px-3 py-2 text-left">Invoice Date</th>
                  <th className="px-3 py-2 text-left">Member Name</th>
                  <th className="px-3 py-2 text-left">Visit Number</th>
                  <th className="px-3 py-2 text-left">Invoice Number</th>
                  <th className="px-3 py-2 text-left">Request Amount</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentClaim.claimsHistory.map((history, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-3 py-2">{history.benefitType}</td>
                    <td className="px-3 py-2">{new Date(history.invoiceDate).toLocaleDateString()}</td>
                    <td className="px-3 py-2">{history.memberName}</td>
                    <td className="px-3 py-2">{history.visitNumber}</td>
                    <td className="px-3 py-2">{history.invoiceNumber}</td>
                    <td className="px-3 py-2">{formatCurrency(history.totalRequestAmount)}</td>
                    <td className="px-3 py-2">
                      <Badge variant="warning">{history.vettingStatus}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Previous Adjudications */}
      <div className="card overflow-hidden">
        <button
          onClick={() => toggleSection('adjudications')}
          className="accordion-header"
        >
          <span className="text-sm font-medium">Claim Adjudications</span>
          {expandedSections.adjudications ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.adjudications && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-primary-500 text-white">
                <tr>
                  <th className="px-3 py-2 text-left">Adjudication Time</th>
                  <th className="px-3 py-2 text-left">Decision</th>
                  <th className="px-3 py-2 text-left">Request Amount</th>
                  <th className="px-3 py-2 text-left">Allowed Amount</th>
                  <th className="px-3 py-2 text-left">Savings</th>
                  <th className="px-3 py-2 text-left">Savings %</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentClaim.adjudications.map((adj, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-3 py-2">{adj.time}</td>
                    <td className="px-3 py-2">
                      <Badge variant="success">{adj.decision}</Badge>
                    </td>
                    <td className="px-3 py-2">{formatCurrency(adj.totalRequestAmount)}</td>
                    <td className="px-3 py-2">{formatCurrency(adj.totalAllowedAmount)}</td>
                    <td className="px-3 py-2 text-green-600 font-medium">{formatCurrency(adj.totalSavings)}</td>
                    <td className="px-3 py-2">{adj.percentSavings}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" onClick={() => navigate(`/adjudication/${claimId}`)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimDetailsPage;