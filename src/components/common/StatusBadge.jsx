/**
 * Status Badge Component
 * Displays status with appropriate color coding
 * @param {Object} props
 * @param {string} props.status - Status value
 */
const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    const statusUpper = status?.toUpperCase() || '';

    if (statusUpper.includes('APPROVED') && statusUpper.includes('MODIFIED')) {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }

    switch (statusUpper) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'DECISION PENDING':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'OPD':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DENTAL':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'OPTICAL':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!status) return null;

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        border ${getStatusStyles()}
      `}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
