/**
 * Financial Summary Component
 * Displays financial metrics in a card format
 */
const FinancialSummary = ({ label, amount, variant = 'default' }) => {
  const variantStyles = {
    default: 'text-gray-900',
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    green: 'text-green-600'
  }

  return (
    <div className="text-right">
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className={`text-base font-semibold ${variantStyles[variant]}`}>
        Kes. {amount?.toLocaleString() || 0}
      </div>
    </div>
  )
}

export default FinancialSummary
