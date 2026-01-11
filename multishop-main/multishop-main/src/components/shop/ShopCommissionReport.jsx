/**
 * ShopCommissionReport.jsx
 * Component hiển thị báo cáo commission cho shop owner
 * 
 * Phase 1 - Task 1.6 of SaaS Upgrade Plan
 * Created: 2025-01-19
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, TrendingUp, Calendar, Download, 
  Clock, CheckCircle, Wallet, ArrowRight, Store
} from 'lucide-react';
import { useMyShopCommissions, COMMISSION_STATUS } from '@/components/hooks/useCommission';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ========== STATUS CONFIG ==========

const STATUS_CONFIG = {
  [COMMISSION_STATUS.PENDING]: { label: 'Chờ xử lý', color: 'bg-gray-100 text-gray-700', icon: Clock },
  [COMMISSION_STATUS.CALCULATED]: { label: 'Đã tính', color: 'bg-blue-100 text-blue-700', icon: DollarSign },
  [COMMISSION_STATUS.APPROVED]: { label: 'Đã duyệt', color: 'bg-orange-100 text-orange-700', icon: CheckCircle },
  [COMMISSION_STATUS.PAID]: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700', icon: Wallet },
  [COMMISSION_STATUS.CANCELLED]: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: Clock }
};

// ========== SUB COMPONENTS ==========

function SummaryCard({ title, value, subtitle, icon: Icon, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-6 text-white ${gradient}`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 opacity-80" />
      </div>
      <p className="text-sm opacity-90 mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
    </motion.div>
  );
}

function CommissionRow({ commission }) {
  const config = STATUS_CONFIG[commission.status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
          <StatusIcon className="w-5 h-5 text-gray-600" />
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

export default function ShopCommissionReport({ shopId, shopName }) {
  // Generate period options (last 12 months)
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
        <div className="w-8 h-8 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin" />
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
            <Store className="w-7 h-7 text-purple-600" />
            Báo Cáo Commission
          </h2>
          <p className="text-gray-600 mt-1">{shopName}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <Calendar className="w-4 h-4 mr-2" />
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
          
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
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
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
        />
        
        <SummaryCard
          title="Commission Phải Trả"
          value={`${((summary?.total_commission || 0) / 1000000).toFixed(2)}M`}
          subtitle="Cho platform"
          icon={DollarSign}
          gradient="bg-gradient-to-br from-orange-500 to-orange-700"
        />
        
        <SummaryCard
          title="Nhận Về"
          value={`${((summary?.total_shop_revenue || 0) / 1000000).toFixed(1)}M`}
          subtitle="Sau trừ commission"
          icon={Wallet}
          gradient="bg-gradient-to-br from-green-500 to-green-700"
        />
        
        <SummaryCard
          title="Đang Chờ"
          value={summary?.pending_count || 0}
          subtitle={`${summary?.approved_count || 0} đã duyệt`}
          icon={Clock}
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
        />
      </div>
      
      {/* Commission Rate Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
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
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-30" />
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
      
      {/* Payment Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">Thanh Toán Commission</h4>
              <p className="text-sm text-gray-600 mt-1">
                Commission được tự động trừ vào cuối mỗi tháng. Số tiền sẽ được khấu trừ từ doanh thu 
                hoặc thanh toán riêng nếu shop chọn model thanh toán tách biệt.
              </p>
              <Button variant="link" className="p-0 mt-2 text-blue-600">
                Xem chi tiết chính sách <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}