/**
 * 📊 usePreOrderAnalytics Hook
 * 
 * Analytics cho Pre-Order Dashboard:
 * - Revenue comparison (preorder vs regular)
 * - Conversion rate (view → order)
 * - Popular lots/products
 * - Harvest calendar data
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// ========== DATA FETCHING ==========

export function usePreOrderLots() {
  return useQuery({
    queryKey: ['dashboard-preorder-lots'],
    queryFn: async () => {
      const data = await base44.entities.ProductLot.list('-created_date', 500);
      return data || [];
    },
    initialData: [],
    staleTime: 10 * 60 * 1000
  });
}

export function usePreOrderProducts() {
  return useQuery({
    queryKey: ['dashboard-preorder-products'],
    queryFn: async () => {
      const data = await base44.entities.PreOrderProduct.list('-created_date', 200);
      return data || [];
    },
    initialData: [],
    staleTime: 10 * 60 * 1000
  });
}

export function usePreOrderCancellations() {
  return useQuery({
    queryKey: ['dashboard-preorder-cancellations'],
    queryFn: async () => {
      const data = await base44.entities.PreOrderCancellation.list('-created_date', 200);
      return data || [];
    },
    initialData: [],
    staleTime: 10 * 60 * 1000
  });
}

// ========== ANALYTICS COMPUTATION ==========

export function usePreOrderAnalytics(orders, lots, preOrderProducts, dateRange) {
  // Fetch cancellations
  const { data: cancellations = [] } = useQuery({
    queryKey: ['admin-preorder-cancellations-stats'],
    queryFn: () => base44.entities.PreOrderCancellation.list('-created_date', 500),
    initialData: []
  });

  return useMemo(() => {
    const now = new Date();
    
    const getDateRangeStart = () => {
      switch(dateRange) {
        case 'today': return new Date(now.setHours(0, 0, 0, 0));
        case 'week': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'month': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case 'year': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default: return new Date(0);
      }
    };

    const rangeStart = getDateRangeStart();
    const filteredOrders = orders.filter(o => new Date(o.created_date) >= rangeStart);

    // ========== REVENUE COMPARISON ==========
    const preorderOrders = filteredOrders.filter(o => o.has_preorder_items);
    const regularOrders = filteredOrders.filter(o => !o.has_preorder_items);

    const preorderRevenue = preorderOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const regularRevenue = regularOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalRevenue = preorderRevenue + regularRevenue;

    const preorderDeposits = preorderOrders.reduce((sum, o) => sum + (o.deposit_amount || 0), 0);
    const preorderRemaining = preorderOrders.reduce((sum, o) => sum + (o.remaining_amount || 0), 0);

    // ========== ORDER STATS ==========
    const preorderCount = preorderOrders.length;
    const regularCount = regularOrders.length;
    const preorderPercentage = filteredOrders.length > 0 
      ? Math.round((preorderCount / filteredOrders.length) * 100) 
      : 0;

    // ========== CONVERSION RATE ==========
    // Total views from lots (sold_quantity as proxy for interest)
    const totalLotViews = lots.reduce((sum, lot) => {
      return sum + (lot.sold_quantity || 0) + (lot.available_quantity || 0);
    }, 0);
    
    const totalLotSold = lots.reduce((sum, lot) => sum + (lot.sold_quantity || 0), 0);
    const conversionRate = totalLotViews > 0 
      ? Math.round((totalLotSold / totalLotViews) * 100) 
      : 0;

    // ========== POPULAR LOTS ==========
    const lotStats = lots.map(lot => ({
      id: lot.id,
      name: lot.lot_name,
      productName: lot.product_name,
      soldQuantity: lot.sold_quantity || 0,
      revenue: lot.total_revenue || 0,
      availableQuantity: lot.available_quantity || 0,
      harvestDate: lot.estimated_harvest_date,
      status: lot.status,
      currentPrice: lot.current_price,
      initialPrice: lot.initial_price
    }));

    const popularLots = [...lotStats]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const topSellingLots = [...lotStats]
      .sort((a, b) => b.soldQuantity - a.soldQuantity)
      .slice(0, 5);

    // ========== HARVEST CALENDAR ==========
    const harvestCalendar = lots
      .filter(lot => lot.estimated_harvest_date && lot.status === 'active')
      .map(lot => ({
        id: lot.id,
        title: lot.product_name || lot.lot_name,
        date: lot.estimated_harvest_date,
        soldQuantity: lot.sold_quantity || 0,
        totalQuantity: (lot.sold_quantity || 0) + (lot.available_quantity || 0),
        status: lot.status,
        revenue: lot.total_revenue || 0
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group by month for calendar view
    const harvestByMonth = {};
    harvestCalendar.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!harvestByMonth[monthKey]) {
        harvestByMonth[monthKey] = [];
      }
      harvestByMonth[monthKey].push(item);
    });

    // ========== LOT STATUS SUMMARY ==========
    const lotStatusSummary = {
      active: lots.filter(l => l.status === 'active').length,
      sold_out: lots.filter(l => l.status === 'sold_out').length,
      awaiting_harvest: lots.filter(l => l.status === 'awaiting_harvest').length,
      harvested: lots.filter(l => l.status === 'harvested').length,
      fulfilled: lots.filter(l => l.status === 'fulfilled').length,
      cancelled: lots.filter(l => l.status === 'cancelled').length
    };

    // ========== PREORDER STATUS BREAKDOWN ==========
    const preorderStatusBreakdown = {
      awaiting_harvest: preorderOrders.filter(o => o.order_status === 'awaiting_harvest').length,
      harvest_ready: preorderOrders.filter(o => o.order_status === 'harvest_ready').length,
      partial_payment: preorderOrders.filter(o => o.order_status === 'partial_payment').length,
      pending: preorderOrders.filter(o => o.order_status === 'pending').length,
      confirmed: preorderOrders.filter(o => o.order_status === 'confirmed').length,
      shipping: preorderOrders.filter(o => o.order_status === 'shipping').length,
      delivered: preorderOrders.filter(o => o.order_status === 'delivered').length,
      cancelled: preorderOrders.filter(o => o.order_status === 'cancelled').length
    };

    // ========== DAILY PREORDER TREND ==========
    const dailyPreorderData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayPreorders = preorderOrders.filter(o => {
        const orderDate = new Date(o.created_date);
        return orderDate.toDateString() === date.toDateString();
      });
      const dayRegular = regularOrders.filter(o => {
        const orderDate = new Date(o.created_date);
        return orderDate.toDateString() === date.toDateString();
      });
      dailyPreorderData.push({
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        preorder: dayPreorders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        regular: dayRegular.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        preorderCount: dayPreorders.length,
        regularCount: dayRegular.length
      });
    }

    // ========== UPCOMING HARVESTS (next 30 days) ==========
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);
    
    const upcomingHarvests = harvestCalendar.filter(item => {
      const harvestDate = new Date(item.date);
      return harvestDate >= new Date() && harvestDate <= next30Days;
    });

    return {
      // Revenue
      preorderRevenue,
      regularRevenue,
      totalRevenue,
      preorderDeposits,
      preorderRemaining,
      revenueComparison: {
        preorder: preorderRevenue,
        regular: regularRevenue,
        preorderPercent: totalRevenue > 0 ? Math.round((preorderRevenue / totalRevenue) * 100) : 0
      },

      // Order counts
      preorderCount,
      regularCount,
      preorderPercentage,

      // Conversion
      conversionRate,
      totalLotViews,
      totalLotSold,

      // Popular
      popularLots,
      topSellingLots,

      // Harvest
      harvestCalendar,
      harvestByMonth,
      upcomingHarvests,

      // Status
      lotStatusSummary,
      preorderStatusBreakdown,

      // Trends
      dailyPreorderData,

      // Cancellations
      totalActiveLots: lotStatusSummary.active,
      pendingCancellations: cancellations.filter(c => c.refund_status === 'pending').length
    };
  }, [orders, lots, preOrderProducts, dateRange, cancellations]);
}