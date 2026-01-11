/**
 * SaaS Module - Commission Report Component
 * 
 * Shop owner commission report with period selection.
 * 
 * @module features/saas/ui/commission
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useMyShopCommissions } from '../../hooks/useCommission';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COMMISSION_STATUS } from '../../types';

// ========== STATUS CONFIG ==========

const STATUS_CONFIG = {
  [COMMISSION_STATUS.PENDING]: { label: 'Chờ xử lý', color: 'bg-gray-100 text-gray-700' },
  [COMMISSION_STATUS.CALCULATED]: { label: 'Đã tính', color: 'bg-blue-100 text-blue-700' },
  [COMMISSION_STATUS.APPROVED]: { label: 'Đã duyệt', color: 'bg-orange-100 text-orange-700' },
  [COMMISSION_STATUS.PAID]: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700' },
  [COMMISSION_STATUS.CANCELLED]: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' }
};

// ========== SUB COMPONENTS ==========

function SummaryCard({ title, value, subtitle, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-6 text-white ${gradient}`}
    >
      <p className="text-sm opacity-90 mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
    </motion.div>
  );
}

function CommissionRow({ commission }) {
  const config = STATUS_CONFIG[commission.status] || STATUS_CONFIG.pending;
  
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
          <Icon.DollarSign />
        </div>
        <div>
          <p className="font-medium text-gray-900">{commission.order_number}</p>
          <p className="text-sm text-gray-500">
            {new Date(commission.calculated_date || commission.created_date).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm text-gray-500">Đơn hàng</p>
          <p className="font-medium">{commission.order_amount?.toLocaleString('vi-VN')}đ</p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-500">Commission ({commission.commission_rate}%)</p>
          <p className="font-bold text-orange-600">-{commission.commission_amount?.toLocaleString('vi-VN')}đ</p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-500">Nhận về</p>
          <p className="font-bold text-green-600">{commission.shop_revenue?.toLocaleString('vi-VN')}đ</p>
        </div>
        
        <Badge className={config.color}>
          {config.label}
        </Badge>
      </div>
    </div>
  );
}

// ========== MAIN COMPONENT ==========

export default function CommissionReport({ shopId, shopName }) {
  const periodOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  }, []);
  
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0]?.value);
  
  const { commissions, summary, isLoading, error } = useMyShopCommissions(shopId, selectedPeriod);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Icon.Spinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-12 text-red-500">
        Có lỗi xảy ra: {error.message}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Icon.BarChart />
            Báo Cáo Commission
          </h2>
          <p className="text-gray-600 mt-1">{shopName}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Icon.Download />
            Xuất CSV
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <SummaryCard
          title="Tổng Doanh Thu"
          value={`${((summary?.total_order_amount || 0) / 1000000).toFixed(1)}M`}
          subtitle={`${summary?.total_orders || 0} đơn hàng`}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
        />
        
        <SummaryCard
          title="Commission Phải Trả"
          value={`${((summary?.total || 0) / 1000000).toFixed(2)}M`}
          subtitle="Cho platform"
          gradient="bg-gradient-to-br from-orange-500 to-orange-700"
        />
        
        <SummaryCard
          title="Đang Chờ"
          value={summary?.pending_count || 0}
          subtitle={`${summary?.approved_count || 0} đã duyệt`}
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
        />
        
        <SummaryCard
          title="Đã Thanh Toán"
          value={`${((summary?.paid || 0) / 1000000).toFixed(2)}M`}
          subtitle={`${summary?.paid_count || 0} records`}
          gradient="bg-gradient-to-br from-green-500 to-green-700"
        />
      </div>
      
      {/* Commission Rate Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Icon.DollarSign />
              </div>
              <div>
                <p className="font-medium">Commission Rate Áp Dụng</p>
                <p className="text-sm text-gray-500">Phí platform trên mỗi đơn hàng</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">
                {commissions[0]?.commission_rate || 3}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Commission List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Chi Tiết Commission
            <Badge variant="outline" className="ml-2">
              {commissions.length} records
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon.DollarSign />
              <p>Chưa có commission trong tháng này</p>
            </div>
          ) : (
            <div className="space-y-3">
              {commissions.map(commission => (
                <CommissionRow key={commission.id} commission={commission} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}