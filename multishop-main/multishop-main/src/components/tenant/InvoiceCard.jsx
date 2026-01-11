/**
 * InvoiceCard.jsx
 * Component hiển thị invoice card
 * 
 * Phase 2 - Task 2.8 of SaaS Upgrade Plan
 * Created: 2025-01-19
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Calendar, DollarSign, Clock, 
  CheckCircle, AlertCircle, Download, Eye 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// ========== STATUS CONFIG ==========

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  sent: { label: 'Đã gửi', color: 'bg-blue-100 text-blue-700', icon: Clock },
  paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  overdue: { label: 'Quá hạn', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  cancelled: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-700', icon: FileText }
};

// ========== COMPONENT ==========

export default function InvoiceCard({ invoice, onView, onPay, onDownload }) {
  const config = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;
  const StatusIcon = config.icon;
  
  const dueDate = new Date(invoice.due_date);
  const now = new Date();
  const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;
  const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;
  
  return (
    <Card className={`${isOverdue ? 'border-red-300 border-2' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              invoice.status === 'paid' ? 'bg-green-100' :
              invoice.status === 'overdue' ? 'bg-red-100' :
              'bg-blue-100'
            }`}>
              <StatusIcon className={`w-5 h-5 ${
                invoice.status === 'paid' ? 'text-green-600' :
                invoice.status === 'overdue' ? 'text-red-600' :
                'text-blue-600'
              }`} />
            </div>
            <div>
              <p className="font-bold text-gray-900">{invoice.invoice_number}</p>
              <p className="text-sm text-gray-500">{invoice.plan_name?.toUpperCase()} Plan</p>
            </div>
          </div>
          
          <Badge className={config.color}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Amount */}
        <div className="flex items-center justify-between py-3 border-y border-gray-100">
          <span className="text-sm text-gray-600">Tổng thanh toán</span>
          <span className="text-2xl font-bold text-gray-900">
            {invoice.total_amount?.toLocaleString('vi-VN')}đ
          </span>
        </div>
        
        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Ngày phát hành</span>
            <span className="font-medium">
              {new Date(invoice.invoice_date).toLocaleDateString('vi-VN')}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Hạn thanh toán</span>
            <span className={`font-medium ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : ''}`}>
              {dueDate.toLocaleDateString('vi-VN')}
              {isOverdue && ` (Quá ${Math.abs(daysUntilDue)} ngày)`}
              {isUrgent && !isOverdue && ` (Còn ${daysUntilDue} ngày)`}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Chu kỳ</span>
            <span className="font-medium">
              {new Date(invoice.billing_period_start).toLocaleDateString('vi-VN')} 
              {' → '}
              {new Date(invoice.billing_period_end).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {invoice.status === 'sent' && onPay && (
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
              onClick={() => onPay(invoice)}
            >
              <DollarSign className="w-4 h-4" />
              Thanh Toán
            </Button>
          )}
          
          {onView && (
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => onView(invoice)}
            >
              <Eye className="w-4 h-4" />
              Xem
            </Button>
          )}
          
          {onDownload && (
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => onDownload(invoice)}
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}