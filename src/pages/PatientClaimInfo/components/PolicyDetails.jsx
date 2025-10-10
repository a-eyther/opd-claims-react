/**
 * Policy Details Component
 * Displays policy information in a card layout
 */
const PolicyDetails = ({ policy }) => {
  return (
    <div className="bg-white text-black rounded-lg border border-gray-200  p-5">
      <h3 className="text-base font-semibold mb-4">Policy Details</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            POLICY NUMBER
          </label>
          <p className="text-sm font-medium">{policy?.policyNumber}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            SCHEME NAME
          </label>
          <p className="text-sm font-medium">{policy?.schemeName}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            POLICY PERIOD
          </label>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{policy?.policyPeriod}</p>
            {policy?.policyStatus && (
              <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                {policy.policyStatus}
              </span>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            BENEFIT TYPE
          </label>
          <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded border border-purple-200">
            {policy?.benefitType}
          </span>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            BENEFIT NAME
          </label>
          <p className="text-sm font-medium">{policy?.benefitName}</p>
        </div>
      </div>
    </div>
  )
}

export default PolicyDetails
