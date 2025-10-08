import { useState } from 'react'

/**
 * Clinical Validation Tab Component
 * Displays financial summary and invoice validation tables
 */
const ClinicalValidationTab = ({ invoices = [], financials = {} }) => {
  const [invoiceItems, setInvoiceItems] = useState(invoices)

  const editorReasonOptions = [
    'No reason',
    'Dosage adjusted per clinical guidelines',
    'Quantity reduced to standard treatment duration',
    'Cost exceeds reasonable market price',
    'Alternative cheaper medication available',
    'Not medically necessary for condition',
    'Duplicate medication in treatment plan',
    'Exceeds policy benefit limits',
    'Requires prior authorization',
    'Custom reason...'
  ]

  const handleFieldChange = (invoiceIndex, itemIndex, field, value) => {
    const updatedInvoices = [...invoiceItems]
    updatedInvoices[invoiceIndex].items[itemIndex][field] = value
    setInvoiceItems(updatedInvoices)
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="flex items-center justify-between gap-4">
        {/* Rerun Button */}
        <button className="ml-auto px-4 py-2 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50 font-medium flex items-center gap-1">
          <span>↻</span>
          <span>Rerun</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Total Invoiced Amount */}
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="text-[10px] text-gray-600 uppercase mb-1">TOTAL INVOICED AMOUNT</div>
          <div className="text-lg font-bold text-gray-900">KES {financials.totalInvoiced?.toLocaleString()}</div>
        </div>

        {/* Total Requested Amount */}
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="text-[10px] text-gray-600 uppercase mb-1">TOTAL REQUESTED AMOUNT</div>
          <div className="text-lg font-bold text-gray-900">KES {financials.totalRequested?.toLocaleString()}</div>
        </div>

        {/* Total Approved Amount */}
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="text-[10px] text-green-600 uppercase mb-1">TOTAL APPROVED AMOUNT</div>
          <div className="text-lg font-bold text-green-600">KES {financials.totalApproved?.toLocaleString()}</div>
        </div>

        {/* Total Savings Amount */}
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="text-[10px] text-red-600 uppercase mb-1">TOTAL SAVINGS AMOUNT</div>
          <div className="text-lg font-bold text-red-600">KES {financials.totalSavings?.toLocaleString()}</div>
        </div>
      </div>

      {/* Invoice Tables */}
      <div className="space-y-6">
        {invoiceItems.map((invoice, invoiceIndex) => (
          <div key={invoiceIndex} className="border border-gray-200 rounded-lg bg-white">
            {/* Invoice Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber} - Clinical Validation</h3>
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Show This Invoice
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Medicine Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Inv Qty</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">App Qty</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Unit Price</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Preauth Amt</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Inv Amt</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">App Amt</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Savings</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Invoice No</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Category</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">System Reason</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Editor Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items?.map((item, itemIndex) => (
                    <tr key={itemIndex} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-gray-900">{item.medicineName}</td>
                      <td className="px-3 py-3 text-gray-700">{item.invQty}</td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={item.appQty}
                          onChange={(e) => handleFieldChange(invoiceIndex, itemIndex, 'appQty', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3 text-gray-700">{item.unitPrice?.toFixed(2)}</td>
                      <td className="px-3 py-3 text-gray-700">{item.preauthAmt?.toFixed(2)}</td>
                      <td className="px-3 py-3 text-gray-700">{item.invAmt?.toFixed(2)}</td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={item.appAmt}
                          onChange={(e) => handleFieldChange(invoiceIndex, itemIndex, 'appAmt', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3 text-gray-700">{item.savings?.toFixed(2)}</td>
                      <td className="px-3 py-3 text-blue-600">{item.invoiceNo}</td>
                      <td className="px-3 py-3 text-gray-700">{item.category}</td>
                      <td className="px-3 py-3 text-gray-600 text-[10px]">{item.systemReason}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <select
                            value={item.editorReason === 'Custom reason...' || (item.editorReason && !editorReasonOptions.includes(item.editorReason)) ? 'Custom reason...' : item.editorReason}
                            onChange={(e) => {
                              if (e.target.value === 'Custom reason...') {
                                handleFieldChange(invoiceIndex, itemIndex, 'editorReason', '')
                                handleFieldChange(invoiceIndex, itemIndex, 'customReason', true)
                              } else {
                                handleFieldChange(invoiceIndex, itemIndex, 'editorReason', e.target.value)
                                handleFieldChange(invoiceIndex, itemIndex, 'customReason', false)
                              }
                            }}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-blue-600 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          >
                            {editorReasonOptions.map((option, optionIndex) => (
                              <option key={optionIndex} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          {(item.customReason || (item.editorReason && !editorReasonOptions.includes(item.editorReason) && item.editorReason !== 'Custom reason...')) && (
                            <input
                              type="text"
                              value={item.customReason && item.editorReason === '' ? '' : (item.editorReason || '')}
                              onChange={(e) => handleFieldChange(invoiceIndex, itemIndex, 'editorReason', e.target.value)}
                              placeholder="Enter custom reason..."
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-blue-600 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Horizontal Scroll Indicator */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <button className="text-gray-400 hover:text-gray-600">
                <span className="text-lg">‹</span>
              </button>
              <div className="flex-1 mx-2">
                <div className="h-1 bg-gray-300 rounded-full"></div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <span className="text-lg">›</span>
              </button>
            </div>

            {/* Footer Summary */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-6 text-xs">
              <div>
                <span className="text-gray-600">Savings: </span>
                <span className="font-semibold text-gray-900">Kes. {invoice.totalSavings}</span>
              </div>
              <div>
                <span className="text-gray-600">Invoiced: </span>
                <span className="font-semibold text-gray-900">Kes. {invoice.totalInvoiced?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClinicalValidationTab
