import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, AlertTriangle, Download, FileText, Send, MessageSquare } from 'lucide-react';
import useClaimsStore from '../store/useClaimsStore';
import useEditorStore from '../store/useEditorStore';
import Button from '../components/common/Button';
import QueryPanel from '../components/query/QueryPanel';
import { useToast } from '../components/notifications/ToastContext';
import { formatCurrency } from '../utils/formatters';

const AdjudicationResultPage = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { currentClaim } = useClaimsStore();
  const { billItems, selectedDiagnosis, selectedSymptoms } = useEditorStore();
  const [decision, setDecision] = useState(null);
  const [isQueryPanelOpen, setIsQueryPanelOpen] = useState(false);
  const [hasOpenQuery, setHasOpenQuery] = useState(false);
  const toast = useToast();

  const claimData = currentClaim || {
    claimNumber: claimId || 'VIT-20250731161921-cb085720',
    beneficiaryName: 'JULIET JEMUTAI KOSGEI',
    memberId: 'MEM123456',
    visitNumber: '2022D000000000027316',
    invoiceDate: '2025-02-12',
    invoiceId: 'N/A',
    hospital: 'Medlife Hospital',
    status: 'pending'
  };

  // Calculate totals including requested amount
  const calculateTotals = () => {
    const totalInvoiced = billItems.reduce((sum, item) => sum + (item.invoicedAmount || 0), 0);
    const totalRequested = billItems.reduce((sum, item) => sum + (item.requestedAmount || 0), 0);
    const totalApproved = billItems.reduce((sum, item) => {
      // If requested exceeds invoiced, only approve up to requested amount
      const maxApproved = Math.min(item.requestedAmount || 0, item.invoicedAmount || 0);
      return sum + Math.min(item.approvedAmount || 0, maxApproved);
    }, 0);
    const totalSavings = totalInvoiced - totalApproved;
    
    return { totalInvoiced, totalRequested, totalApproved, totalSavings };
  };

  const totals = calculateTotals();

  // Automatically determine adjudication decision based on totals
  useEffect(() => {
    const determineDecision = () => {
      if (totals.totalApproved === 0) {
        return 'rejected';
      } else if (totals.totalApproved < totals.totalInvoiced) {
        return 'partial';
      } else {
        return 'approved';
      }
    };
    
    if (decision === null) {
      setDecision(determineDecision());
    }
  }, [totals, decision]);

  // Policy rules with results
  const policyRules = [
    {
      category: 'exclusion',
      rule: 'ICD code matches exclusion rule \'DENTAL OPTICAL CASES\'',
      result: 'PASS',
      details: 'View Rule execution Info',
      status: 'pass'
    },
    {
      category: 'invoice_anomaly',
      rule: `Document total (KES ${totals.totalInvoiced.toFixed(2)}) exceeds pre-auth amount (KES 15,600.00) by KES ${Math.max(0, totals.totalInvoiced - 15600).toFixed(2)} (${((Math.max(0, totals.totalInvoiced - 15600) / 15600) * 100).toFixed(1)}%)`,
      result: totals.totalInvoiced > 15600 ? 'FAIL' : 'PASS',
      details: 'View Rule execution Info',
      status: totals.totalInvoiced > 15600 ? 'fail' : 'pass'
    },
    {
      category: 'policy',
      rule: 'Admission and discharge dates are valid within policy coverage',
      result: 'PASS',
      details: 'View Rule execution Info',
      status: 'pass'
    },
    {
      category: 'validation',
      rule: 'Available balance is valid',
      result: 'PASS',
      details: 'View Rule execution Info',
      status: 'pass'
    },
    {
      category: 'validation',
      rule: `Claim approved for ${totals.totalApproved.toFixed(0)}`,
      result: 'PASS',
      details: 'View Rule execution Info',
      status: 'pass'
    }
  ];

  const handleSubmitDecision = () => {
    // Add to adjudication history
    const adjudicationData = {
      time: new Date().toISOString(),
      decision: decision.toUpperCase(),
      totalInvoicedAmount: totals.totalInvoiced,
      totalRequestedAmount: totals.totalRequested,
      totalAllowedAmount: totals.totalApproved,
      totalSavings: totals.totalSavings,
      percentSavings: ((totals.totalSavings / totals.totalInvoiced) * 100).toFixed(2) + '%'
    };
    
    // Here you would normally save to backend
    localStorage.setItem(`adjudication_${claimId}_${Date.now()}`, JSON.stringify(adjudicationData));
    
    toast.success('Adjudication Complete', 'The claim has been successfully adjudicated and sent for processing');
    setTimeout(() => {
      navigate('/claims');
    }, 1500);
  };

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">APPROVED</span>;
    } else if (status === 'REJECTED') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">REJECTED</span>;
    } else {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">PARTIAL</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Adjudication Result</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Download size={14} />
            Export PDF
          </Button>
          <Button variant="secondary" size="sm">
            <FileText size={14} />
            View Documents
          </Button>
        </div>
      </div>

      {/* Claim Information Card */}
      <div className="card p-6">
        <h2 className="text-lg font-medium mb-4">Claim Information</h2>
        <div className="grid grid-cols-3 gap-x-12 gap-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Claim ID:</p>
            <p className="text-sm font-medium">{claimData.claimNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Member Name:</p>
            <p className="text-sm font-medium">{claimData.beneficiaryName}</p>
          </div>
          <div className="row-span-2">
            <p className="text-xs text-gray-500 mb-1">Diagnosis:</p>
            <p className="text-sm font-medium">
              {Array.isArray(selectedDiagnosis) 
                ? selectedDiagnosis.join(', ') 
                : 'K76.0, E83.110, R64'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Invoiced Amount:</p>
            <p className="text-sm font-medium">{formatCurrency(totals.totalInvoiced)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Approved Amount:</p>
            <p className="text-sm font-medium text-yellow-600">{formatCurrency(totals.totalApproved)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Requested Amount:</p>
            <p className="text-sm font-medium">{formatCurrency(totals.totalRequested)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Savings:</p>
            <p className="text-sm font-medium text-green-600">{formatCurrency(totals.totalSavings)}</p>
          </div>
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText size={16} />
            <h3 className="font-medium">Invoice:</h3>
            <span className="text-sm text-gray-600">
              Invoice ID: {claimData.invoiceId} | Date: {claimData.invoiceDate}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span>Invoiced: <strong>{formatCurrency(totals.totalInvoiced)}</strong></span>
            <span>Approved: <strong className="text-yellow-600">{formatCurrency(totals.totalApproved)}</strong></span>
            <span>Savings: <strong className="text-green-600">{formatCurrency(totals.totalSavings)}</strong></span>
          </div>
        </div>

        {/* Bill Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-500 text-white">
              <tr>
                <th className="px-3 py-2 text-left">Item Category</th>
                <th className="px-3 py-2 text-left">Item Name</th>
                <th className="px-3 py-2 text-center">Qty</th>
                <th className="px-3 py-2 text-right">Rate</th>
                <th className="px-3 py-2 text-right">Invoiced Amount</th>
                <th className="px-3 py-2 text-right">Approved Amount</th>
                <th className="px-3 py-2 text-right">Savings</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-left">Deduction Reasons</th>
              </tr>
            </thead>
            <tbody>
              {billItems.map((item, index) => {
                const maxApproved = Math.min(item.requestedAmount || 0, item.invoicedAmount || 0);
                const actualApproved = Math.min(item.approvedAmount || 0, maxApproved);
                const savings = (item.invoicedAmount || 0) - actualApproved;
                const status = actualApproved === 0 ? 'REJECTED' : 
                               actualApproved < (item.invoicedAmount || 0) ? 'PARTIAL' : 'APPROVED';
                
                return (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-3 py-2">{item.category}</td>
                    <td className="px-3 py-2">{item.itemName}</td>
                    <td className="px-3 py-2 text-center">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{item.unitPrice.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{item.invoicedAmount.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{actualApproved.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{savings.toFixed(2)}</td>
                    <td className="px-3 py-2 text-center">{getStatusBadge(status)}</td>
                    <td className="px-3 py-2 text-xs">{item.deductionReason || 'NA'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Invoice Status */}
        <div className="mt-4 flex justify-end">
          <span className={`px-3 py-1 rounded font-medium ${
            totals.totalSavings > 0 
              ? 'bg-yellow-100 text-yellow-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            Invoice Status: {totals.totalSavings > 0 ? 'PARTIALLY APPROVED' : 'APPROVED'}
          </span>
        </div>
      </div>

      {/* Product Rules Execution */}
      <div className="card p-6">
        <h3 className="text-lg font-medium mb-4">Product Rules Execution</h3>
        <div className="space-y-3">
          {policyRules.map((rule, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
              <div className="mt-1">
                {rule.status === 'pass' ? (
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Check size={12} className="text-green-600" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <X size={12} className="text-red-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="text-gray-600">Rule Category: {rule.category} , </span>
                  <span className="text-gray-800">{rule.rule}</span>
                </p>
                <button className="text-xs text-primary-500 hover:underline mt-1">
                  {rule.details}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <label className="text-sm font-medium">Adjudication Decision</label>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-2 rounded font-medium text-sm ${
                decision === 'approved' ? 'bg-green-100 text-green-700' :
                decision === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {decision === 'approved' ? 'Approve Claim' :
                 decision === 'rejected' ? 'Reject Claim' :
                 'Partial Approval'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsQueryPanelOpen(true)}>
              <MessageSquare size={14} />
              Query Panel
            </Button>
            <Button variant="secondary">
              Save Draft
            </Button>
            <Button 
              onClick={handleSubmitDecision}
              disabled={hasOpenQuery}
              className={hasOpenQuery ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Send size={14} />
              {hasOpenQuery ? 'Close Query First' : 'Submit Decision'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Query Panel */}
      <QueryPanel 
        isOpen={isQueryPanelOpen}
        onClose={() => setIsQueryPanelOpen(false)}
        claimNumber={claimData.claimNumber}
        onQueryStatusChange={(hasQuery) => setHasOpenQuery(hasQuery)}
      />
    </div>
  );
};

export default AdjudicationResultPage;