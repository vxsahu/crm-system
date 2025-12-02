import React from 'react';
import { Package } from 'lucide-react';

interface RecentActivityProps {
  activities: Array<{
    type: string;
    icon: any;
    color: string;
    title: string;
    description: string;
    value: string;
  }>;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
      <h3 className="text-base font-semibold text-primary-900 mb-2">Recent Activity</h3>
      <p className="text-sm text-primary-700 mb-4">Latest product updates and transactions</p>
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                <div className={`p-2 rounded-lg ${activity.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-900">{activity.title}</p>
                  <p className="text-sm text-primary-600 truncate">{activity.description}</p>
                </div>
                {activity.value && (
                  <div className="text-sm font-semibold text-primary-900">{activity.value}</div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-primary-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};
