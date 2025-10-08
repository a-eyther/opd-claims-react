import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '../../../components/icons'

/**
 * Action Bar Component
 * Displays bottom action bar with navigation and action buttons
 */
const ActionBar = ({ queryCount = 0, onSave, onQueryClick }) => {
  const navigate = useNavigate()

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
            className="relative px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActionBar
