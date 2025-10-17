import { useState, useEffect, useRef } from 'react'
import claimsService from '../../../services/claimsService'

/**
 * Clinical Validation Tab Component
 * Displays financial summary and invoice validation tables
 */
const ClinicalValidationTab = ({
  invoices = [],
  financials = {},
  loading = false,
  error = null,
  rawApiResponse = null,
  claimUniqueId = null,
  onSave = null,
  onRerunSuccess = null,
  onShowInvoice = null,
  onInvoiceItemsChange = null
}) => {
  const [invoiceItems, setInvoiceItems] = useState(invoices)
  const [updating, setUpdating] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [rerunning, setRerunning] = useState(false)

  // Update invoiceItems when invoices prop changes
  useEffect(() => {
    setInvoiceItems(invoices)
    setHasChanges(false)
  }, [invoices])

  // Notify parent when invoice items change
  useEffect(() => {
    if (onInvoiceItemsChange) {
      onInvoiceItemsChange(invoiceItems)
    }
  }, [invoiceItems, onInvoiceItemsChange])

  // Calculate totals from invoice items
  const calculatedTotals = invoiceItems.reduce((acc, invoice) => {
    invoice.items?.forEach(item => {
      acc.totalApproved += parseFloat(item.appAmt) || 0
      acc.totalInvoiced += parseFloat(item.invAmt) || 0
    })
    return acc
  }, { totalApproved: 0, totalInvoiced: 0 })

  // Get total savings from adjudication_response
  const totalSavingsFromAPI = rawApiResponse?.data?.adjudication_response?.total_savings || 0

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

  const saveAdjudicationData = async () => {
    if (!rawApiResponse || !claimUniqueId) {
      console.warn('Missing rawApiResponse or claimUniqueId for adjudication update')
      return false
    }

    try {
      setUpdating(true)

      // Clone the adjudication_response from raw API response
      const adjudicationResponse = JSON.parse(JSON.stringify(rawApiResponse.data.adjudication_response))

      console.log('Invoice Items before saving:', invoiceItems)
      console.log('Original billing_data:', adjudicationResponse.billing_data)

      // Update all items in billing_data
      let globalItemIndex = 0
      invoiceItems.forEach((invoice) => {
        invoice.items.forEach((item) => {
          if (adjudicationResponse.billing_data && adjudicationResponse.billing_data[globalItemIndex]) {
            const billingItem = adjudicationResponse.billing_data[globalItemIndex]

            console.log(`Updating item ${globalItemIndex}:`, {
              appQty: item.appQty,
              appAmt: item.appAmt,
              editorReason: item.editorReason
            })

            // Map the fields: APP QTY -> approved_quantity, APP AMT -> approved_amount, Editor Reason -> editor_reason
            billingItem.approved_quantity = parseFloat(item.appQty) || 0
            billingItem.approved_amount = parseFloat(item.appAmt) || 0

            // Update editor reason in editor_reason field if it's not empty
            if (item.editorReason && item.editorReason.trim() !== '') {
              billingItem.editor_reason = item.editorReason
            }

            // Recalculate savings (never negative)
            const calculatedSavings = (billingItem.request_amount || 0) - (billingItem.approved_amount || 0)
            billingItem.savings = calculatedSavings < 0 ? 0 : calculatedSavings
          }
          globalItemIndex++
        })
      })

      console.log('Updated billing_data:', JSON.parse(JSON.stringify(adjudicationResponse.billing_data)))

      // Recalculate total_allowed_amount and total_savings
      let totalAllowedAmount = 0

      adjudicationResponse.billing_data.forEach(item => {
        totalAllowedAmount += item.approved_amount || 0
      })

      // Calculate total_savings as total_request_amount - total_allowed_amount
      const totalRequestAmount = adjudicationResponse.total_request_amount || 0
      const totalSavings = totalRequestAmount - totalAllowedAmount

      // Update adjudication_response totals
      adjudicationResponse.total_allowed_amount = totalAllowedAmount
      adjudicationResponse.total_savings = totalSavings < 0 ? 0 : totalSavings

      // Prepare the payload with the entire adjudication_response
      const payload = {
        adjudication_response: adjudicationResponse
      }

      console.log('Final payload being sent to API:', JSON.parse(JSON.stringify(payload)))

      // Call the API
      const response = await claimsService.updateManualAdjudication(claimUniqueId, payload)

      setHasChanges(false)
      return true

    } catch (err) {
      console.error('Error updating adjudication data:', err)
      return false
    } finally {
      setUpdating(false)
    }
  }

  // Expose save function to parent via callback
  useEffect(() => {
    if (onSave) {
      onSave(saveAdjudicationData)
    }
  }, [invoiceItems, rawApiResponse, claimUniqueId])

  // Handle Rerun button click
  const handleRerun = async () => {
    if (!claimUniqueId) {
      alert('Claim ID is required for re-adjudication')
      return
    }

    try {
      setRerunning(true)

      // Step 1: Call re-adjudicate API
      const reAdjudicateResponse = await claimsService.reAdjudicate(claimUniqueId)

      // Step 2: Fetch updated AI adjudication data
      const aiAdjudicationResponse = await claimsService.getAIAdjudication(claimUniqueId)

      // Step 3: Notify parent component to update data
      if (onRerunSuccess) {
        onRerunSuccess(aiAdjudicationResponse)
      }

      alert('Re-adjudication completed successfully!')
    } catch (err) {
      console.error('Error during re-adjudication:', err)
      alert('Failed to re-adjudicate claim. Please try again.')
    } finally {
      setRerunning(false)
    }
  }

  const handleFieldChange = (invoiceIndex, itemIndex, field, value) => {
    const updatedInvoices = [...invoiceItems]
    const item = updatedInvoices[invoiceIndex].items[itemIndex]

    // Update the field
    item[field] = value

    // If APP QTY changes, recalculate APP AMT based on UNIT PRICE
    if (field === 'appQty') {
      const appQty = parseFloat(value) || 0
      const unitPrice = item.unitPrice || 0
      item.appAmt = appQty * unitPrice

      // Recalculate savings (never show negative)
      const calculatedSavings = (item.invAmt || 0) - item.appAmt
      item.savings = calculatedSavings < 0 ? 0 : calculatedSavings
    }

    // If APP AMT changes, recalculate savings
    if (field === 'appAmt') {
      const appAmt = parseFloat(value) || 0
      const calculatedSavings = (item.invAmt || 0) - appAmt
      item.savings = calculatedSavings < 0 ? 0 : calculatedSavings
    }

    setInvoiceItems(updatedInvoices)

    // Mark that changes have been made
    if (field === 'appQty' || field === 'appAmt' || field === 'editorReason') {
      setHasChanges(true)
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Fetching updated data...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
            <p className="text-gray-600">Unable to load clinical validation data.</p>
          </div>
        </div>
      )}

      {/* Updating Indicator */}
      {updating && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-20 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Saving changes...</span>
        </div>
      )}

      {/* Content - Only show if no error */}
      {!error && (
        <>
          {/* Financial Summary Cards */}
          <div className="flex items-center justify-between gap-4">
        {/* Rerun Button */}
        <button
          onClick={handleRerun}
          disabled={rerunning}
          className="ml-auto px-4 py-2 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50 font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={rerunning ? 'animate-spin' : ''}>↻</span>
          <span>{rerunning ? 'Rerunning...' : 'Rerun'}</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Total Requested Amount */}
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="text-[10px] text-gray-600 uppercase mb-1">TOTAL REQUESTED AMOUNT</div>
          <div className="text-lg font-bold text-gray-900">KES {financials.totalRequested?.toLocaleString()}</div>
        </div>
        {/* Total Invoiced Amount */}
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="text-[10px] text-gray-600 uppercase mb-1">TOTAL INVOICED AMOUNT</div>
          <div className="text-lg font-bold text-gray-900">KES {calculatedTotals.totalInvoiced.toLocaleString()}</div>
        </div>

        

        {/* Total Approved Amount */}
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="text-[10px] text-green-600 uppercase mb-1">TOTAL APPROVED AMOUNT</div>
          <div className="text-lg font-bold text-green-600">KES {calculatedTotals.totalApproved.toLocaleString()}</div>
        </div>

        {/* Total Savings Amount */}
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="text-[10px] text-red-600 uppercase mb-1">TOTAL SAVINGS AMOUNT</div>
          <div className="text-lg font-bold text-red-600">KES {totalSavingsFromAPI.toLocaleString()}</div>
        </div>
      </div>

      {/* Invoice Tables */}
      <div className="space-y-6">
        {invoiceItems.map((invoice, invoiceIndex) => (
          <div key={invoiceIndex} className="border border-gray-200 rounded-lg bg-white">
            {/* Invoice Header */}
            {/* <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber} - Clinical Validation</h3>
              <button
                onClick={() => onShowInvoice && onShowInvoice(invoice.invoiceNumber)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Show This Invoice
              </button>
            </div> */}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Medicine Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Inv Qty</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase w-24">App Qty</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Unit Price</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Preauth Amt</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Inv Amt</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase w-28">App Amt</th>
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
                      <td className="px-3 py-3 w-24">
                        <input
                          type="number"
                          value={item.appQty}
                          onChange={(e) => handleFieldChange(invoiceIndex, itemIndex, 'appQty', e.target.value)}
                          className="w-full min-w-[80px] px-2 py-1 border border-gray-300 rounded text-gray-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3 text-gray-700">{(parseFloat(item.unitPrice) || 0).toFixed(2)}</td>
                      <td className="px-3 py-3 text-gray-700">{(parseFloat(item.preauthAmt) || 0).toFixed(2)}</td>
                      <td className="px-3 py-3 text-gray-700">{(parseFloat(item.invAmt) || 0).toFixed(2)}</td>
                      <td className="px-3 py-3 w-28">
                        <input
                          type="number"
                          value={item.appAmt}
                          onChange={(e) => handleFieldChange(invoiceIndex, itemIndex, 'appAmt', e.target.value)}
                          className="w-full min-w-[96px] px-2 py-1 border border-gray-300 rounded text-gray-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3 text-gray-700">{(parseFloat(item.savings) || 0).toFixed(2)}</td>
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
        </>
      )}
    </div>
  )
}

export default ClinicalValidationTab
