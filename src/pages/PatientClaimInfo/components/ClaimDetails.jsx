/**
 * Claim Details Component
 * Displays claim information in a card layout
 */
const ClaimDetails = ({ claim }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200  p-5">
      <h3 className="text-base font-semibold mb-4">Claim Details</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            HOSPITAL
          </label>
          <p className="text-sm font-medium">{claim?.hospital}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            INVOICE NUMBERS
          </label>
          <p className="text-sm font-medium">{claim?.invoiceNumbers}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            INVOICE ID
          </label>
          <p className="text-sm font-medium">{claim?.invoiceId}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            INVOICE DATE
          </label>
          <p className="text-sm font-medium">{claim?.invoiceDate}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            VETTING STATUS
          </label>
          <p className="text-sm font-medium">{claim?.vettingStatus}</p>
        </div>
      </div>
    </div>
  )
}

export default ClaimDetails
