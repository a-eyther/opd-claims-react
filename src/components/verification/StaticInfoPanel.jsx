import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const StaticInfoPanel = ({ claimData, onRaiseQuery, isCollapsed, onToggleCollapse }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleAccordion = () => {
    setIsExpanded(prev => !prev);
  };

  const handleRaiseQuery = (field, value) => {
    onRaiseQuery({
      field,
      systemValue: value,
      reason: `Discrepancy found in ${field}`
    });
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
      {/* Main Header - Always Visible */}
      <div className="border-b bg-blue-50 p-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-blue-800">Claim Information</h3>
        <button
          onClick={toggleAccordion}
          className="p-1 hover:bg-blue-100 rounded"
          title="Toggle Claim Information"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto">
          {/* Claim Details Section */}
          <div className="border-b">
            <div className="w-full p-2 bg-blue-50">
              <span className="text-xs font-medium text-blue-800">Claim Details</span>
            </div>
            
            <div className="p-2 bg-blue-25 space-y-2">
              <div className="grid grid-cols-1 gap-3 text-xs">
                <div className="flex justify-between items-center group">
                  <span className="text-gray-600">Claim Number:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{claimData?.claimNumber || 'CLM-2025-000123'}</span>
                    <button
                      onClick={() => handleRaiseQuery('Claim Number', claimData?.claimNumber)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
                      title="Raise query if this doesn't match document"
                    >
                      <AlertTriangle size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center group">
                  <span className="text-gray-600">Visit Number:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{claimData?.visitNumber || '881628'}</span>
                    <button
                      onClick={() => handleRaiseQuery('Visit Number', claimData?.visitNumber)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
                      title="Raise query if this doesn't match document"
                    >
                      <AlertTriangle size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center group">
                  <span className="text-gray-600">Beneficiary Name:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{claimData?.beneficiaryName || 'GLENDA CHEPKORIR'}</span>
                    <button
                      onClick={() => handleRaiseQuery('Beneficiary Name', claimData?.beneficiaryName)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
                      title="Raise query if this doesn't match document"
                    >
                      <AlertTriangle size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center group">
                  <span className="text-gray-600">Invoice Date:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{claimData?.invoiceDate || 'Dec. 30, 2024, 3:30 p.m.'}</span>
                    <button
                      onClick={() => handleRaiseQuery('Invoice Date', claimData?.invoiceDate)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
                      title="Raise query if this doesn't match document"
                    >
                      <AlertTriangle size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Created At:</span>
                  <span className="font-medium">{claimData?.createdAt || 'Sept. 11, 2025, 4:30 p.m.'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Policy/Underwriting Data Section */}
          <div className="border-b">
            <div className="w-full p-2 bg-green-50">
              <span className="text-xs font-medium text-green-800">Policy/Underwriting Data</span>
            </div>
            
            <div className="p-2 bg-green-25 space-y-2">
              <div className="grid grid-cols-1 gap-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Policy Number:</span>
                  <span className="font-medium">{claimData?.policyData?.policyNumber || 'INACTIVE-AIC001- KIJABE'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Scheme Name:</span>
                  <span className="font-medium">{claimData?.policyData?.schemeName || 'AIC KIJABE'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Policy Start Date:</span>
                  <span className="font-medium">{claimData?.policyData?.policyStartDate || '2024-01-01'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Policy End Date:</span>
                  <span className="font-medium">{claimData?.policyData?.policyEndDate || '2024-12-31'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Claims History Section */}
          <div>
            <div className="w-full p-2 bg-purple-50">
              <span className="text-xs font-medium text-purple-800">Claims History</span>
            </div>
            
            <div className="p-2 space-y-2">
              {(claimData?.claimsHistory || [
                {
                  benefitType: 'OUTPATIENT',
                  invoiceDate: '2024-12-31T15:34:24+05:30',
                  memberName: 'GLENDA CHEPKORIR',
                  visitNumber: '881628',
                  invoiceNumber: 'NMC302412/24',
                  invoiceId: '1758792',
                  totalInvoicedAmount: 6589.0,
                  vettingStatus: 'PENDING'
                }
              ]).map((claim, index) => (
                <div key={index} className="bg-purple-25 border border-purple-200 rounded-lg p-2 hover:bg-purple-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-purple-800">{claim.benefitType}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        claim.vettingStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                        claim.vettingStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {claim.vettingStatus}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-purple-800">
                      {formatCurrency(claim.totalInvoicedAmount)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-purple-700">
                    <div>
                      <span className="text-purple-500">Invoice Date:</span>
                      <div className="font-medium">{new Date(claim.invoiceDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-purple-500">Member:</span>
                      <div className="font-medium">{claim.memberName}</div>
                    </div>
                    <div>
                      <span className="text-purple-500">Visit Number:</span>
                      <div className="font-medium">{claim.visitNumber}</div>
                    </div>
                    <div className="group">
                      <span className="text-purple-500">Invoice Number:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{claim.invoiceNumber}</span>
                        <button
                          onClick={() => handleRaiseQuery('Invoice Number', claim.invoiceNumber)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
                          title="Raise query if this doesn't match document"
                        >
                          <AlertTriangle size={10} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaticInfoPanel;