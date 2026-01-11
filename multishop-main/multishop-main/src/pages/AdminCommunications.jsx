import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';

// Hooks
import {
  useCommunicationLogs,
  useCommunicationStats,
  useFilteredLogs,
  useCommunicationsState
} from '@/components/hooks/useAdminCommunications';

// Components
import CommunicationsStats from '@/components/admin/communications/CommunicationsStats';
import CommunicationsFilters from '@/components/admin/communications/CommunicationsFilters';
import CommunicationsList from '@/components/admin/communications/CommunicationsList';

function AdminCommunicationsContent() {
  // State
  const {
    filters,
    setSearchTerm,
    setChannelFilter,
    setTypeFilter,
    setStatusFilter,
    resetFilters,
    hasFilters
  } = useCommunicationsState();

  // Data
  const { logs, isLoading } = useCommunicationLogs();
  const stats = useCommunicationStats(logs);
  const filteredLogs = useFilteredLogs(logs, filters);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">Communication Logs</h1>
        <p className="text-gray-600">Theo dõi tất cả giao tiếp với khách hàng</p>
      </div>

      {/* Stats */}
      <CommunicationsStats stats={stats} />

      {/* Filters */}
      <CommunicationsFilters
        filters={filters}
        setSearchTerm={setSearchTerm}
        setChannelFilter={setChannelFilter}
        setTypeFilter={setTypeFilter}
        setStatusFilter={setStatusFilter}
        resetFilters={resetFilters}
        hasFilters={hasFilters}
        totalLogs={logs.length}
        filteredCount={filteredLogs.length}
      />

      {/* List */}
      <CommunicationsList
        logs={filteredLogs}
        isLoading={isLoading}
        hasFilters={hasFilters}
      />
    </div>
  );
}

export default function AdminCommunications() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminCommunicationsContent />
      </AdminLayout>
    </AdminGuard>
  );
}