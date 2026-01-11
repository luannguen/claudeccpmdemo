import React from 'react';
import {
  FileText, Search, Filter, User, Settings, DollarSign, Shield, Award, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import { useReferralAuditLogs } from '@/components/hooks/useReferralSystem';

const ACTION_CONFIG = {
  member_joined: { label: 'Đăng ký thành viên', icon: User, color: 'bg-blue-100 text-blue-700' },
  member_activated: { label: 'Kích hoạt thành viên', icon: User, color: 'bg-green-100 text-green-700' },
  member_suspended: { label: 'Đình chỉ thành viên', icon: User, color: 'bg-red-100 text-red-700' },
  member_banned: { label: 'Cấm thành viên', icon: User, color: 'bg-red-100 text-red-700' },
  member_reactivated: { label: 'Kích hoạt lại', icon: User, color: 'bg-green-100 text-green-700' },
  code_changed: { label: 'Đổi mã giới thiệu', icon: Settings, color: 'bg-purple-100 text-purple-700' },
  commission_calculated: { label: 'Tính hoa hồng', icon: DollarSign, color: 'bg-amber-100 text-amber-700' },
  commission_approved: { label: 'Duyệt hoa hồng', icon: DollarSign, color: 'bg-green-100 text-green-700' },
  commission_paid: { label: 'Thanh toán hoa hồng', icon: DollarSign, color: 'bg-green-100 text-green-700' },
  commission_cancelled: { label: 'Hủy hoa hồng', icon: DollarSign, color: 'bg-red-100 text-red-700' },
  fraud_detected: { label: 'Phát hiện gian lận', icon: Shield, color: 'bg-red-100 text-red-700' },
  fraud_cleared: { label: 'Xóa cảnh báo gian lận', icon: Shield, color: 'bg-green-100 text-green-700' },
  settings_updated: { label: 'Cập nhật cài đặt', icon: Settings, color: 'bg-purple-100 text-purple-700' },
  rank_upgraded: { label: 'Lên hạng', icon: Award, color: 'bg-amber-100 text-amber-700' },
  payout_processed: { label: 'Xử lý thanh toán', icon: DollarSign, color: 'bg-green-100 text-green-700' }
};

function LogItem({ log }) {
  const config = ACTION_CONFIG[log.action_type] || { label: log.action_type, icon: FileText, color: 'bg-gray-100 text-gray-700' };
  const Icon = config.icon;
  
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border hover:shadow-sm transition-shadow">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Badge className={config.color}>{config.label}</Badge>
          <span className="text-xs text-gray-400">
            {new Date(log.created_date).toLocaleString('vi-VN')}
          </span>
        </div>
        <p className="text-gray-700">{log.description}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {log.actor_email}
          </span>
          {log.actor_role && (
            <Badge variant="outline" className="text-xs">
              {log.actor_role === 'admin' ? 'Admin' : log.actor_role === 'system' ? 'Hệ thống' : 'User'}
            </Badge>
          )}
          {log.target_email && (
            <span className="text-gray-400">→ {log.target_email}</span>
          )}
        </div>
        {(log.old_value || log.new_value) && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            {log.old_value && (
              <div className="text-red-600">
                - {JSON.stringify(log.old_value)}
              </div>
            )}
            {log.new_value && (
              <div className="text-green-600">
                + {JSON.stringify(log.new_value)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminReferralAuditLogContent() {
  const [filters, setFilters] = React.useState({ actionType: 'all', targetEmail: '' });
  const { data: logs = [], isLoading } = useReferralAuditLogs(filters);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-gray-500">Lịch sử hành động trong hệ thống giới thiệu</p>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo email..."
                  value={filters.targetEmail}
                  onChange={(e) => setFilters(prev => ({ ...prev, targetEmail: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select 
              value={filters.actionType} 
              onValueChange={(v) => setFilters(prev => ({ ...prev, actionType: v }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Loại hành động" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Logs List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Chưa có log nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <LogItem key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminReferralAuditLog() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminReferralAuditLogContent />
      </AdminLayout>
    </AdminGuard>
  );
}