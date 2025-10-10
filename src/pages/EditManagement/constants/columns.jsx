import StatusBadge from '../../../components/common/StatusBadge';

/**
 * Table column definitions for Edit Management
 */
export const editManagementColumns = [
  {
    key: 'id',
    header: 'Claim ID',
    sortable: true,
  },
  {
    key: 'visit_number',
    header: 'Visit Number',
    sortable: true,
  },
  {
    key: 'created_at',
    header: 'Date & Time',
    sortable: true,
    render: (value) => {
      if (!value) return '-';
      const date = new Date(value);
      const formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return (
        <div>
          <div className="font-medium text-gray-900">{formattedDate}</div>
          <div className="text-xs text-gray-500">{formattedTime}</div>
        </div>
      );
    },
  },
  {
    key: 'time_elapsed',
    header: 'Time Elapsed',
    render: (value) => {
      if (!value) return '-';
      return (
        <div className="flex items-center gap-1 text-blue-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{value.hours}h {value.minutes}m</span>
        </div>
      );
    },
  },
  {
    key: 'provider_name',
    header: 'Provider',
    sortable: true,
  },
  {
    key: 'benefit_type',
    header: 'Benefit Type',
    render: (value) => <StatusBadge status={value} />,
  },
  {
    key: 'benefit_name',
    header: 'Benefit Name',
  },
  {
    key: 'diagnosis',
    header: 'Diagnosis',
  },
  {
    key: 'decision',
    header: 'Decision',
    render: (value) => <StatusBadge status={value} />,
  },
];
