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
    key: 'visitNumber',
    header: 'Visit Number',
    sortable: true,
  },
  {
    key: 'date',
    header: 'Date & Time',
    sortable: true,
    render: (value, row) => (
      <div>
        <div className="font-medium">{row.date}</div>
        <div className="text-xs text-gray-500">{row.time}</div>
      </div>
    ),
  },
  {
    key: 'timeElapsed',
    header: 'Time Elapsed',
    render: (value) => (
      <div className="flex items-center gap-1 text-blue-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm">{value}</span>
      </div>
    ),
  },
  {
    key: 'provider',
    header: 'Provider',
    sortable: true,
  },
  {
    key: 'benefitType',
    header: 'Benefit Type',
    render: (value) => <StatusBadge status={value} />,
  },
  {
    key: 'benefitName',
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
