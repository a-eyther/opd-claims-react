import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, AlertCircle, ZoomIn, ZoomOut, RotateCw, Maximize, MessageSquare, Lock, Unlock, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import useClaimsStore from '../store/useClaimsStore';
import useEditorStore from '../store/useEditorStore';
import Button from '../components/common/Button';
import AutocompleteInput from '../components/common/AutocompleteInput';
import MultiSelectAutocomplete from '../components/common/MultiSelectAutocomplete';
import BillTable from '../components/editor/BillTable';
import ClinicalValidationTable from '../components/editor/ClinicalValidationTable';
import QueryPanel from '../components/query/QueryPanel';
import FinancialTotals from '../components/common/FinancialTotals';
import FraudAlerts from '../components/common/FraudAlerts';
import StaticInfoPanel from '../components/verification/StaticInfoPanel';
import DocumentVerificationChecklist from '../components/verification/DocumentVerificationChecklist';
import DocumentSelector from '../components/verification/DocumentSelector';
import { useToast } from '../components/notifications/ToastContext';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import { formatCurrency } from '../utils/formatters';
import { mockData } from '../utils/mockData';

const ClaimEditorPage = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { currentClaim, setCurrentClaim, filteredClaims } = useClaimsStore();
  const { 
    currentTab, 
    setCurrentTab, 
    isDirty, 
    saveChanges, 
    calculateTotals,
    calculateFinancialTotals,
    updateFinancialTotals,
    financialTotals,
    billItems,
    selectedDiagnosis,
    selectedSymptoms,
    setSelectedDiagnosis,
    setSelectedSymptoms,
    extractedDiagnosis,
    extractedSymptoms,
    isDigitizationLocked,
    lockDigitization,
    unlockDigitization,
    systemRerunStatus,
    rerunSystem,
    lastRerunTime,
    currentDocument,
    setCurrentDocument,
    documentViewerCollapsed,
    toggleDocumentViewer,
    verificationStatus,
    updateVerificationStatus,
    setVerificationComplete,
    raiseVerificationQuery,
    stepsCompleted,
    markStepCompleted,
    canAccessStep,
    decisionSubmitted,
    setDecisionSubmitted
  } = useEditorStore();
  const [zoomLevel, setZoomLevel] = useState(75);
  const [isQueryPanelOpen, setIsQueryPanelOpen] = useState(false);
  const [hasOpenQuery, setHasOpenQuery] = useState(false);
  const [adjudicationDecision, setAdjudicationDecision] = useState(null);
  const [isClaimAdjudicated, setIsClaimAdjudicated] = useState(false);
  const toast = useToast();

  // Check if claim is fully adjudicated and decision submitted
  const isClaimFullyProcessed = () => {
    return !hasOpenQuery && adjudicationDecision && isClaimAdjudicated && decisionSubmitted;
  };

  // Calculate adjudication totals including requested amount
  const calculateAdjudicationTotals = () => {
    const totalInvoiced = billItems.reduce((sum, item) => sum + (item.invoicedAmount || 0), 0);
    const totalRequested = billItems.reduce((sum, item) => sum + (item.requestedAmount || 0), 0);
    const totalApproved = billItems.reduce((sum, item) => {
      const maxApproved = Math.min(item.requestedAmount || 0, item.invoicedAmount || 0);
      return sum + Math.min(item.approvedAmount || 0, maxApproved);
    }, 0);
    const totalSavings = totalInvoiced - totalApproved;
    
    return { totalInvoiced, totalRequested, totalApproved, totalSavings };
  };

  const adjudicationTotals = calculateAdjudicationTotals();

  // Get documents from mock data - memoized to prevent unnecessary re-renders
  const documents = useMemo(() => {
    const claimKey = claimId || 'ABHI28800381331';
    let docs = mockData.claimDetails[claimKey]?.documents || [];
    
    // Ensure we always have documents - fallback to default claim documents
    if (docs.length === 0) {
      docs = mockData.claimDetails['ABHI28800381331']?.documents || [];
    }
    
    return docs;
  }, [claimId]);

  // Automatically determine adjudication decision based on totals
  useEffect(() => {
    const determineDecision = () => {
      if (adjudicationTotals.totalApproved === 0) {
        return 'rejected';
      } else if (adjudicationTotals.totalApproved < adjudicationTotals.totalInvoiced) {
        return 'partial';
      } else {
        return 'approved';
      }
    };
    
    if (adjudicationDecision === null && currentTab === 'review') {
      setAdjudicationDecision(determineDecision());
    }
  }, [adjudicationTotals, adjudicationDecision, currentTab]);

  // Policy rules with results (for review tab)
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
      rule: `Document total (${formatCurrency(adjudicationTotals.totalInvoiced)}) exceeds pre-auth amount (${formatCurrency(15600)}) by ${formatCurrency(Math.max(0, adjudicationTotals.totalInvoiced - 15600))} (${((Math.max(0, adjudicationTotals.totalInvoiced - 15600) / 15600) * 100).toFixed(1)}%)`,
      result: adjudicationTotals.totalInvoiced > 15600 ? 'FAIL' : 'PASS',
      details: 'View Rule execution Info',
      status: adjudicationTotals.totalInvoiced > 15600 ? 'fail' : 'pass'
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
      rule: `Claim approved for ${adjudicationTotals.totalApproved.toFixed(0)}`,
      result: 'PASS',
      details: 'View Rule execution Info',
      status: 'pass'
    }
  ];

  // Helper functions for review tab
  const getStatusBadge = (status) => {
    if (status === 'APPROVED') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">APPROVED</span>;
    } else if (status === 'REJECTED') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">REJECTED</span>;
    } else {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">PARTIAL</span>;
    }
  };

  const handleSubmitAdjudicationDecision = () => {
    const adjudicationData = {
      time: new Date().toISOString(),
      decision: adjudicationDecision.toUpperCase(),
      totalInvoicedAmount: adjudicationTotals.totalInvoiced,
      totalRequestedAmount: adjudicationTotals.totalRequested,
      totalAllowedAmount: adjudicationTotals.totalApproved,
      totalSavings: adjudicationTotals.totalSavings,
      percentSavings: ((adjudicationTotals.totalSavings / adjudicationTotals.totalInvoiced) * 100).toFixed(2) + '%'
    };
    
    localStorage.setItem(`adjudication_${claimId}_${Date.now()}`, JSON.stringify(adjudicationData));
    
    // Mark claim as adjudicated and decision as submitted
    setIsClaimAdjudicated(true);
    setDecisionSubmitted(true);
    
    toast.success('Adjudication Complete', 'The claim has been successfully adjudicated. You can now proceed to the next claim.');
  };

  // Initialize claim and tab - only run when claimId changes
  useEffect(() => {
    setCurrentClaim(claimId || 'ABHI28800381331');
    setCurrentTab('digitization');
  }, [claimId, setCurrentClaim, setCurrentTab]);

  // Initialize document selection - only when documents change and no current document
  useEffect(() => {
    if (!currentDocument && documents.length > 0) {
      setCurrentDocument(documents[0]);
    }
  }, [documents, currentDocument, setCurrentDocument]); // Include currentDocument and setCurrentDocument for proper dependency tracking

  // Auto-trigger system rerun when digitization is locked
  useEffect(() => {
    if (isDigitizationLocked && systemRerunStatus === 'idle') {
      rerunSystem().then(() => {
        toast.success('System Rerun Complete', 'Medicine administration data has been updated');
      });
    }
  }, [isDigitizationLocked, systemRerunStatus, rerunSystem, toast]);

  const totals = calculateTotals();
  
  // Update financial totals when billItems change (not during render)
  useEffect(() => {
    updateFinancialTotals();
  }, [billItems, updateFinancialTotals]);

  // Navigation logic for Next/Previous claims
  const currentClaimIndex = filteredClaims.findIndex(claim => claim.claimUniqueId === claimId);
  const hasPrevious = currentClaimIndex > 0;
  const hasNext = currentClaimIndex < filteredClaims.length - 1;
  const previousClaim = hasPrevious ? filteredClaims[currentClaimIndex - 1] : null;
  const nextClaim = hasNext ? filteredClaims[currentClaimIndex + 1] : null;

  const goToPreviousClaim = () => {
    if (previousClaim) {
      navigate(`/claim/${previousClaim.claimUniqueId}/edit`);
    }
  };

  const goToNextClaim = () => {
    if (nextClaim && isClaimFullyProcessed()) {
      navigate(`/claim/${nextClaim.claimUniqueId}/edit`);
    } else if (nextClaim && !isClaimFullyProcessed()) {
      toast.warning('Adjudication Required', 'Please complete the adjudication process before moving to the next claim.');
    }
  };

  // Find the next pending claim (not adjudicated)
  const findNextPendingClaim = () => {
    for (let i = currentClaimIndex + 1; i < filteredClaims.length; i++) {
      if (filteredClaims[i].status === 'pending') {
        return filteredClaims[i];
      }
    }
    return null;
  };

  const goToNextPendingClaim = () => {
    const nextPendingClaim = findNextPendingClaim();
    if (nextPendingClaim) {
      navigate(`/claim/${nextPendingClaim.claimUniqueId}/edit`);
    } else {
      toast.info('No Pending Claims', 'No more pending claims available for processing.');
    }
  };

  const tabs = [
    { id: 'digitization', label: 'Step 1: Digitization', enabled: canAccessStep('digitization') },
    { id: 'diagnosis', label: 'Step 2: Information Verification', enabled: canAccessStep('diagnosis') },
    { id: 'clinical-validation', label: 'Step 3: Clinical Validation', enabled: canAccessStep('clinicalValidation') },
    { id: 'review', label: 'Step 4: Review', enabled: canAccessStep('review') },
  ];

  const handleSave = async () => {
    await saveChanges();
    toast.success('Changes Saved', 'Your changes have been saved successfully');
  };

  const handleSaveAndContinue = async () => {
    await saveChanges();
    
    // Mark current step as completed and proceed to next step
    if (currentTab === 'digitization') {
      markStepCompleted('digitization');
      setCurrentTab('diagnosis');
      toast.success('Saved & Proceeded', 'Moving to information verification');
    } else if (currentTab === 'diagnosis') {
      markStepCompleted('diagnosis');
      setCurrentTab('clinical-validation');
      toast.success('Saved & Proceeded', 'Moving to clinical validation');
    } else if (currentTab === 'clinical-validation') {
      markStepCompleted('clinicalValidation');
      setCurrentTab('review');
      toast.success('Saved & Proceeded', 'Moving to adjudication review');
    } else {
      toast.success('Changes Saved', 'All changes have been saved successfully');
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!isDirty) return;
    
    const autoSaveTimer = setTimeout(() => {
      saveChanges();
      toast.info('Auto-saved', 'Your changes have been automatically saved');
    }, 30000); // Auto-save after 30 seconds of changes

    return () => clearTimeout(autoSaveTimer);
  }, [isDirty, saveChanges, toast]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 's', ctrl: true, action: handleSave },
    { key: 'q', ctrl: true, action: () => setIsQueryPanelOpen(!isQueryPanelOpen) },
    { key: '1', alt: true, action: () => setCurrentTab('digitization') },
    { key: '2', alt: true, action: () => isDigitizationLocked && setCurrentTab('diagnosis') },
    { key: '3', alt: true, action: () => isDigitizationLocked && setCurrentTab('clinical-validation') },
    { key: '4', alt: true, action: () => isDigitizationLocked && setCurrentTab('review') },
    { key: 'ArrowLeft', alt: true, action: goToPreviousClaim },
    { key: 'ArrowRight', alt: true, action: goToNextClaim },
    { key: 'Escape', action: () => setIsQueryPanelOpen(false) }
  ]);

  if (!currentClaim) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-[calc(100vh-3.5rem-2rem)] flex gap-6 p-4">
      {/* Left Section - Claim Info + Documents */}
      <div className="w-[40%] flex flex-col gap-4">
        {/* Claim Information Accordion */}
        <div className="card">
          <StaticInfoPanel
            claimData={mockData.claimDetails[claimId || 'ABHI28800381331']}
            onRaiseQuery={raiseVerificationQuery}
            isCollapsed={false}
            onToggleCollapse={() => {}}
          />
        </div>

        {/* Document Viewer Section */}
        <div className="card flex flex-col flex-1">
          <div className="border-b p-3">
            {/* Document Selector and Controls */}
            <div className="flex items-center justify-between gap-4">
              <div className="w-64">
                <DocumentSelector
                  documents={documents}
                  selectedDocument={currentDocument}
                  onDocumentChange={setCurrentDocument}
                />
              </div>
              
              {/* Document Controls */}
              <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-medium px-2 py-1 min-w-[3rem] text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-700 p-2 overflow-auto flex justify-center min-h-96">
            {currentDocument ? (
              <div 
                className="bg-white shadow-lg p-6 w-full max-w-4xl"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                {/* Invoice Document */}
                {currentDocument.type === 'invoice' && (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">INVOICE</h2>
                    <p className="text-sm text-gray-600">{currentDocument.content?.hospitalName || 'Medlife Hospital'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                    <div className="space-y-1">
                      <p><strong>Invoice No:</strong> {currentDocument.invoiceNumber}</p>
                      <p><strong>Date:</strong> {currentDocument.date}</p>
                      <p><strong>Visit No:</strong> {currentDocument.content?.visitNumber || currentClaim.visitNumber}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p><strong>Patient:</strong> {currentDocument.content?.patientName || currentClaim.beneficiaryName}</p>
                      <p><strong>Member ID:</strong> {currentDocument.content?.memberID || 'MEM123456'}</p>
                      <p><strong>Claim No:</strong> {currentClaim.claimNumber}</p>
                    </div>
                  </div>

                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2">Description</th>
                        <th className="text-center py-2">Qty</th>
                        <th className="text-right py-2">Rate</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {currentDocument.content?.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2">{item.description}</td>
                          <td className="text-center py-2">{item.qty}</td>
                          <td className="text-right py-2">{item.rate.toFixed(2)}</td>
                          <td className="text-right py-2">{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t font-bold">
                        <td colSpan="3" className="py-2 text-right">Total:</td>
                        <td className="py-2 text-right">KES {currentDocument.totalAmount}</td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="mt-8 flex justify-between text-xs">
                    <div>
                      <p className="text-gray-500">Payment Terms: Insurance Claim</p>
                    </div>
                    <div className="text-right">
                      <div className="border-b border-gray-400 w-32 mb-1"></div>
                      <p>Authorized Signature</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Prescription Document */}
              {currentDocument.type === 'prescription' && (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">PRESCRIPTION</h2>
                    <p className="text-sm text-gray-600">{currentDocument.doctor}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                    <div className="space-y-1">
                      <p><strong>Prescription No:</strong> {currentDocument.prescriptionNumber}</p>
                      <p><strong>Date:</strong> {currentDocument.date}</p>
                      <p><strong>Patient:</strong> {currentDocument.content?.patientName}</p>
                      <p><strong>Age:</strong> {currentDocument.content?.age}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p><strong>Doctor:</strong> {currentDocument.doctor}</p>
                      <p><strong>Diagnosis:</strong> {currentDocument.content?.diagnosis}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="font-bold text-lg">Medications</h3>
                    {currentDocument.content?.medications?.map((med, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="font-medium">{index + 1}. {med.name}</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Dosage:</strong> {med.dosage}</p>
                          <p><strong>Quantity:</strong> {med.quantity}</p>
                          <p><strong>Duration:</strong> {med.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 text-right text-xs">
                    <div className="border-b border-gray-400 w-32 mb-1 ml-auto"></div>
                    <p>Doctor's Signature</p>
                  </div>
                </div>
              )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select a document to view</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Main Content */}
      <div className="w-[60%] card flex flex-col">
        {/* Simplified Header */}
        <div className="border-b p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900">{currentClaim?.claimNumber || claimId}</span>
            <span className="text-xs text-gray-500">({currentClaimIndex + 1}/{filteredClaims.length})</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              isClaimFullyProcessed() 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {isClaimFullyProcessed() ? 'Adjudicated' : 'Pending'}
            </span>
          </div>
          
          {/* Next Claim Button - Only show after adjudication */}
          {decisionSubmitted && findNextPendingClaim() && (
            <Button
              variant="primary"
              size="sm"
              onClick={goToNextPendingClaim}
              className="flex items-center gap-2"
            >
              Next Claim
              <ChevronRight size={14} />
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b flex">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => tab.enabled && setCurrentTab(tab.id)}
              disabled={!tab.enabled}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                currentTab === tab.id
                  ? 'text-primary-500 border-primary-500'
                  : tab.enabled 
                    ? 'text-gray-500 border-transparent hover:text-gray-700 cursor-pointer'
                    : 'text-gray-300 border-transparent cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                {tab.id === 'digitization' && isDigitizationLocked ? (
                  <span className="text-green-500">✓</span>
                ) : null}
                {tab.label}
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-6">
          {currentTab === 'diagnosis' && (
            <div className="space-y-6">
              <h3 className="text-xl font-medium">Information Verification</h3>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  Verify document information matches claim data using the checklist above.
                </p>
              </div>

              {/* Fraud Detection Analysis */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium mb-4">Fraud Detection Analysis</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Automated fraud detection analysis based on claim patterns, amounts, and risk indicators.
                </p>
                <FraudAlerts 
                  claimData={mockData.claimDetails[claimId || 'ABHI28800381331']}
                  billItems={billItems}
                  hospitalTrustScore={Math.floor(Math.random() * 30) + 70} // Mock hospital trust score
                  patientTrustScore={Math.floor(Math.random() * 20) + 80}  // Mock patient trust score
                />
              </div>

              {/* Document Verification Checklist */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium mb-4">Document Verification Checklist</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Verify that the information in the selected document matches the claim information below. 
                  If any discrepancies are found, you can raise a query.
                </p>
                {currentDocument ? (
                  <DocumentVerificationChecklist
                    claimData={mockData.claimDetails[claimId || 'ABHI28800381331']}
                    currentDocument={currentDocument}
                    onRaiseQuery={raiseVerificationQuery}
                    onVerificationComplete={(isComplete) => {
                      setVerificationComplete(currentDocument.id, isComplete);
                    }}
                    disabled={isDigitizationLocked}
                  />
                ) : (
                  <div className="text-sm text-gray-500 py-4 text-center">
                    Please select a document from the document viewer to begin verification
                  </div>
                )}
              </div>



            </div>
          )}

          {currentTab === 'review' && (
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Adjudication Review</h3>
              
              {/* Financial Summary */}
              <div className="card p-4 mb-3">
                <h4 className="text-lg font-medium mb-3">Financial Summary</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm text-blue-600 font-medium mb-1">Total Invoiced Amount</div>
                    <div className="text-xl font-bold text-blue-700">{formatCurrency(adjudicationTotals.totalInvoiced)}</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-sm text-purple-600 font-medium mb-1">Total Requested Amount</div>
                    <div className="text-xl font-bold text-purple-700">{formatCurrency(adjudicationTotals.totalRequested)}</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-sm text-yellow-600 font-medium mb-1">Total Approved Amount</div>
                    <div className="text-xl font-bold text-yellow-700">{formatCurrency(adjudicationTotals.totalApproved)}</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-sm text-green-600 font-medium mb-1">Total Savings Amount</div>
                    <div className="text-xl font-bold text-green-700">{formatCurrency(adjudicationTotals.totalSavings)}</div>
                  </div>
                </div>
              </div>

              {/* Claim Information Card */}
              <div className="card p-4">
                <h4 className="text-lg font-medium mb-3">Claim Information</h4>
                <div className="grid grid-cols-3 gap-x-12 gap-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Claim ID:</p>
                    <p className="text-sm font-medium">{currentClaim?.claimNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Member Name:</p>
                    <p className="text-sm font-medium">{currentClaim?.beneficiaryName}</p>
                  </div>
                  <div className="row-span-2">
                    <p className="text-xs text-gray-500 mb-1">Diagnosis:</p>
                    <p className="text-sm font-medium">
                      {Array.isArray(selectedDiagnosis) 
                        ? selectedDiagnosis.join(', ') 
                        : 'K76.0, E83.110, R64'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bill Items Table */}
              <div className="card p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-primary-500 text-white">
                      <tr>
                        <th className="px-3 py-2 text-left">Item Category</th>
                        <th className="px-3 py-2 text-left">Item Name</th>
                        <th className="px-3 py-2 text-center">Invoice</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                        <th className="px-3 py-2 text-right">Preauth Amount</th>
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
                            <td className="px-3 py-2 text-center">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {item.invoiceNumber || 'NMC302412/24'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">{item.quantity}</td>
                            <td className="px-3 py-2 text-right">{item.unitPrice.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right text-blue-600">{(item.preAuthAmount || 0).toFixed(2)}</td>
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
                    adjudicationTotals.totalSavings > 0 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    Invoice Status: {adjudicationTotals.totalSavings > 0 ? 'PARTIALLY APPROVED' : 'APPROVED'}
                  </span>
                </div>
              </div>

              {/* Product Rules Execution */}
              <div className="card p-4">
                <h4 className="text-lg font-medium mb-3">Product Rules Execution</h4>
                <div className="space-y-3">
                  {policyRules.map((rule, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="mt-1">
                        {rule.status === 'pass' ? (
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-red-600 text-xs">✗</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="text-gray-600">Rule Category: {rule.category}, </span>
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

              {/* Final Adjudication Decision */}
              <div className="card p-4">
                <div className="flex items-center justify-end">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Adjudication Decision:</label>
                    <span className={`px-3 py-2 rounded font-medium text-sm ${
                      adjudicationDecision === 'approved' ? 'bg-green-100 text-green-700' :
                      adjudicationDecision === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {adjudicationDecision === 'approved' ? 'Approve Claim' :
                       adjudicationDecision === 'rejected' ? 'Reject Claim' :
                       'Partial Approval'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'digitization' && (
            <div className="space-y-6">
              <h3 className="text-xl font-medium">Digitization</h3>

              <BillTable isLocked={isDigitizationLocked} />

              {/* Diagnosis and Symptoms Section - Now in Digitization */}
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium">Diagnosis & Symptoms</h4>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="text-sm font-medium text-primary-600 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} />
                    LCT Extracted Information
                    {isDigitizationLocked && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Locked</span>}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                    <div><strong>Extracted Symptoms:</strong> {Array.isArray(extractedSymptoms) ? extractedSymptoms.join(', ') : extractedSymptoms}</div>
                    <div><strong>Extracted ICD Codes:</strong> {Array.isArray(extractedDiagnosis) ? extractedDiagnosis.join(', ') : extractedDiagnosis}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MultiSelectAutocomplete
                    label="Diagnosis"
                    value={selectedDiagnosis}
                    onChange={setSelectedDiagnosis}
                    options={mockData.diagnosisCodes}
                    displayField="name"
                    valueField="code"
                    placeholder="Type to search diagnosis..."
                    disabled={isDigitizationLocked}
                  />
                  <MultiSelectAutocomplete
                    label="Symptoms"
                    value={selectedSymptoms}
                    onChange={setSelectedSymptoms}
                    options={mockData.symptoms}
                    placeholder="Type to search symptoms..."
                    disabled={isDigitizationLocked}
                  />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'clinical-validation' && (
            <div className="space-y-6">
              {lastRerunTime && (
                <div className="text-xs text-gray-500">
                  Last system rerun: {new Date(lastRerunTime).toLocaleString()}
                </div>
              )}
              
              <ClinicalValidationTable
                isLocked={isDigitizationLocked}
                readOnly={false}
                headerActions={
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => {
                      rerunSystem().then(() => {
                        toast.success('System Rerun Complete', 'Medicine administration data has been updated');
                      });
                    }}
                    disabled={systemRerunStatus === 'running'}
                    title="Rerun the system analysis with current claim data"
                  >
                    <RefreshCw size={14} className={systemRerunStatus === 'running' ? 'animate-spin' : ''} />
                    {systemRerunStatus === 'running' ? 'Rerunning...' : 'Manual Rerun'}
                  </Button>
                }
              />
            </div>
          )}

        </div>

        {/* Unified Actions Footer */}
        <div className="border-t p-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              onClick={() => setIsQueryPanelOpen(true)}
              title="Open Query Panel (Ctrl+Q)"
            >
              <MessageSquare size={14} />
              Query Panel
            </Button>
            {currentTab === 'review' ? (
              <Button 
                variant="primary"
                onClick={handleSubmitAdjudicationDecision}
                disabled={hasOpenQuery}
                className={hasOpenQuery ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <Send size={14} />
                {hasOpenQuery ? 'Close Query First' : 'Submit Decision'}
              </Button>
            ) : (
              <Button 
                variant="primary"
                onClick={() => {
                  if (currentTab === 'clinical-validation' && hasOpenQuery) {
                    toast.error('Query Open', 'Please close all queries before proceeding to review');
                    return;
                  }
                  handleSaveAndContinue();
                }}
                disabled={hasOpenQuery && currentTab === 'clinical-validation'}
                className={hasOpenQuery && currentTab === 'clinical-validation' ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <Save size={14} />
                Save & Continue
              </Button>
            )}
          </div>
        </div>
      </div>

      
      {/* Query Panel */}
      <QueryPanel 
        isOpen={isQueryPanelOpen}
        onClose={() => setIsQueryPanelOpen(false)}
        claimNumber={currentClaim.claimNumber}
        onQueryStatusChange={(hasQuery) => setHasOpenQuery(hasQuery)}
      />
    </div>
  );
};

export default ClaimEditorPage;