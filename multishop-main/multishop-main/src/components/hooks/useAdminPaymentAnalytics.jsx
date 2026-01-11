import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { QrCode, Wallet, Smartphone, CreditCard } from 'lucide-react';

// ✅ Payment Method Icons Config
export const PAYMENT_METHOD_ICONS = {
  'bank_transfer': QrCode,
  'cod': Wallet,
  'momo': Smartphone,
  'vnpay': CreditCard
};

// ✅ Chart Colors
export const CHART_COLORS = ['#7CB342', '#FF9800', '#2196F3', '#9C27B0', '#F44336', '#00BCD4'];

// ✅ Payment Method Labels
export const PAYMENT_METHOD_LABELS = {
  'bank_transfer': 'Chuyển Khoản',
  'cod': 'COD',
  'momo': 'MoMo',
  'vnpay': 'VNPay'
};

/**
 * Hook quản lý date range state
 */
export function useDateRangeState() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  return { dateRange, setDateRange };
}

/**
 * Hook fetch payment analytics overview
 */
export function usePaymentAnalytics(dateRange) {
  return useQuery({
    queryKey: ['payment-analytics', dateRange],
    queryFn: async () => {
      const response = await base44.functions.invoke('paymentAnalytics', {
        action: 'overview',
        start_date: dateRange.start,
        end_date: dateRange.end
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook fetch daily payment data
 */
export function usePaymentDailyData(dateRange) {
  return useQuery({
    queryKey: ['payment-analytics-daily', dateRange],
    queryFn: async () => {
      const response = await base44.functions.invoke('paymentAnalytics', {
        action: 'daily',
        start_date: dateRange.start,
        end_date: dateRange.end
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook fetch payment transactions
 */
export function usePaymentTransactions(dateRange) {
  return useQuery({
    queryKey: ['payment-transactions', dateRange],
    queryFn: async () => {
      const response = await base44.functions.invoke('paymentAnalytics', {
        action: 'transactions',
        start_date: dateRange.start,
        end_date: dateRange.end
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook transform data for pie chart
 */
export function usePieChartData(analytics) {
  return useMemo(() => {
    if (!analytics?.by_payment_method) return [];
    
    return Object.entries(analytics.by_payment_method).map(([method, data]) => ({
      name: PAYMENT_METHOD_LABELS[method] || method,
      value: data.revenue,
      count: data.count
    }));
  }, [analytics]);
}

/**
 * Hook transform data for line chart
 */
export function useLineChartData(dailyData) {
  return useMemo(() => {
    if (!dailyData?.daily_breakdown) return [];
    
    return dailyData.daily_breakdown
      .slice(0, 30)
      .reverse()
      .map(day => ({
        date: new Date(day.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: day.revenue,
        orders: day.paid_orders
      }));
  }, [dailyData]);
}

/**
 * Export analytics data to JSON
 */
export function exportAnalyticsData(analytics, transactions, dateRange) {
  const data = {
    period: analytics?.period,
    overview: analytics?.overview,
    by_method: analytics?.by_payment_method,
    transactions: transactions?.transactions
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payment-analytics-${dateRange.start}-${dateRange.end}.json`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

export default usePaymentAnalytics;