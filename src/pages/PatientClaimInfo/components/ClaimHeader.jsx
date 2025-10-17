import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '../../../components/icons'
import FinancialSummary from '../../../components/common/FinancialSummary'

/**
 * Claim Header Component
 * Displays claim header with status, timer, and financial summary
 */
const ClaimHeader = ({ claimId,claim_id, status, benefitType, timeRemaining, financials }) => {
  const navigate = useNavigate()

  //console.log('ClaimHeader received timeRemaining:', timeRemaining)

  // Format time remaining in MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get timer icon color
  const getIconColor = () => {
    if (timeRemaining === 0) return 'text-red-500'
    if (timeRemaining < 60) return 'text-red-500'
    if (timeRemaining < 120) return 'text-yellow-500'
    return 'text-green-500'
  }

  // Get timer text color
  const getTextColor = () => {
    if (timeRemaining === 0) return 'text-red-500'
    if (timeRemaining < 60) return 'text-red-500'
    if (timeRemaining < 120) return 'text-yellow-500'
    return 'text-green-500'
  }

  // Get status text
  const getStatusText = () => {
    if (timeRemaining === 0) return '⚡ URGENT ACTION'
    if (timeRemaining < 60) return 'ACTION REQUIRED'
    if (timeRemaining < 120) return 'ACTION REQUIRED'
    return 'ACTION REQUIRED'
  }

  // Get blinking class
  const getBlinkClass = () => {
    if (timeRemaining === 0) return 'animate-pulse'
    if (timeRemaining < 60) return 'animate-pulse'
    return ''
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <h5 className="text-xl text-black font-semibold">Claim ID: {claim_id} </h5>
            <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-sm font-medium rounded border border-orange-200">
              {status}
            </span>
            <span className="px-2.5 py-1 bg-purple-50 text-purple-600 text-sm font-medium rounded border border-purple-200">
              {benefitType}
            </span>
          </div>
          <div className="ml-4 flex items-center gap-2">
            <div className={getIconColor()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="flex flex-col">
              <div className={`text-lg font-bold ${getTextColor()} ${getBlinkClass()}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className={`text-[10px] font-medium ${getTextColor()}`}>
                {getStatusText()}
              </div>
            </div>
            {timeRemaining === 0 && (
              <div className="ml-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="flex gap-4">
          <FinancialSummary
            label="Total Requested"
            amount={financials.totalRequested}
            variant="default"
          />
          <FinancialSummary
            label="Pre-Auth Amount"
            amount={financials.preAuthAmount}
            variant="purple"
          />
          <FinancialSummary
            label="Approved"
            amount={financials.approved}
            variant="blue"
          />
          <FinancialSummary
            label="Total Savings"
            amount={financials.totalSavings}
            variant="green"
          />
        </div>
      </div>
    </div>
  )
}

export default ClaimHeader
