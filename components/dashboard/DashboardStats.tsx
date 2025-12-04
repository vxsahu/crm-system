import React from 'react';
import { StatCard } from '../StatCard';
import { IndianRupee, TrendingUp, ShoppingBag, AlertCircle } from 'lucide-react';
import { ProductStatus, BillingStatus } from '@/types';

interface DashboardStatsProps {
  totalRevenue: number;
  monthlyRevenue: number;
  averageSale: number;
  unbilledValue: number;
  soldCount: number;
  unbilledCount: number;
  handleNavigate: (filters: { status: string; billing: string }) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalRevenue,
  monthlyRevenue,
  averageSale,
  unbilledValue,
  soldCount,
  unbilledCount,
  handleNavigate
}) => {
  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(totalRevenue)}
        icon={IndianRupee}
        description={`From ${soldCount} sold items`}
        colorClass="text-success-700"
        onClick={() => handleNavigate({ status: ProductStatus.SOLD, billing: 'ALL' })}
      />
      <StatCard
        title="Monthly Sales"
        value={formatCurrency(monthlyRevenue)}
        icon={TrendingUp}
        colorClass="text-primary-700"
        description="Current month revenue"
        onClick={() => handleNavigate({ status: ProductStatus.SOLD, billing: 'ALL' })}
      />
      <StatCard
        title="Average Sale"
        value={formatCurrency(Math.round(averageSale))}
        icon={ShoppingBag}
        colorClass="text-info-700"
        description="Per transaction value"
        onClick={() => handleNavigate({ status: ProductStatus.SOLD, billing: 'ALL' })}
      />
      <StatCard
        title="Unbilled Value"
        value={formatCurrency(unbilledValue)}
        icon={AlertCircle}
        colorClass="text-accent-700"
        description={`${unbilledCount} items pending`}
        trend="Critical"
        onClick={() => handleNavigate({ status: 'ALL', billing: BillingStatus.UNBILLED })}
      />
    </div>
  );
};
