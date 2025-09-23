import React from 'react';
import { TrendingUp, Clock, DollarSign, Target } from 'lucide-react';

const AnalyticsPage = () => {
  const metrics = [
    { label: 'Claims Processed Today', value: '127', change: '↑ 23% from average', icon: TrendingUp },
    { label: 'Average TAT', value: '7.3 min', change: '↓ 2.1 min improvement', icon: Clock },
    { label: 'Total Savings', value: 'KES 485,230', change: '18.5% of total claims', icon: DollarSign },
    { label: 'Accuracy Rate', value: '96.8%', change: 'Above target (95%)', icon: Target },
  ];

  const topPerformers = [
    { name: 'John Executive', claims: 45, tat: '6.2 min', accuracy: '98.5%', savings: 'KES 125,340' },
    { name: 'Sarah Senior', claims: 38, tat: '7.8 min', accuracy: '97.2%', savings: 'KES 98,760' },
    { name: 'Mike Manager', claims: 42, tat: '7.1 min', accuracy: '96.8%', savings: 'KES 112,450' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Claim Analytics</h1>
        <p className="text-sm text-gray-600 mt-1">Performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <metric.icon className="text-primary-500" size={20} />
            </div>
            <div className="text-2xl font-semibold">{metric.value}</div>
            <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
            <div className="text-xs text-green-600">{metric.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-lg font-medium mb-4">Claims by Status</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Chart placeholder - Pie chart of claim statuses</p>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-medium mb-4">Processing Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Chart placeholder - Line chart of daily processing</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-lg font-medium mb-4">Top Performers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Executive</th>
                <th className="px-3 py-2 text-left">Claims</th>
                <th className="px-3 py-2 text-left">Avg TAT</th>
                <th className="px-3 py-2 text-left">Accuracy</th>
                <th className="px-3 py-2 text-left">Savings</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.map((performer, index) => (
                <tr key={index} className="border-b">
                  <td className="px-3 py-2 font-medium">{performer.name}</td>
                  <td className="px-3 py-2">{performer.claims}</td>
                  <td className="px-3 py-2">{performer.tat}</td>
                  <td className="px-3 py-2">{performer.accuracy}</td>
                  <td className="px-3 py-2">{performer.savings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;