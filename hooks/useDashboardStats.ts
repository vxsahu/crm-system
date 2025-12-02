import { useState, useEffect, useMemo } from 'react';
import { Product, ProductStatus, BillingStatus } from '../types';
import { ShoppingBag, RotateCcw, AlertCircle, Plus } from 'lucide-react';

export const useDashboardStats = (products: Product[]) => {
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  // Calculate Stats
  const totalInventory = products.length;
  const soldCount = products.filter(p => p.status === ProductStatus.SOLD).length;
  const returnedCount = products.filter(p => p.status === ProductStatus.RETURNED).length;
  const inStockCount = products.filter(p => p.status === ProductStatus.IN_STOCK).length;
  const unbilledCount = products.filter(p => p.billingStatus === BillingStatus.UNBILLED).length;
  
  // Calculate value of unbilled items to prevent loss
  const unbilledValue = useMemo(() => products
    .filter(p => p.billingStatus === BillingStatus.UNBILLED)
    .reduce((sum, p) => sum + (p.purchasePrice || 0), 0), [products]);

  // Financial Metrics
  const totalRevenue = useMemo(() => products
    .filter(p => p.status === ProductStatus.SOLD)
    .reduce((sum, p) => sum + (p.purchasePrice || 0), 0), [products]);

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

  // Aggregate monthly revenue data for last 6 months
  const monthlyRevenueData = useMemo(() => {
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
  }, [products]);

  // Aggregate revenue by category
  const categoryRevenueData = useMemo(() => {
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
  }, [products]);

  // Get recent activities
  const recentActivities = useMemo(() => {
    const activities: Array<{
      type: string;
      icon: any;
      color: string;
      title: string;
      description: string;
      value: string;
    }> = [];
    
    const recentProducts = [...products].slice(-10).reverse();
    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;
    
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
  }, [products]);

  return {
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
  };
};
