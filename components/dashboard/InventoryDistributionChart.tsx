import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface InventoryDistributionChartProps {
  inStockCount: number;
  soldCount: number;
  returnedCount: number;
}

export const InventoryDistributionChart: React.FC<InventoryDistributionChartProps> = ({
  inStockCount,
  soldCount,
  returnedCount
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 lg:col-span-2">
      <h3 className="text-base font-semibold text-primary-900 mb-6">Inventory Distribution</h3>
      <div className="h-64" style={{ height: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[{ name: 'Inventory Status', InStock: inStockCount, Sold: soldCount, Returned: returnedCount }]}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" tickFormatter={(value) => value.toLocaleString()} />
            <YAxis type="category" dataKey="name" hide />
            <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'white' }} />
            <Legend wrapperStyle={{ paddingTop: '16px' }} />
            <Bar dataKey="InStock" name="In Stock" fill="var(--color-success-600)" radius={[0, 4, 4, 0]} barSize={40} />
            <Bar dataKey="Sold" name="Sold" fill="var(--color-primary-600)" radius={[0, 4, 4, 0]} barSize={40} />
            <Bar dataKey="Returned" name="Returned" fill="var(--color-danger-600)" radius={[0, 4, 4, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
