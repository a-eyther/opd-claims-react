import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '../../../components/icons'

/**
 * Action Bar Component
 * Displays bottom action bar with navigation and action buttons
 */
const ActionBar = ({ queryCount = 0, onSave, onQueryClick, activeTab, invoices = [], validatedInvoices = {} }) => {
  const navigate = useNavigate()

  // Calculate if there are pending invoices in digitisation tab
  const hasPendingInvoices = activeTab === 'digitisation' &&
    invoices.length > 0 &&
    Object.keys(validatedInvoices).length < invoices.length

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={onQueryClick}
            disabled
            className="relative px-6 py-2 text-sm font-medium bg-gray-300 text-gray-500 border border-gray-300 rounded-md cursor-not-allowed transition-colors"
          >
            Query
            {queryCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full min-w-[20px] text-center">
                {queryCount}
              </span>
            )}
          </button>
          <button
            onClick={onSave}
            disabled={hasPendingInvoices}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              hasPendingInvoices
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActionBar
