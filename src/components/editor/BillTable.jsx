import React, { Fragment } from 'react';
import { Plus, Copy, Trash2 } from 'lucide-react';
import useEditorStore from '../../store/useEditorStore';
import { mockData } from '../../utils/mockData';
import Button from '../common/Button';

const BillTable = ({ isLocked = false }) => {
  const { billItems, updateBillItem, addBillItem, deleteBillItem, duplicateBillItem } = useEditorStore();

  // Get available invoice numbers from documents
  const availableInvoices = [
    { id: 'NMC302412/24', name: 'Main Invoice (NMC302412/24)' },
    { id: 'NMC302413/24', name: 'Additional Charges (NMC302413/24)' },
    { id: 'INV-001', name: 'Default Invoice (INV-001)' }
  ];

  // Group items by invoice number for multiple invoice support
  const groupedByInvoice = billItems.reduce((groups, item) => {
    const invoice = item.invoiceNumber || 'INV-001';
    if (!groups[invoice]) {
      groups[invoice] = [];
    }
    groups[invoice].push(item);
    return groups;
  }, {});

  // Calculate subtotals per invoice
  const calculateInvoiceSubtotal = (items) => {
    return items.reduce((sum, item) => sum + (item.invoicedAmount || 0), 0);
  };

  // Get unique invoice numbers for easy invoice switching
  const invoiceNumbers = Object.keys(groupedByInvoice);
  const hasMultipleInvoices = invoiceNumbers.length > 1;

  // Color coding system for alerts
  const getRowColorClasses = (item) => {
    const classes = [];
    const itemDate = new Date(item.itemDate || Date.now());
    const currentDate = new Date();
    const daysDiff = Math.floor((currentDate - itemDate) / (1000 * 60 * 60 * 24));

    // Date-based alerts (Yellow for items older than 30 days)
    if (daysDiff > 30) {
      classes.push('bg-orange-50 border-orange-200 text-orange-900');
    }

    // Discrepancy highlighting (Orange for mismatches)
    const expectedAmount = (item.quantity || 0) * (item.unitPrice || 0);
    const actualAmount = item.invoicedAmount || 0;
    if (Math.abs(expectedAmount - actualAmount) > 0.01) {
      classes.push('bg-purple-50 border-purple-200 text-purple-900');
    }

    return classes.join(' ');
  };

  // Get alert indicators for items
  const getAlertIndicators = (item) => {
    const indicators = [];
    const itemDate = new Date(item.itemDate || Date.now());
    const currentDate = new Date();
    const daysDiff = Math.floor((currentDate - itemDate) / (1000 * 60 * 60 * 24));

    if (daysDiff > 30) {
      indicators.push({ type: 'date', level: 'warning', message: `Old date: ${daysDiff} days ago` });
    }

    const expectedAmount = (item.quantity || 0) * (item.unitPrice || 0);
    const actualAmount = item.invoicedAmount || 0;
    if (Math.abs(expectedAmount - actualAmount) > 0.01) {
      indicators.push({ type: 'calculation', level: 'error', message: 'Amount mismatch detected' });
    }

    return indicators;
  };

  // Utility function for decimal precision with floor
  const floorToDecimal = (value, decimals = 2) => {
    const factor = Math.pow(10, decimals);
    return Math.floor(value * factor) / factor;
  };

  const formatDecimal = (value, decimals = 2) => {
    if (value == null || isNaN(value)) return '0.00';
    return parseFloat(value).toFixed(decimals);
  };

  const handleAmountChange = (itemId, field, value) => {
    const numValue = parseFloat(value) || 0;
    const item = billItems.find(i => i.id === itemId);
    
    if (!item) return; // Safety check - exit if item not found
    
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? numValue : item.quantity;
      const unitPrice = field === 'unitPrice' ? floorToDecimal(numValue) : item.unitPrice;
      const invoicedAmount = floorToDecimal(quantity * unitPrice);
      
      updateBillItem(itemId, { 
        [field]: field === 'unitPrice' ? floorToDecimal(numValue) : numValue, 
        invoicedAmount,
        savings: floorToDecimal(invoicedAmount - (item.approvedAmount || 0))
      });
    } else if (field === 'invoicedAmount') {
      const flooredAmount = floorToDecimal(numValue);
      updateBillItem(itemId, { 
        invoicedAmount: flooredAmount,
        savings: floorToDecimal(flooredAmount - (item.approvedAmount || 0))
      });
    } else if (field === 'approvedAmount') {
      const flooredApproved = floorToDecimal(numValue);
      updateBillItem(itemId, { 
        approvedAmount: flooredApproved,
        savings: floorToDecimal((item.invoicedAmount || 0) - flooredApproved),
        status: flooredApproved === 0 ? 'irrelevant' : flooredApproved === item.invoicedAmount ? 'relevant' : 'query'
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Multiple Invoice Indicator */}
      {hasMultipleInvoices && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-600 font-medium">Multiple Invoices Detected:</span>
            <div className="flex gap-2">
              {invoiceNumbers.map((invoice, index) => (
                <span key={invoice} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {invoice} ({groupedByInvoice[invoice].length} items)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-primary-500 text-white">
            <tr>
              <th className="px-2 py-2 text-left">Invoice #</th>
              <th className="px-2 py-2 text-left">Item Date</th>
              <th className="px-2 py-2 text-left">Category</th>
              <th className="px-2 py-2 text-left">Item Name</th>
              <th className="px-2 py-2 text-center">Qty</th>
              <th className="px-2 py-2 text-right">Unit Price</th>
              <th className="px-2 py-2 text-right">Invoiced Amount</th>
              <th className="px-2 py-2 text-center">Preauth Amount</th>
              <th className="px-2 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoiceNumbers.map((invoiceNumber, invoiceIndex) => (
              <Fragment key={invoiceNumber}>
                {/* Invoice Group Header (only show for multiple invoices) */}
                {hasMultipleInvoices && (
                  <tr className="bg-gray-100 border-t-2 border-gray-300">
                    <td colSpan="9" className="px-2 py-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Invoice: {invoiceNumber}</span>
                        <span className="text-gray-600">
                          Subtotal: {formatDecimal(calculateInvoiceSubtotal(groupedByInvoice[invoiceNumber]))}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
                
                {/* Invoice Items */}
                {groupedByInvoice[invoiceNumber].map((item) => {
                  const rowColorClasses = getRowColorClasses(item);
                  const alertIndicators = getAlertIndicators(item);
                  
                  return (
              <tr 
                key={item.id} 
                className={`border-b hover:opacity-80 transition-all ${rowColorClasses || 'hover:bg-gray-50'}`}
                title={alertIndicators.length > 0 ? alertIndicators.map(a => a.message).join(', ') : ''}
              >
                <td className="px-2 py-1">
                  <select
                    className="w-32 text-xs border rounded px-1 py-0.5 bg-white"
                    value={item.invoiceNumber || 'INV-001'}
                    onChange={(e) => updateBillItem(item.id, { invoiceNumber: e.target.value })}
                    disabled={isLocked}
                  >
                    {availableInvoices.map((invoice) => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.id}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <input
                    type="date"
                    className="w-24 text-xs border rounded px-1 py-0.5"
                    value={item.itemDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => updateBillItem(item.id, { itemDate: e.target.value })}
                    disabled={isLocked}
                  />
                </td>
                <td className="px-2 py-1">
                  <select 
                    className="w-full text-xs border rounded px-1 py-0.5"
                    value={item.category}
                    onChange={(e) => updateBillItem(item.id, { category: e.target.value })}
                    disabled={isLocked}
                  >
                    {mockData.itemCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <input
                    type="text"
                    className="w-full text-xs border rounded px-1 py-0.5"
                    value={item.itemName}
                    onChange={(e) => updateBillItem(item.id, { itemName: e.target.value })}
                    disabled={isLocked}
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    className="w-12 text-xs border rounded px-1 py-0.5 text-center"
                    value={item.quantity}
                    onChange={(e) => handleAmountChange(item.id, 'quantity', e.target.value)}
                    disabled={isLocked}
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    className="w-20 text-xs border rounded px-1 py-0.5 text-right"
                    value={formatDecimal(item.unitPrice || 0)}
                    onChange={(e) => handleAmountChange(item.id, 'unitPrice', e.target.value)}
                    step="0.01"
                    disabled={isLocked}
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    className="w-20 text-xs border rounded px-1 py-0.5 text-right"
                    value={formatDecimal(item.invoicedAmount || 0)}
                    onChange={(e) => handleAmountChange(item.id, 'invoicedAmount', e.target.value)}
                    step="0.01"
                    disabled={isLocked}
                  />
                </td>
                <td className="px-2 py-1 text-center">
                  <span className="text-xs text-gray-600">
                    {item.category === 'Consultation' ? 'NA' : 
                     item.preAuthAmount ? formatDecimal(item.preAuthAmount) : 'NA'}
                  </span>
                </td>
                <td className="px-2 py-1">
                  {!isLocked && (
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => duplicateBillItem(item.id)}
                        className="p-0.5 hover:bg-gray-100 rounded"
                        title="Duplicate"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this item?')) deleteBillItem(item.id);
                        }}
                        className="p-0.5 hover:bg-red-100 text-red-600 rounded"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {!isLocked && (
        <Button size="sm" onClick={addBillItem}>
          <Plus size={12} />
          Add Row
        </Button>
      )}
    </div>
  );
};

export default BillTable;