/**
 * SaasMetricsWidget.jsx
 * Widget hiển thị số liệu SaaS trên Dashboard
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function SaasMetricsWidget() {
  // Fetch data
  const { data: tenants = [] } = useQuery({
    queryKey: ['saas-tenants'],
    queryFn: () => base44.entities.Tenant.list('-created_date', 100),
    staleTime: 60000
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['saas-invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 100),
    staleTime: 60000
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ['saas-commissions'],
    queryFn: () => base44.entities.Commission.list('-created_date', 100),
    staleTime: 60000
  });

  // Calculate metrics
  const activeShops = tenants.filter(t => t.status === 'active').length;
  const trialShops = tenants.filter(t => t.subscription_status === 'trial').length;
  
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const pendingInvoices = invoices.filter(i => i.status === 'sent');
  
  const totalMRR = paidInvoices.reduce((sum, i) => sum + (i.subtotal || 0), 0);
  
  const pendingCommission = commissions
    .filter(c => c.status === 'calculated')
    .reduce((sum, c) => sum + (c.commission_amount || 0), 0);
  
  const approvedCommission = commissions
    .filter(c => c.status === 'approved')
    .reduce((sum, c) => sum + (c.commission_amount || 0), 0);
  
  const paidCommission = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

  const totalCommission = pendingCommission + approvedCommission + paidCommission;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon.Store size={24} className="text-indigo-600" />
            <span>SaaS Multi-Shop</span>
          </div>
          <Link 
            to={createPageUrl('SuperAdminDashboard')}
            className="text-sm text-indigo-600 hover:underline font-normal"
          >
            Chi tiết →
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shops Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-indigo-600">{activeShops}</p>
            <p className="text-xs text-gray-500">Shop Active</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{trialShops}</p>
            <p className="text-xs text-gray-500">Đang Trial</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{tenants.length}</p>
            <p className="text-xs text-gray-500">Tổng Shop</p>
          </div>
        </div>

        {/* Revenue Section */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">MRR (Monthly)</span>
            <span className="text-lg font-bold text-green-600">{formatCurrency(totalMRR)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Badge className="bg-green-100 text-green-700">{paidInvoices.length} đã thanh toán</Badge>
            <Badge className="bg-blue-100 text-blue-700">{pendingInvoices.length} chờ TT</Badge>
            {overdueInvoices.length > 0 && (
              <Badge className="bg-red-100 text-red-700">{overdueInvoices.length} quá hạn</Badge>
            )}
          </div>
        </div>

        {/* Commission Section */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Commission</span>
            <span className="text-lg font-bold text-purple-600">{formatCurrency(totalCommission)}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Chờ duyệt</span>
              <span className="font-medium text-amber-600">{formatCurrency(pendingCommission)}</span>
            </div>
            <Progress 
              value={totalCommission > 0 ? (pendingCommission / totalCommission) * 100 : 0} 
              className="h-1.5 bg-amber-100"
            />
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Đã duyệt</span>
              <span className="font-medium text-blue-600">{formatCurrency(approvedCommission)}</span>
            </div>
            <Progress 
              value={totalCommission > 0 ? (approvedCommission / totalCommission) * 100 : 0} 
              className="h-1.5 bg-blue-100"
            />
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Đã trả</span>
              <span className="font-medium text-green-600">{formatCurrency(paidCommission)}</span>
            </div>
            <Progress 
              value={totalCommission > 0 ? (paidCommission / totalCommission) * 100 : 0} 
              className="h-1.5 bg-green-100"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-2">
          <Link 
            to={createPageUrl('SuperAdminCommissions')}
            className="flex items-center gap-2 bg-white rounded-lg p-2 text-xs text-gray-600 hover:bg-indigo-50 transition-colors"
          >
            <Icon.DollarSign size={14} className="text-green-600" />
            Commission
          </Link>
          <Link 
            to={createPageUrl('SuperAdminBilling')}
            className="flex items-center gap-2 bg-white rounded-lg p-2 text-xs text-gray-600 hover:bg-indigo-50 transition-colors"
          >
            <Icon.CreditCard size={14} className="text-blue-600" />
            Billing
          </Link>
          <Link 
            to={createPageUrl('SuperAdminTenants')}
            className="flex items-center gap-2 bg-white rounded-lg p-2 text-xs text-gray-600 hover:bg-indigo-50 transition-colors"
          >
            <Icon.Store size={14} className="text-purple-600" />
            Tenants
          </Link>
          <Link 
            to={createPageUrl('Marketplace')}
            className="flex items-center gap-2 bg-white rounded-lg p-2 text-xs text-gray-600 hover:bg-indigo-50 transition-colors"
          >
            <Icon.ShoppingBag size={14} className="text-orange-600" />
            Marketplace
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}