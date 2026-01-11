import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Payment Analytics & Transaction History
 * 
 * Features:
 * - Transaction history by date range
 * - Payment method analytics
 * - Revenue by payment method
 * - Success/failure rates
 * - Refund tracking
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    
    if (!user || !['admin', 'super_admin', 'manager', 'accountant'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ FIX: Parse body for POST requests
    let action, startDate, endDate;
    
    if (req.method === 'POST') {
      const body = await req.json();
      action = body.action || 'overview';
      startDate = body.start_date;
      endDate = body.end_date;
    } else {
      const url = new URL(req.url);
      action = url.searchParams.get('action') || 'overview';
      startDate = url.searchParams.get('start_date');
      endDate = url.searchParams.get('end_date');
    }

    const orders = await base44.asServiceRole.entities.Order.list('-created_date', 5000);

    // Filter by date range
    let filteredOrders = orders;
    if (startDate) {
      filteredOrders = filteredOrders.filter(o => 
        new Date(o.created_date) >= new Date(startDate)
      );
    }
    if (endDate) {
      filteredOrders = filteredOrders.filter(o => 
        new Date(o.created_date) <= new Date(endDate)
      );
    }

    // =====================
    // OVERVIEW ANALYTICS
    // =====================
    if (action === 'overview') {
      const byPaymentMethod = {};
      const byPaymentStatus = {};
      let totalRevenue = 0;
      let totalOrders = filteredOrders.length;

      filteredOrders.forEach(order => {
        const method = order.payment_method || 'unknown';
        const status = order.payment_status || 'unknown';
        const amount = order.total_amount || 0;

        // By method
        if (!byPaymentMethod[method]) {
          byPaymentMethod[method] = {
            count: 0,
            revenue: 0,
            paid_count: 0,
            pending_count: 0,
            failed_count: 0
          };
        }
        byPaymentMethod[method].count++;
        
        if (status === 'paid') {
          byPaymentMethod[method].revenue += amount;
          byPaymentMethod[method].paid_count++;
          totalRevenue += amount;
        } else if (status === 'pending') {
          byPaymentMethod[method].pending_count++;
        } else if (status === 'failed') {
          byPaymentMethod[method].failed_count++;
        }

        // By status
        if (!byPaymentStatus[status]) {
          byPaymentStatus[status] = { count: 0, revenue: 0 };
        }
        byPaymentStatus[status].count++;
        if (status === 'paid') {
          byPaymentStatus[status].revenue += amount;
        }
      });

      // Success rate
      const paidOrders = filteredOrders.filter(o => o.payment_status === 'paid').length;
      const successRate = totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(1) : 0;

      return Response.json({
        success: true,
        period: {
          start: startDate || filteredOrders[filteredOrders.length - 1]?.created_date,
          end: endDate || filteredOrders[0]?.created_date,
          total_days: startDate && endDate 
            ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
            : null
        },
        overview: {
          total_orders: totalOrders,
          total_revenue: totalRevenue,
          paid_orders: paidOrders,
          success_rate: parseFloat(successRate),
          average_order_value: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
        },
        by_payment_method: byPaymentMethod,
        by_payment_status: byPaymentStatus
      });
    }

    // =====================
    // TRANSACTION HISTORY
    // =====================
    if (action === 'transactions') {
      const transactions = filteredOrders.map(order => ({
        order_id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        amount: order.total_amount,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        order_status: order.order_status,
        created_date: order.created_date,
        transaction_note: order.internal_note
      }));

      return Response.json({
        success: true,
        total: transactions.length,
        transactions
      });
    }

    // =====================
    // REFUND ANALYTICS
    // =====================
    if (action === 'refunds') {
      const refundedOrders = filteredOrders.filter(o => o.payment_status === 'refunded');
      const totalRefunded = refundedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      return Response.json({
        success: true,
        refund_stats: {
          total_refunds: refundedOrders.length,
          total_refunded_amount: totalRefunded,
          refund_rate: filteredOrders.length > 0 
            ? ((refundedOrders.length / filteredOrders.length) * 100).toFixed(2)
            : 0
        },
        refunds: refundedOrders.map(o => ({
          order_number: o.order_number,
          customer_name: o.customer_name,
          amount: o.total_amount,
          refunded_date: o.updated_date,
          reason: o.internal_note
        }))
      });
    }

    // =====================
    // DAILY BREAKDOWN
    // =====================
    if (action === 'daily') {
      const dailyData = {};

      filteredOrders.forEach(order => {
        const date = new Date(order.created_date).toISOString().split('T')[0];
        
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            total_orders: 0,
            paid_orders: 0,
            revenue: 0,
            by_method: {}
          };
        }

        dailyData[date].total_orders++;
        
        if (order.payment_status === 'paid') {
          dailyData[date].paid_orders++;
          dailyData[date].revenue += order.total_amount || 0;
        }

        const method = order.payment_method || 'unknown';
        if (!dailyData[date].by_method[method]) {
          dailyData[date].by_method[method] = { count: 0, revenue: 0 };
        }
        dailyData[date].by_method[method].count++;
        if (order.payment_status === 'paid') {
          dailyData[date].by_method[method].revenue += order.total_amount || 0;
        }
      });

      return Response.json({
        success: true,
        daily_breakdown: Object.values(dailyData).sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        )
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});