import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  colorClass?: string;
  description?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, colorClass = "text-brand-600", description, onClick }) => {
  // Extract color name (e.g., 'brand', 'accent', 'danger') to use lighter shade for background
  const colorName = colorClass.split('-')[1] || 'brand';
  const bgClass = `bg-${colorName}-50`;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-brand-200' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-full ${bgClass}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-800">{value}</div>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        {trend && <p className="text-xs font-medium text-danger-600 mt-2">{trend}</p>}
      </div>
    </div>
  );
};