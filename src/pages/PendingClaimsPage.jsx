import React from 'react';
import { Clock, AlertTriangle, MessageSquare, CheckCircle } from 'lucide-react';

const PendingClaimsPage = () => {
  const stats = [
    { label: 'Total Pending', value: '47', change: '↑ 12% from yesterday', icon: Clock, color: 'text-primary-500' },
    { label: 'Urgent Claims', value: '5', change: 'Approaching TAT deadline', icon: AlertTriangle, color: 'text-red-500' },
    { label: 'With Queries', value: '12', change: 'Awaiting responses', icon: MessageSquare, color: 'text-yellow-500' },
    { label: 'Ready for Review', value: '30', change: 'All documents complete', icon: CheckCircle, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Pending Claims</h1>
        <p className="text-sm text-gray-600 mt-1">Claims awaiting review and approval</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <stat.icon className={`${stat.color}`} size={20} />
            </div>
            <div className="text-2xl font-semibold">{stat.value}</div>
            <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
            <div className="text-xs text-gray-600">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-medium mb-4">Pending Claims Queue</h2>
        <p className="text-sm text-gray-600">
          This section would display filtered claims that are pending review.
          The implementation would reuse the claims list component with a filter for pending status.
        </p>
      </div>
    </div>
  );
};

export default PendingClaimsPage;