'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface SalesVolumeChartProps {
  data: Array<{ month: string; revenue: number; sales: number }>;
}

export const SalesVolumeChart: React.FC<SalesVolumeChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-200">
      <h3 className="text-base font-semibold text-primary-900 mb-2">Sales Volume</h3>
      <p className="text-sm text-primary-700 mb-4">Number of sales per month</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'white' }} />
            <Legend wrapperStyle={{ paddingTop: '16px' }} />
            <Bar dataKey="sales" name="Sales Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
