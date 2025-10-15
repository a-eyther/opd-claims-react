import { useState, useEffect, useRef } from 'react'

/**
 * Checklist Tab Component
 * Displays invoice checklist with verification fields
 */
const ChecklistTab = ({ lctClaimRequest, invoices = [], onSave }) => {
  // Extract data from lctClaimRequest
  const lctInvoices = lctClaimRequest?.claim_data?.invoices || []
  const patientDetails = lctClaimRequest?.claim_data?.patient_details || {}
  const patientName = patientDetails.patient_name || patientDetails.name || 'N/A'
  const visitNumber = lctClaimRequest?.claim_data?.visit_number || 'N/A'

  // Use lct invoices if available, fallback to regular invoices
  const displayInvoices = lctInvoices.length > 0 ? lctInvoices : invoices

  // State for checklist checkboxes - one state per invoice
  const [checklistStates, setChecklistStates] = useState(
    displayInvoices.map(() => ({
      invoice_number: false,
      beneficiary_name: false,
      visit_number: false,
      invoice_date: false,
      total_amount: false
    }))
  )

  // Use ref to store current state for save function
  const checklistStatesRef = useRef(checklistStates)
  useEffect(() => {
    checklistStatesRef.current = checklistStates
  }, [checklistStates])

  // Handle checkbox change
  const handleCheckboxChange = (invoiceIndex, field) => {
    setChecklistStates(prev => {
      const newStates = [...prev]
      newStates[invoiceIndex] = {
        ...newStates[invoiceIndex],
        [field]: !newStates[invoiceIndex][field]
      }
      return newStates
    })
  }

  // Expose save function to parent only once on mount
  useEffect(() => {
    if (onSave) {
      const saveFunction = () => {
        // Use ref to get current state at save time
        const currentState = checklistStatesRef.current
        console.log('ChecklistTab saveFunction called, current state:', currentState)

        // Build checklist_data object with invoice numbers as keys
        const checklistData = {}
        displayInvoices.forEach((invoice, index) => {
          const invoiceNumber = invoice.invoice_number || invoice.invoiceNumber
          if (invoiceNumber) {
            checklistData[invoiceNumber] = currentState[index] || {
              invoice_number: false,
              beneficiary_name: false,
              visit_number: false,
              invoice_date: false,
              total_amount: false
            }
          }
        })

        return {
          checklist_data: checklistData
        }
      }
      console.log('ChecklistTab: Setting save function')
      // Wrap in a function to prevent React from calling it
      onSave(() => saveFunction)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  return (
    <div className="space-y-4">
      {!displayInvoices || displayInvoices.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No invoice data available
        </div>
      ) : null}
      {displayInvoices.map((invoice, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">{invoice.invoice_number || invoice.invoiceNumber}</h3>
            {/* <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Show this invoice
            </button> */}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Invoice Number */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={checklistStates[index]?.invoice_number || false}
                  onChange={() => handleCheckboxChange(index, 'invoice_number')}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Invoice Number</div>
                  <div className="text-xs text-gray-600">{invoice.invoice_number || invoice.invoiceNumber}</div>
                </div>
              </div>

              {/* Visit Number */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={checklistStates[index]?.visit_number || false}
                  onChange={() => handleCheckboxChange(index, 'visit_number')}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Visit Number</div>
                  <div className="text-xs text-gray-600">{visitNumber}</div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={checklistStates[index]?.total_amount || false}
                  onChange={() => handleCheckboxChange(index, 'total_amount')}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Total Amount</div>
                  <div className="text-xs text-gray-600">₹{invoice.invoice_amount || invoice.invoice_amount}</div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Beneficiary Name */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={checklistStates[index]?.beneficiary_name || false}
                  onChange={() => handleCheckboxChange(index, 'beneficiary_name')}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Beneficiary Name</div>
                  <div className="text-xs text-gray-600">{patientName}</div>
                </div>
              </div>

              {/* Invoice Date */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={checklistStates[index]?.invoice_date || false}
                  onChange={() => handleCheckboxChange(index, 'invoice_date')}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Invoice Date</div>
                  <div className="text-xs text-gray-600">{invoice.invoice_date || invoice.invoiceDate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ChecklistTab
