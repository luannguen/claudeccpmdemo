/**
 * AdminPreOrderDisputes - Admin quản lý disputes
 * Page - Admin only
 */

import React, { useState } from 'react';
import { AlertTriangle, Filter, Clock, CheckCircle, ArrowUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Layout
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';

// Hooks - from legacy (not yet migrated to module)
import { useDisputeList, useDisputeStats } from '@/components/hooks/useDispute';

// Constants
const DISPUTE_STATUS = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  RESOLUTION_PROPOSED: 'resolution_proposed',
  ESCALATED: 'escalated',
  RESOLVED: 'resolved'
};

export default function AdminPreOrderDisputes() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Fetch disputes
  const { data: allDisputes = [], isLoading } = useDisputeList({});
  const { data: stats } = useDisputeStats();

  // Filter disputes
  const filteredDisputes = allDisputes.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (severityFilter !== 'all' && d.severity !== severityFilter) return false;
    return true;
  });

  // Group by status
  const openDisputes = filteredDisputes.filter(d => 
    ['open', 'under_review', 'pending_customer_response', 'pending_seller_response'].includes(d.status)
  );
  const pendingResolution = filteredDisputes.filter(d => d.status === 'resolution_proposed');
  const escalated = filteredDisputes.filter(d => d.status === 'escalated');
  const resolved = filteredDisputes.filter(d => ['resolved', 'closed'].includes(d.status));

  return (
    <AdminGuard>
      <AdminLayout currentPageName="AdminPreOrderDisputes">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Disputes</h1>
              <p className="text-sm text-gray-600">Xử lý khiếu nại & sự cố</p>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-700">Đang mở</span>
                </div>
                <p className="text-2xl font-bold text-red-700">{stats.open}</p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">Đã giải quyết</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUp className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-orange-700">Escalated</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">{stats.escalated}</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-700">Vượt SLA</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{stats.breachedSLA || 0}</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value={DISPUTE_STATUS.OPEN}>Mới mở</SelectItem>
                <SelectItem value={DISPUTE_STATUS.UNDER_REVIEW}>Đang review</SelectItem>
                <SelectItem value={DISPUTE_STATUS.RESOLUTION_PROPOSED}>Đã đề xuất</SelectItem>
                <SelectItem value={DISPUTE_STATUS.ESCALATED}>Escalated</SelectItem>
                <SelectItem value={DISPUTE_STATUS.RESOLVED}>Đã giải quyết</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Mức độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="open">
            <TabsList>
              <TabsTrigger value="open">
                Đang mở ({openDisputes.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Chờ khách ({pendingResolution.length})
              </TabsTrigger>
              <TabsTrigger value="escalated">
                Escalated ({escalated.length})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Đã giải quyết ({resolved.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="open">
              <DisputeGrid disputes={openDisputes} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="pending">
              <DisputeGrid disputes={pendingResolution} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="escalated">
              <DisputeGrid disputes={escalated} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="resolved">
              <DisputeGrid disputes={resolved} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

function DisputeGrid({ disputes, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Không có dispute nào</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {disputes.map(dispute => (
        <DisputeCard key={dispute.id} dispute={dispute} />
      ))}
    </div>
  );
}

function DisputeCard({ dispute }) {
  const severityColors = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">#{dispute.ticket_number}</h4>
          <p className="text-xs text-gray-500">#{dispute.order_number}</p>
        </div>
        <Badge className={severityColors[dispute.severity]}>
          {dispute.severity}
        </Badge>
      </div>

      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
        {dispute.customer_description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{dispute.customer_name}</span>
        <span>Priority: {dispute.priority}</span>
      </div>
    </div>
  );
}