import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import Button from '../common/Button';

const DocumentVerificationChecklist = ({ 
  claimData, 
  currentDocument, 
  onRaiseQuery, 
  onVerificationComplete,
  disabled = false 
}) => {
  const [verificationStatus, setVerificationStatus] = useState({
    invoiceNumber: null, // true = matches, false = doesn't match, null = not checked
    beneficiaryName: null,
    memberNumber: null, 
    visitNumber: null,
    invoiceDate: null,
    totalAmount: null
  });

  const previousCompletionRef = useRef(null);

  // Define the verification items based on the current document type
  const getVerificationItems = () => {
    const baseItems = [
      { key: 'beneficiaryName', label: 'Beneficiary Name', value: claimData?.beneficiaryName || 'GLENDA CHEPKORIR' },
      { key: 'visitNumber', label: 'Visit Number', value: claimData?.visitNumber || '881628' },
    ];

    if (currentDocument?.type === 'invoice') {
      return [
        { key: 'invoiceNumber', label: 'Invoice Number', value: currentDocument?.invoiceNumber || 'NMC302412/24' },
        ...baseItems,
        { key: 'invoiceDate', label: 'Invoice Date', value: claimData?.invoiceDate || 'Dec. 30, 2024' },
        { key: 'totalAmount', label: 'Total Amount', value: currentDocument?.totalAmount || '6589.0' },
      ];
    } else if (currentDocument?.type === 'prescription') {
      return [
        { key: 'prescriptionNumber', label: 'Prescription Number', value: currentDocument?.prescriptionNumber || 'RX-2024-12345' },
        ...baseItems,
        { key: 'prescriptionDate', label: 'Prescription Date', value: currentDocument?.prescriptionDate || 'Dec. 30, 2024' },
      ];
    }

    return baseItems;
  };

  const verificationItems = getVerificationItems();

  const handleVerificationChange = (key, status) => {
    setVerificationStatus(prev => ({
      ...prev,
      [key]: status
    }));
  };

  const handleRaiseQueryForItem = (item) => {
    onRaiseQuery({
      field: item.label,
      systemValue: item.value,
      documentType: currentDocument?.type || 'document',
      reason: `${item.label} in document doesn't match system value: ${item.value}`
    });
  };

  const stats = useMemo(() => {
    const total = verificationItems.length;
    const checked = Object.values(verificationStatus).filter(status => status !== null).length;
    const matches = Object.values(verificationStatus).filter(status => status === true).length;
    const discrepancies = Object.values(verificationStatus).filter(status => status === false).length;
    
    return { total, checked, matches, discrepancies };
  }, [verificationItems.length, verificationStatus]);

  const isComplete = stats.checked === stats.total;

  useEffect(() => {
    const currentCompletionState = `${isComplete}-${stats.discrepancies}`;
    
    if (isComplete && onVerificationComplete && previousCompletionRef.current !== currentCompletionState) {
      previousCompletionRef.current = currentCompletionState;
      onVerificationComplete({
        status: stats.discrepancies === 0 ? 'verified' : 'has_discrepancies',
        stats
      });
    }
  }, [isComplete, stats.total, stats.checked, stats.matches, stats.discrepancies, onVerificationComplete]);

  const getStatusIcon = (status) => {
    if (status === true) return <CheckCircle size={16} className="text-green-600" />;
    if (status === false) return <XCircle size={16} className="text-red-600" />;
    return <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>;
  };

  const getStatusColor = (status) => {
    if (status === true) return 'border-green-200 bg-green-50';
    if (status === false) return 'border-red-200 bg-red-50';
    return 'border-gray-200 bg-white';
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-50 border-b p-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-indigo-800">Document Verification</h4>
          <div className="text-xs text-indigo-600">
            {currentDocument?.type === 'invoice' ? `Invoice: ${currentDocument?.name}` : 
             currentDocument?.type === 'prescription' ? `Prescription: ${currentDocument?.name}` :
             'Select Document to Verify'}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-indigo-600 mb-1">
            <span>Progress: {stats.checked}/{stats.total}</span>
            <span>
              {stats.matches} matches, {stats.discrepancies} discrepancies
            </span>
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(stats.checked / stats.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Verification Items */}
      <div className="p-3 space-y-3">
        {verificationItems.map((item) => (
          <div 
            key={item.key} 
            onClick={() => !disabled && handleVerificationChange(item.key, true)}
            className={`border rounded-lg p-3 transition-all cursor-pointer hover:shadow-sm ${
              verificationStatus[item.key] === true 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-200 bg-white hover:border-green-200'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {verificationStatus[item.key] === true ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <div className="text-xs text-gray-600 ml-6">
                  System Value: <span className="font-medium">{item.value}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* Status Summary */}
      {isComplete && (
        <div className={`border-t p-3 ${stats.discrepancies === 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="flex items-center gap-2">
            {stats.discrepancies === 0 ? (
              <>
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  Document verification complete - All items match
                </span>
              </>
            ) : (
              <>
                <AlertTriangle size={16} className="text-yellow-600" />
                <span className="text-sm text-yellow-800 font-medium">
                  Verification complete - {stats.discrepancies} discrepancies found
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerificationChecklist;