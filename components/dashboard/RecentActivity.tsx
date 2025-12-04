import React from 'react';
import { Package } from 'lucide-react';

interface RecentActivityProps {
  activities: Array<{
    type: string;
    icon: React.ElementType;
    color: string;
    title: string;
    description: string;
    value: string;
  }>;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className="bg-white p-4 rounded-xlborder border-neutral-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary-900">Recent Activity</h3>
        <span className="text-xs text-primary-500">Latest updates</span>
      </div>
      <div className="space-y-2">
        {activities.length > 0 ? (
          activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className={`p-1.5 rounded-md ${activity.color} bg-opacity-10`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary-900 truncate">{activity.title}</p>
                  <p className="text-[11px] text-primary-500 truncate">{activity.description}</p>
                </div>
                {activity.value && (
                  <div className="text-xs font-semibold text-primary-700">{activity.value}</div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-primary-400">
            <Package className="w-8 h-8 mx-auto mb-1 opacity-40" />
            <p className="text-xs">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};
