/**
 * Checklist Tab Component
 * Displays invoice checklist with verification fields
 */
const ChecklistTab = ({ invoices = [] }) => {
  return (
    <div className="space-y-4">
      {invoices.map((invoice, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
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
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Invoice Number</div>
                  <div className="text-xs text-gray-600">{invoice.invoiceNumber}</div>
                </div>
              </div>

              {/* Visit Number */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Visit Number</div>
                  <div className="text-xs text-gray-600">{invoice.visitNumber}</div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Total Amount</div>
                  <div className="text-xs text-gray-600">₹{invoice.totalAmount?.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Beneficiary Name */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Beneficiary Name</div>
                  <div className="text-xs text-gray-600">{invoice.beneficiaryName}</div>
                </div>
              </div>

              {/* Invoice Date */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Invoice Date</div>
                  <div className="text-xs text-gray-600">{invoice.invoiceDate}</div>
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
