import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook to fetch all necessary data for reports.
 */
function useReportData() {
  const { data: orders = [] } = useQuery({
    queryKey: ['reports-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 2000), // Increased limit for better accuracy
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: products = [] } = useQuery({
    queryKey: ['reports-products'],
    queryFn: () => base44.entities.Product.list('-created_date', 1000),
    staleTime: 5 * 60 * 1000,
  });

  return { orders, products };
}

/**
 * Hook to calculate analytics based on fetched data and date range.
 */
export function useAdminReports() {
  const [dateRange, setDateRange] = useState("month");
  const { orders, products } = useReportData();

  const analytics = useMemo(() => {
    const now = new Date();
    const rangeStart = (() => {
      switch(dateRange) {
        case 'week': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'month': return new Date(new Date().setDate(now.getDate() - 30));
        case 'quarter': return new Date(new Date().setDate(now.getDate() - 90));
        case 'year': return new Date(new Date().setFullYear(now.getFullYear() - 1));
        default: return new Date(0);
      }
    })();

    const filteredOrders = orders.filter(o => new Date(o.created_date) >= rangeStart);

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

    const productSales = {};
    filteredOrders.forEach(order => {
      (order.items || []).forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = { name: item.product_name, quantity: 0, revenue: 0 };
        }
        productSales[item.product_id].quantity += item.quantity;
        productSales[item.product_id].revenue += item.subtotal || 0;
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    const categoryRevenueMap = {};
    filteredOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const productDetails = products.find(p => p.id === item.product_id);
        const category = productDetails?.category || 'Chưa phân loại';
        categoryRevenueMap[category] = (categoryRevenueMap[category] || 0) + (item.subtotal || 0);
      });
    });
    const categoryRevenue = Object.entries(categoryRevenueMap).map(([name, value]) => ({ name, value }));

    const customerPurchases = {};
    filteredOrders.forEach(order => {
      const email = order.customer_email || 'guest';
      if (!customerPurchases[email]) {
        customerPurchases[email] = { name: order.customer_name, email, orders: 0, revenue: 0 };
      }
      customerPurchases[email].orders += 1;
      customerPurchases[email].revenue += order.total_amount || 0;
    });
    const topCustomers = Object.values(customerPurchases).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    const dailyData = [];
    const days = dateRange === 'week' ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = filteredOrders.filter(o => o.created_date?.startsWith(dateStr));
      dailyData.push({
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      });
    }

    return {
      totalRevenue,
      totalOrders: filteredOrders.length,
      avgOrderValue,
      topProducts,
      topCustomers,
      categoryRevenue,
      dailyData,
      isLoading: !orders.length || !products.length
    };
  }, [orders, products, dateRange]);

  const handleExport = () => {
    const dataToExport = {
      exportDate: new Date().toISOString(),
      dateRange,
      analytics,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerofarm-report-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return { analytics, dateRange, setDateRange, handleExport };
}