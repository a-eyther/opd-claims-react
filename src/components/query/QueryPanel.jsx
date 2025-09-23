import React, { useState } from 'react';
import { X, Send, Paperclip, Clock, User, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import { useToast } from '../notifications/ToastContext';
import { formatDate } from '../../utils/formatters';

const QueryPanel = ({ isOpen, onClose, claimNumber }) => {
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const toast = useToast();

  const queryTemplates = [
    { id: 'missing-docs', label: 'Missing Documents', text: 'Please provide the following missing documents:' },
    { id: 'clarification', label: 'Clarification Required', text: 'We need clarification regarding:' },
    { id: 'diagnosis', label: 'Diagnosis Mismatch', text: 'The diagnosis does not match the prescribed treatment. Please clarify:' },
    { id: 'billing', label: 'Billing Discrepancy', text: 'There is a discrepancy in the billing. Please review:' }
  ];

  const previousQueries = [
    {
      id: 1,
      type: 'sent',
      from: 'John Executive',
      date: '2024-01-15 10:30 AM',
      message: 'Please provide the prescription details for the H-Pylori Kit mentioned in the claim.',
      status: 'pending'
    },
    {
      id: 2,
      type: 'received',
      from: 'Medlife Hospital',
      date: '2024-01-15 02:45 PM',
      message: 'Prescription attached. The H-Pylori Kit was prescribed by Dr. Smith for gastric issues.',
      attachments: ['prescription_hp_kit.pdf'],
      status: 'responded'
    },
    {
      id: 3,
      type: 'sent',
      from: 'John Executive',
      date: '2024-01-14 09:15 AM',
      message: 'Invoice date seems incorrect. Please verify.',
      status: 'resolved'
    }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    setMessage(template.text);
  };

  const handleSendQuery = () => {
    if (!message.trim()) {
      toast.error('Missing Message', 'Please enter a query message');
      return;
    }
    toast.success('Query Sent', `Query has been sent for claim ${claimNumber}`);
    setMessage('');
    setSelectedTemplate('');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={`
        fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="border-b p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Query Management</h2>
              <p className="text-xs text-gray-500 mt-0.5">Claim #{claimNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={18} />
            </button>
          </div>

          {/* Query History */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium mb-3">Query History</h3>
            
            {previousQueries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No previous queries</p>
              </div>
            ) : (
              <div className="space-y-3">
                {previousQueries.map((query) => (
                  <div 
                    key={query.id} 
                    className={`
                      p-3 rounded-lg text-xs
                      ${query.type === 'sent' ? 'bg-blue-50 ml-4' : 'bg-gray-50 mr-4'}
                    `}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span className="font-medium">{query.from}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock size={10} />
                        <span className="text-2xs">{query.date}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-1">{query.message}</p>
                    {query.attachments && (
                      <div className="flex items-center gap-1 text-primary-500 mt-2">
                        <Paperclip size={10} />
                        <span className="text-2xs">{query.attachments[0]}</span>
                      </div>
                    )}
                    <div className="mt-2">
                      <span className={`
                        inline-block px-2 py-0.5 rounded text-2xs font-medium
                        ${query.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${query.status === 'responded' ? 'bg-green-100 text-green-700' : ''}
                        ${query.status === 'resolved' ? 'bg-gray-200 text-gray-600' : ''}
                      `}>
                        {query.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Query Section */}
          <div className="border-t p-4 space-y-3">
            <h3 className="text-sm font-medium">Send New Query</h3>
            
            {/* Templates */}
            <div>
              <label className="text-xs text-gray-500">Quick Templates</label>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {queryTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`
                      px-2 py-1 text-xs rounded border transition-colors
                      ${selectedTemplate === template.id 
                        ? 'bg-primary-50 border-primary-300 text-primary-700' 
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div>
              <label className="text-xs text-gray-500">Message</label>
              <textarea
                className="input text-xs mt-1"
                rows="4"
                placeholder="Type your query here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1">
                <Paperclip size={12} />
                Attach File
              </Button>
              <Button size="sm" className="flex-1" onClick={handleSendQuery}>
                <Send size={12} />
                Send Query
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QueryPanel;