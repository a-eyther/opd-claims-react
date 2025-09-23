import React from 'react';
import { FileText, Receipt, Pill, ChevronDown } from 'lucide-react';

const DocumentSelector = ({ documents = [], selectedDocument, onDocumentChange, className = "" }) => {
  const getDocumentIcon = (type) => {
    switch (type) {
      case 'invoice':
        return <Receipt size={16} className="text-blue-600" />;
      case 'prescription':
        return <Pill size={16} className="text-green-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getDocumentTypeLabel = (type) => {
    switch (type) {
      case 'invoice':
        return 'Invoice';
      case 'prescription':
        return 'Prescription';
      default:
        return 'Document';
    }
  };

  const getDocumentBadgeColor = (type) => {
    switch (type) {
      case 'invoice':
        return 'bg-blue-100 text-blue-800';
      case 'prescription':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500">
          No documents available for this claim
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedDocument?.id || ''}
        onChange={(e) => {
          const doc = documents.find(d => d.id === e.target.value);
          onDocumentChange(doc);
        }}
        className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-8 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
      >
        <option value="">Select Document...</option>
        {documents.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.type === 'invoice' && doc.invoiceNumber 
              ? `Invoice: ${doc.invoiceNumber}` 
              : doc.type === 'prescription' && doc.prescriptionNumber 
              ? `Prescription: ${doc.prescriptionNumber}`
              : `${getDocumentTypeLabel(doc.type)}: ${doc.displayName}`}
          </option>
        ))}
      </select>
      
      {/* Icon */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        {selectedDocument ? getDocumentIcon(selectedDocument.type) : <FileText size={16} className="text-gray-400" />}
      </div>
      
      {/* Dropdown Arrow */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <ChevronDown size={16} className="text-gray-400" />
      </div>
    </div>
  );
};

export default DocumentSelector;