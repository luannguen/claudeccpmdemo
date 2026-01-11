import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook để fetch dữ liệu customers và orders cho insights
 */
export function useInsightsData() {
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['insights-customers'],
    queryFn: () => base44.entities.Customer.list('-created_date', 500),
    initialData: [],
    staleTime: 5 * 60 * 1000
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['insights-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 500),
    initialData: [],
    staleTime: 5 * 60 * 1000
  });

  return {
    customers,
    orders,
    isLoading: loadingCustomers || loadingOrders
  };
}

/**
 * Hook tính toán RFM Analysis và Customer Segmentation
 */
export function useCustomerInsights(customers = [], orders = []) {
  return useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // RFM Analysis
    const rfmData = customers.map(customer => {
      const customerOrders = orders.filter(o => 
        o.customer_phone === customer.phone || o.customer_email === customer.email
      );

      const lastOrderDate = customer.last_order_date ? new Date(customer.last_order_date) : null;
      const recency = lastOrderDate ? Math.floor((now - lastOrderDate) / (1000 * 60 * 60 * 24)) : 999;
      const frequency = customer.total_orders || 0;
      const monetary = customer.total_spent || 0;

      // Score 1-5
      const rScore = recency <= 30 ? 5 : recency <= 60 ? 4 : recency <= 90 ? 3 : recency <= 180 ? 2 : 1;
      const fScore = frequency >= 10 ? 5 : frequency >= 5 ? 4 : frequency >= 3 ? 3 : frequency >= 2 ? 2 : 1;
      const mScore = monetary >= 5000000 ? 5 : monetary >= 2000000 ? 4 : monetary >= 1000000 ? 3 : monetary >= 500000 ? 2 : 1;

      const rfmScore = (rScore + fScore + mScore) / 3;
      
      let segment = 'Lost';
      if (rfmScore >= 4.5) segment = 'Champions';
      else if (rfmScore >= 4) segment = 'Loyal';
      else if (rfmScore >= 3.5) segment = 'Potential Loyalist';
      else if (rfmScore >= 3) segment = 'At Risk';
      else if (rfmScore >= 2.5) segment = 'Needs Attention';

      // CLV Calculation
      const avgOrderValue = frequency > 0 ? monetary / frequency : 0;
      const customerLifetimeMonths = customer.first_order_date ? 
        Math.max(1, Math.floor((now - new Date(customer.first_order_date)) / (1000 * 60 * 60 * 24 * 30))) : 1;
      const purchaseFrequencyPerMonth = frequency / customerLifetimeMonths;
      const estimatedLifetimeMonths = 24;
      const clv = avgOrderValue * purchaseFrequencyPerMonth * estimatedLifetimeMonths;

      return {
        ...customer,
        recency,
        frequency,
        monetary,
        rScore,
        fScore,
        mScore,
        rfmScore,
        segment,
        clv,
        avgOrderValue
      };
    });

    // Segment Distribution
    const segmentDistribution = rfmData.reduce((acc, c) => {
      acc[c.segment] = (acc[c.segment] || 0) + 1;
      return acc;
    }, {});

    const segmentData = Object.entries(segmentDistribution).map(([name, value]) => ({
      name, value
    }));

    // CLV Distribution
    const clvRanges = [
      { name: '0-1M', min: 0, max: 1000000, count: 0, totalClv: 0 },
      { name: '1-3M', min: 1000000, max: 3000000, count: 0, totalClv: 0 },
      { name: '3-5M', min: 3000000, max: 5000000, count: 0, totalClv: 0 },
      { name: '5-10M', min: 5000000, max: 10000000, count: 0, totalClv: 0 },
      { name: '10M+', min: 10000000, max: Infinity, count: 0, totalClv: 0 }
    ];

    rfmData.forEach(c => {
      const range = clvRanges.find(r => c.clv >= r.min && c.clv < r.max);
      if (range) {
        range.count++;
        range.totalClv += c.clv;
      }
    });

    // Top customers by CLV
    const topCustomers = [...rfmData]
      .sort((a, b) => b.clv - a.clv)
      .slice(0, 10);

    // Cohort Analysis
    const cohorts = {};
    customers.forEach(customer => {
      if (customer.first_order_date) {
        const cohortMonth = customer.first_order_date.substring(0, 7);
        if (!cohorts[cohortMonth]) {
          cohorts[cohortMonth] = { month: cohortMonth, customers: 0, revenue: 0 };
        }
        cohorts[cohortMonth].customers++;
        cohorts[cohortMonth].revenue += customer.total_spent || 0;
      }
    });

    const cohortData = Object.values(cohorts)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);

    // New vs Returning
    const newCustomers = customers.filter(c => 
      new Date(c.created_date) >= thirtyDaysAgo
    ).length;

    const returningCustomers = customers.filter(c => 
      (c.total_orders || 0) > 1 && 
      c.last_order_date && 
      new Date(c.last_order_date) >= thirtyDaysAgo
    ).length;

    // Churn Analysis
    const churnedCustomers = customers.filter(c => 
      c.last_order_date && 
      new Date(c.last_order_date) < ninetyDaysAgo
    ).length;

    const churnRate = customers.length > 0 ? (churnedCustomers / customers.length * 100) : 0;

    // Average metrics
    const totalClv = rfmData.reduce((sum, c) => sum + c.clv, 0);
    const avgClv = customers.length > 0 ? totalClv / customers.length : 0;
    const avgOrderValue = rfmData.reduce((sum, c) => sum + c.avgOrderValue, 0) / (customers.length || 1);
    const avgFrequency = rfmData.reduce((sum, c) => sum + c.frequency, 0) / (customers.length || 1);

    return {
      rfmData,
      segmentData,
      clvRanges,
      topCustomers,
      cohortData,
      newCustomers,
      returningCustomers,
      churnedCustomers,
      churnRate,
      avgClv,
      avgOrderValue,
      avgFrequency,
      totalClv
    };
  }, [customers, orders]);
}

/**
 * Export insights data to CSV
 */
export function exportInsightsToCSV(rfmData) {
  const csv = [
    ['Email', 'Tên', 'Segment', 'RFM Score', 'CLV', 'Recency', 'Frequency', 'Monetary'].join(','),
    ...rfmData.map(c => [
      c.email || '',
      c.full_name,
      c.segment,
      c.rfmScore.toFixed(2),
      c.clv.toFixed(0),
      c.recency,
      c.frequency,
      c.monetary
    ].join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `customer-insights_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

export default useCustomerInsights;