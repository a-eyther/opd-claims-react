import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useEditorStore from '../../store/useEditorStore';
import { mockData } from '../../utils/mockData';
import Button from '../common/Button';
import { useToast } from '../notifications/ToastContext';

const ClinicalValidationTable = ({ isLocked = false, headerActions = null, readOnly = false }) => {
  const { 
    medicineItems, 
    updateMedicineItem, 
    addMedicineItem, 
    deleteMedicineItem, 
    billItems,
    isClaimInfoLocked,
    isDigitizationLocked 
  } = useEditorStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [customReasons, setCustomReasons] = useState({});
  
  const bothSectionsLocked = isClaimInfoLocked && isDigitizationLocked;

  const handleAmountChange = (itemId, field, value) => {
    const numValue = parseFloat(value) || 0;
    const item = medicineItems.find(i => i.id === itemId);
    
    if (field === 'approvedQuantity' || field === 'unitPrice') {
      const quantity = field === 'approvedQuantity' ? numValue : item.approvedQuantity;
      const unitPrice = field === 'unitPrice' ? numValue : item.unitPrice;
      const approvedAmount = quantity * unitPrice;
      const savings = item.invoicedAmount - approvedAmount;
      
      updateMedicineItem(itemId, { 
        [field]: numValue, 
        approvedAmount,
        savings
      });
    } else if (field === 'approvedAmount') {
      const savings = item.invoicedAmount - numValue;
      updateMedicineItem(itemId, { 
        approvedAmount: numValue,
        savings
      });
    }
  };

  const handleDeductionReasonChange = (itemId, value) => {
    if (value === 'custom') {
      // Show custom reason input
      setCustomReasons({ ...customReasons, [itemId]: true });
    } else {
      // Use predefined reason
      updateMedicineItem(itemId, { editorDeductionReason: value });
      setCustomReasons({ ...customReasons, [itemId]: false });
    }
  };

  const handleCustomReasonChange = (itemId, value) => {
    updateMedicineItem(itemId, { 
      editorDeductionReason: 'custom',
      customDeductionReason: value
    });
  };

  const calculateTotals = () => {
    const totalInvoiced = medicineItems.reduce((sum, item) => sum + (item.invoicedAmount || 0), 0);
    const totalApproved = medicineItems.reduce((sum, item) => sum + (item.approvedAmount || 0), 0);
    const totalSavings = medicineItems.reduce((sum, item) => sum + (item.savings || 0), 0);
    const savingsPercent = totalInvoiced > 0 ? (totalSavings / totalInvoiced * 100).toFixed(2) : '0.00';
    
    return { totalInvoiced, totalApproved, totalSavings, savingsPercent };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Clinical Validation</h3>
        {headerActions}
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border rounded-lg p-3">
          <p className="text-xs text-gray-500">Total Invoiced</p>
          <p className="text-lg font-semibold text-primary-500">₹{totals.totalInvoiced.toFixed(2)}</p>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <p className="text-xs text-gray-500">Total Approved</p>
          <p className="text-lg font-semibold text-yellow-600">₹{totals.totalApproved.toFixed(2)}</p>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <p className="text-xs text-gray-500">Total Deductions</p>
          <p className="text-lg font-semibold text-green-600">₹{totals.totalSavings.toFixed(2)}</p>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <p className="text-xs text-gray-500">Deduction %</p>
          <p className="text-lg font-semibold">{totals.savingsPercent}%</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-primary-500 text-white">
            <tr>
              <th className="px-2 py-2 text-left w-32">Medicine Name</th>
              <th className="px-2 py-2 text-center">Invoice</th>
              <th className="px-2 py-2 text-center">Invoiced Qty</th>
              <th className="px-2 py-2 text-center">Approved Qty</th>
              <th className="px-2 py-2 text-right">Unit Price</th>
              <th className="px-2 py-2 text-right">Preauth Amount</th>
              <th className="px-2 py-2 text-right">Invoiced Amt</th>
              <th className="px-2 py-2 text-right">Approved Amt</th>
              <th className="px-2 py-2 text-right">Deduction</th>
              <th className="px-2 py-2 text-left">System Reason</th>
              <th className="px-2 py-2 text-left min-w-[180px]">Editor Reason</th>
            </tr>
          </thead>
          <tbody>
            {medicineItems.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-2 py-1 w-32">
                  <span className="text-xs font-medium truncate block" title={item.itemName}>
                    {item.itemName.length > 20 ? item.itemName.substring(0, 20) + '...' : item.itemName}
                  </span>
                </td>
                <td className="px-2 py-1">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {item.invoiceNumber || 'NMC302412/24'}
                  </span>
                </td>
                <td className="px-2 py-1 text-center">
                  <span className="font-medium">{item.quantity}</span>
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    className="w-12 text-xs border rounded px-1 py-0.5 text-center"
                    value={item.approvedQuantity}
                    onChange={(e) => handleAmountChange(item.id, 'approvedQuantity', e.target.value)}
                    disabled={isLocked || readOnly}
                  />
                </td>
                <td className="px-2 py-1 text-right">
                  <span className="text-xs">₹{item.unitPrice.toFixed(2)}</span>
                </td>
                <td className="px-2 py-1 text-right">
                  <span className="text-xs text-blue-600">₹{(item.preAuthAmount || 0).toFixed(2)}</span>
                </td>
                <td className="px-2 py-1 text-right">
                  <span className="font-medium">₹{item.invoicedAmount.toFixed(2)}</span>
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    className="w-20 text-xs border rounded px-1 py-0.5 text-right"
                    value={item.approvedAmount}
                    onChange={(e) => handleAmountChange(item.id, 'approvedAmount', e.target.value)}
                    step="0.01"
                    disabled={isLocked || readOnly}
                  />
                </td>
                <td className="px-2 py-1 text-right">
                  <span className={`font-medium ${item.savings > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    ₹{item.savings.toFixed(2)}
                  </span>
                </td>
                <td className="px-2 py-1">
                  {item.systemDeductionReason ? (
                    <span className="text-xs text-gray-600" title={item.systemDeductionReason}>
                      {item.systemDeductionReason.substring(0, 15)}...
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">NA</span>
                  )}
                </td>
                <td className="px-2 py-1 min-w-[180px]">
                  {customReasons[item.id] ? (
                    <input
                      type="text"
                      className="w-full text-xs border rounded px-1 py-0.5"
                      placeholder="Enter custom reason..."
                      value={item.customDeductionReason}
                      onChange={(e) => handleCustomReasonChange(item.id, e.target.value)}
                      onBlur={() => {
                        if (!item.customDeductionReason) {
                          setCustomReasons({ ...customReasons, [item.id]: false });
                        }
                      }}
                      disabled={isLocked || readOnly}
                    />
                  ) : (
                    <select 
                      className="w-full text-xs border rounded px-1 py-0.5"
                      value={item.editorDeductionReason}
                      onChange={(e) => handleDeductionReasonChange(item.id, e.target.value)}
                      disabled={isLocked || readOnly}
                    >
                      <option value="">NA</option>
                      {mockData.deductionReasons.map(reason => (
                        <option key={reason} value={reason} title={reason}>
                          {reason.length > 30 ? reason.substring(0, 30) + '...' : reason}
                        </option>
                      ))}
                      <option value="custom">Other (Custom)...</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      

      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <p className="text-xs text-blue-700">
          Validate clinical applicability of each item for the diagnosed conditions.
        </p>
      </div>

    </div>
  );
};

export default ClinicalValidationTable;