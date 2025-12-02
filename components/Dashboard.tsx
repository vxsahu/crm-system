'use client';

import React, { useState, useEffect } from 'react';
import { ProductStatus, BillingStatus } from '../types';
import { StatCard } from './StatCard';
import { Package, ShoppingBag, AlertCircle, RotateCcw, DollarSign, TrendingUp, RefreshCw, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useInventory } from '../contexts/InventoryContext';
import { useRouter } from 'next/navigation';

export const Dashboard: React.FC = () => {
  const { products, addProduct } = useInventory();
  const router = useRouter();
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  const handleNavigate = (filters: { status: string; billing: string }) => {
    const params = new URLSearchParams();
    if (filters.status !== 'ALL') params.set('status', filters.status);
    if (filters.billing !== 'ALL') params.set('billing', filters.billing);
    router.push(`/inventory?${params.toString()}`);
  };

  // Calculate Stats
  const totalInventory = products.length;
  const soldCount = products.filter(p => p.status === ProductStatus.SOLD).length;
  const returnedCount = products.filter(p => p.status === ProductStatus.RETURNED).length;
  const inStockCount = products.filter(p => p.status === ProductStatus.IN_STOCK).length;
  const unbilledCount = products.filter(p => p.billingStatus === BillingStatus.UNBILLED).length;
  
  // Calculate value of unbilled items to prevent loss
  const unbilledValue = products
    .filter(p => p.billingStatus === BillingStatus.UNBILLED)
    .reduce((sum, p) => sum + (p.purchasePrice || 0), 0);

  // Financial Metrics
  const totalRevenue = products
    .filter(p => p.status === ProductStatus.SOLD)
    .reduce((sum, p) => sum + (p.purchasePrice || 0), 0);

  // Calculate monthly revenue in useEffect to avoid hydration mismatch
  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const revenue = products
      .filter(p => {
        if (p.status !== ProductStatus.SOLD) return false;
        const purchaseDate = new Date(p.purchaseDate);
        return purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + (p.purchasePrice || 0), 0);
    setMonthlyRevenue(revenue);
  }, [products]);

  // Calculate average sale value
  const averageSale = soldCount > 0 ? totalRevenue / soldCount : 0;

  // Format currency helper
  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  // Aggregate monthly revenue data for last 6 months
  const getMonthlyRevenueData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const revenue = products
        .filter(p => {
          if (p.status !== ProductStatus.SOLD) return false;
          const purchaseDate = new Date(p.purchaseDate);
          return purchaseDate.getMonth() === month && purchaseDate.getFullYear() === year;
        })
        .reduce((sum, p) => sum + (p.purchasePrice || 0), 0);

      const salesCount = products.filter(p => {
        if (p.status !== ProductStatus.SOLD) return false;
        const purchaseDate = new Date(p.purchaseDate);
        return purchaseDate.getMonth() === month && purchaseDate.getFullYear() === year;
      }).length;

      data.push({
        month: `${monthNames[month]} '${year.toString().slice(2)}`,
        revenue,
        sales: salesCount
      });
    }
    return data;
  };

  // Aggregate revenue by category
  const getCategoryRevenueData = () => {
    const categoryMap = new Map<string, number>();
    
    products
      .filter(p => p.status === ProductStatus.SOLD)
      .forEach(p => {
        const category = p.category || 'Other';
        categoryMap.set(category, (categoryMap.get(category) || 0) + (p.purchasePrice || 0));
      });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories
  };

  // Get recent activities
  const getRecentActivities = () => {
    const activities: Array<{
      type: string;
      icon: any;
      color: string;
      title: string;
      description: string;
      value: string;
    }> = [];
    
    const recentProducts = [...products].slice(-10).reverse();
    
    recentProducts.forEach(product => {
      if (product.status === ProductStatus.SOLD) {
        activities.push({
          type: 'sale',
          icon: ShoppingBag,
          color: 'text-success-700 bg-success-50',
          title: 'Product Sold',
          description: `${product.productName} - ${product.tagNumber}`,
          value: formatCurrency(product.purchasePrice),
        });
      } else if (product.status === ProductStatus.RETURNED) {
        activities.push({
          type: 'return',
          icon: RotateCcw,
          color: 'text-danger-700 bg-danger-50',
          title: 'Product Returned',
          description: `${product.productName} - ${product.tagNumber}`,
          value: '',
        });
      } else if (product.billingStatus === BillingStatus.UNBILLED) {
        activities.push({
          type: 'unbilled',
          icon: AlertCircle,
          color: 'text-accent-700 bg-accent-50',
          title: 'Unbilled Item',
          description: `${product.productName} - ${product.tagNumber}`,
          value: formatCurrency(product.purchasePrice),
        });
      } else {
        activities.push({
          type: 'added',
          icon: Plus,
          color: 'text-primary-700 bg-primary-50',
          title: 'Product Added',
          description: `${product.productName} - ${product.tagNumber}`,
          value: '',
        });
      }
    });
    
    return activities.slice(0, 8);
  };

  const monthlyRevenueData = getMonthlyRevenueData();
  const categoryRevenueData = getCategoryRevenueData();
  const recentActivities = getRecentActivities();

  const CHART_COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  const billingData = [
    { name: 'Billed', value: products.length - unbilledCount, fill: '#0d9488' },
    { name: 'Unbilled', value: unbilledCount, fill: '#f59e0b' },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
        <div>
          <h2 className="text-base font-bold text-primary-900">Operational Overview</h2>
          <p className="text-sm text-primary-700">Real-time insight into inventory health and financial performance.</p>
        </div>
        <div className="flex gap-2">
          <div
            onClick={() => handleNavigate({ status: 'ALL', billing: BillingStatus.UNBILLED })}
            className="mt-4 md:mt-0 px-4 py-2 bg-accent-50 border border-accent-200 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-accent-100 transition-colors"
          >
            <AlertCircle className="text-accent-700 w-5 h-5" />
            <div>
              <span className="block text-sm text-accent-700 font-bold uppercase tracking-wider">Action Required</span>
              <span className="text-sm font-medium text-primary-900">{unbilledCount} Unbilled Items Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
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

      {/* Revenue Trend Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <h3 className="text-base font-semibold text-primary-900 mb-2">Revenue Trend</h3>
        <p className="text-sm text-primary-700 mb-4">Last 6 months sales performance</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'white' }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Legend wrapperStyle={{ paddingTop: '16px' }} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#0d9488" strokeWidth={3} dot={{ fill: '#0d9488', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Revenue & Sales Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <h3 className="text-base font-semibold text-primary-900 mb-2">Top Categories</h3>
          <p className="text-sm text-primary-700 mb-4">Revenue by product category</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryRevenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryRevenueData.map((entry, index) => (
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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <h3 className="text-base font-semibold text-primary-900 mb-2">Sales Volume</h3>
          <p className="text-sm text-primary-700 mb-4">Number of sales per month</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <h3 className="text-base font-semibold text-primary-900 mb-2">Recent Activity</h3>
        <p className="text-sm text-primary-700 mb-4">Latest product updates and transactions</p>
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => {
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

      {/* Inventory Distribution & Billing Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <span className="block text-base font-bold text-primary-900">{Math.round((unbilledCount / (products.length || 1)) * 100)}%</span>
                <span className="text-sm text-primary-500">Unbilled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};