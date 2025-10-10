import { LockIcon } from '../../../components/icons'

/**
 * Tab Navigation Component
 * Displays horizontal tab navigation
 */
const TabNavigation = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="bg-white px-6 flex-shrink-0 mt-2 ">
      <div className="bg-[#f1f5f9] px-1 flex gap-1 overflow-x-auto rounded-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.locked && onTabChange(tab.id)}
            disabled={tab.locked}
            className={`m-1 px-2 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-black rounded-md shadow-xl'
                : tab.locked
                ? 'border-transparent text-gray-400 cursor-not-allowed'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.locked && <LockIcon className="w-3 h-3" />}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TabNavigation
