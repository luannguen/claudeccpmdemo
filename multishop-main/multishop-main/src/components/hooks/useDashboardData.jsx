import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useOrders() {
  return useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: async () => {
      const data = await base44.entities.Order.list('-created_date', 200);
      return data || [];
    },
    initialData: [],
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ['dashboard-products'],
    queryFn: async () => {
      const data = await base44.entities.Product.list('-created_date', 200);
      return data || [];
    },
    initialData: [],
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ['dashboard-customers'],
    queryFn: async () => {
      const data = await base44.entities.Customer.list('-created_date', 200);
      return data || [];
    },
    initialData: [],
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1
  });
}

export function useUserPosts() {
  return useQuery({
    queryKey: ['dashboard-user-posts'],
    queryFn: async () => {
      const data = await base44.entities.UserPost.list('-created_date', 100);
      return data || [];
    },
    initialData: [],
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1
  });
}

export function useDashboardAnalytics(orders, products, customers, dateRange) {
  return useMemo(() => {
    const now = new Date();
    
    const getDateRangeStart = () => {
      switch(dateRange) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return today;
        case 'week':
          const week = new Date();
          week.setDate(week.getDate() - 7);
          return week;
        case 'month':
          const month = new Date();
          month.setMonth(month.getMonth() - 1);
          return month;
        case 'year':
          const year = new Date();
          year.setFullYear(year.getFullYear() - 1);
          return year;
        default:
          return new Date(0);
      }
    };

    const rangeStart = getDateRangeStart();
    const filteredOrders = orders.filter(o => new Date(o.created_date) >= rangeStart);
    
    // Revenue calculations
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const previousPeriodOrders = orders.filter(o => {
      const date = new Date(o.created_date);
      return date < rangeStart && date >= new Date(rangeStart.getTime() - (now - rangeStart));
    });
    const previousRevenue = previousPeriodOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const revenueGrowth = previousRevenue ? ((totalRevenue - previousRevenue) / previousRevenue * 100) : 0;

    // Order statistics
    const totalOrders = filteredOrders.length;
    const pendingOrders = orders.filter(o => o.order_status === 'pending').length;
    const deliveredOrders = filteredOrders.filter(o => o.order_status === 'delivered').length;
    const cancelledOrders = filteredOrders.filter(o => o.order_status === 'cancelled').length;
    
    // Product statistics
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const lowStockProducts = products.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 10)).length;
    const outOfStockProducts = products.filter(p => (p.stock_quantity || 0) === 0).length;
    
    // Customer statistics
    const totalCustomers = customers.length;
    const newCustomers = customers.filter(c => new Date(c.created_date) >= rangeStart).length;
    const vipCustomers = customers.filter(c => c.customer_type === 'vip').length;
    
    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Conversion rate
    const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers * 100) : 0;

    // Top products
    const productSales = {};
    filteredOrders.forEach(order => {
      (order.items || []).forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            name: item.product_name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.product_id].quantity += item.quantity;
        productSales[item.product_id].revenue += item.subtotal || 0;
      });
    });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Revenue by category
    const categoryRevenue = {};
    filteredOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        const category = product?.category || 'other';
        categoryRevenue[category] = (categoryRevenue[category] || 0) + (item.subtotal || 0);
      });
    });

    // Daily revenue chart data
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOrders = filteredOrders.filter(o => {
        const orderDate = new Date(o.created_date);
        return orderDate.toDateString() === date.toDateString();
      });
      dailyData.push({
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        orders: dayOrders.length
      });
    }

    return {
      totalRevenue,
      revenueGrowth,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCustomers,
      newCustomers,
      vipCustomers,
      avgOrderValue,
      conversionRate,
      topProducts,
      categoryRevenue,
      dailyData
    };
  }, [orders, products, customers, dateRange]);
}

export function useWishlistStats() {
  return useMemo(() => {
    const allWishlists = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes('zerofarm-wishlist')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(data)) {
            allWishlists.push(...data);
          }
        } catch (e) {
          console.error("Error parsing wishlist:", e);
        }
      }
    }
    
    const frequency = {};
    allWishlists.forEach(id => {
      frequency[id] = (frequency[id] || 0) + 1;
    });
    
    const topWishlisted = Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => ({ product_id: id, wishlist_count: count }));
    
    return {
      total: allWishlists.length,
      unique_products: Object.keys(frequency).length,
      top: topWishlisted
    };
  }, []);
}

export function useExportDashboardData(analytics, orders, products, wishlistStats) {
  return useCallback(() => {
    const data = {
      exportDate: new Date().toISOString(),
      analytics,
      orders: orders.slice(0, 100),
      products: products.slice(0, 100),
      wishlistStats
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerofarm-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [analytics, orders, products, wishlistStats]);
}