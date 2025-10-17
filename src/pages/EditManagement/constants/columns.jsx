import StatusBadge from '../../../components/common/StatusBadge';
import AssignViewButton from '../components/AssignViewButton';
import TimeElapsed from '../components/TimeElapsed';

/**
 * Table column definitions for Edit Management
 */
export const editManagementColumns = [
  {
    key: 'actions',
    header: 'Actions',
    sortable: false,
    render: (_value, row) => <AssignViewButton row={row} />,
  },
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
    render: (_value, row) => <TimeElapsed createdAt={row.created_at} />,
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
