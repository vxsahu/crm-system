'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';

interface CategoryChartProps {
  data: Array<{ name: string; value: number }>;
}

const CHART_COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-200">
      <h3 className="text-base font-semibold text-primary-900 mb-2">Top Categories</h3>
      <p className="text-sm text-primary-700 mb-4">Revenue by product category</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'white' }}
              formatter={(value: number) => `₹${value.toLocaleString()}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
