'use client';

import React from 'react';
import { BillingStatus } from '../types';
import { AlertCircle } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useRouter } from 'next/navigation';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { DashboardStats } from './dashboard/DashboardStats';
import { RevenueChart } from './dashboard/RevenueChart';
import { CategoryChart } from './dashboard/CategoryChart';
import { SalesVolumeChart } from './dashboard/SalesVolumeChart';
import { RecentActivity } from './dashboard/RecentActivity';
import { InventoryDistributionChart } from './dashboard/InventoryDistributionChart';
import { BillingChart } from './dashboard/BillingChart';

export const Dashboard: React.FC = () => {
  const { products } = useInventory();
  const router = useRouter();
  
  const {
    totalInventory,
    soldCount,
    returnedCount,
    inStockCount,
    unbilledCount,
    unbilledValue,
    totalRevenue,
    monthlyRevenue,
    averageSale,
    monthlyRevenueData,
    categoryRevenueData,
    recentActivities
  } = useDashboardStats(products);

  const handleNavigate = (filters: { status: string; billing: string }) => {
    const params = new URLSearchParams();
    if (filters.status !== 'ALL') params.set('status', filters.status);
    if (filters.billing !== 'ALL') params.set('billing', filters.billing);
    router.push(`/inventory?${params.toString()}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
        <div>
          <h2 className="text-base font-bold text-primary-900">Operational Overview</h2>
          <p className="text-sm text-primary-700">Real-time insight into inventory health and financial performance.</p>
        </div>
      </div>

      {/* Financial Metrics */}
      <DashboardStats
        totalRevenue={totalRevenue}
        monthlyRevenue={monthlyRevenue}
        averageSale={averageSale}
        unbilledValue={unbilledValue}
        soldCount={soldCount}
        unbilledCount={unbilledCount}
        handleNavigate={handleNavigate}
      />

      {/* Revenue Trend Chart */}
      <RevenueChart data={monthlyRevenueData} />

      {/* Category Revenue & Sales Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={categoryRevenueData} />
        <SalesVolumeChart data={monthlyRevenueData} />
      </div>

      {/* Recent Activity Feed */}
      <RecentActivity activities={recentActivities} />

      {/* Inventory Distribution & Billing Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InventoryDistributionChart
          inStockCount={inStockCount}
          soldCount={soldCount}
          returnedCount={returnedCount}
        />

        <BillingChart
          billedCount={products.length - unbilledCount}
          unbilledCount={unbilledCount}
          unbilledValue={unbilledValue}
          totalProducts={totalInventory}
        />
      </div>
    </div>
  );
};