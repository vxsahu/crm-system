import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface BillingChartProps {
  billedCount: number;
  unbilledCount: number;
  unbilledValue: number;
  totalProducts: number;
}

export const BillingChart: React.FC<BillingChartProps> = ({
  billedCount,
  unbilledCount,
  unbilledValue,
  totalProducts
}) => {
  const billingData = [
    { name: 'Billed', value: billedCount, fill: '#0d9488' },
    { name: 'Unbilled', value: unbilledCount, fill: '#f59e0b' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
      <h3 className="text-base font-semibold text-primary-900 mb-2">Billing & Liability</h3>
      <p className="text-sm text-primary-700 mb-4">Unbilled Value: ₹{unbilledValue.toLocaleString()}</p>
      <div className="h-56 relative" style={{ height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={billingData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {billingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill === '#0d9488' ? 'var(--color-success-600)' : 'var(--color-accent-600)'} />
              ))}
            </Pie>
            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'white' }} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
          <div className="text-center">
            <span className="block text-base font-bold text-primary-900">{Math.round((unbilledCount / (totalProducts || 1)) * 100)}%</span>
            <span className="text-sm text-primary-500">Unbilled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
