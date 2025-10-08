import { ClockIcon } from '../icons'

/**
 * Timer Badge Component
 * Displays countdown timer with status
 */
const TimerBadge = ({ time, status, variant = 'green' }) => {
  const variantStyles = {
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  }

  return (
    <div className="flex items-center gap-2">
      <ClockIcon className={`w-4 h-4 ${variantStyles[variant]}`} />
      <div className="flex flex-col">
        <span className={`text-lg font-semibold ${variantStyles[variant]}`}>
          {time}
        </span>
        <span className="text-xs text-gray-500">{status}</span>
      </div>
    </div>
  )
}

export default TimerBadge
