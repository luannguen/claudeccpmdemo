import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity, Search, Filter, User, Calendar,
  Edit, Trash2, Plus, Clock, FileText, Download
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

const actionTypeIcons = {
  create: <Plus className="w-4 h-4" />,
  update: <Edit className="w-4 h-4" />,
  delete: <Trash2 className="w-4 h-4" />,
  bulk_update: <Edit className="w-4 h-4" />,
  bulk_delete: <Trash2 className="w-4 h-4" />,
  export: <Download className="w-4 h-4" />,
  login: <User className="w-4 h-4" />,
  logout: <User className="w-4 h-4" />,
  status_change: <FileText className="w-4 h-4" />
};

const actionTypeColors = {
  create: 'bg-green-100 text-green-600',
  update: 'bg-blue-100 text-blue-600',
  delete: 'bg-red-100 text-red-600',
  bulk_update: 'bg-purple-100 text-purple-600',
  bulk_delete: 'bg-red-100 text-red-600',
  export: 'bg-gray-100 text-gray-600',
  login: 'bg-green-100 text-green-600',
  logout: 'bg-gray-100 text-gray-600',
  status_change: 'bg-orange-100 text-orange-600'
};

function AdminActivityLogsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 500),
    initialData: [],
    staleTime: 2 * 60 * 1000
  });

  const filteredLogs = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return logs.filter(log => {
      const matchesSearch = 
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter === "all" || log.action_type === actionFilter;
      const matchesEntity = entityFilter === "all" || log.entity_type === entityFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const logDate = new Date(log.created_date);
        if (dateFilter === "today") matchesDate = logDate >= today;
        else if (dateFilter === "week") matchesDate = logDate >= weekAgo;
        else if (dateFilter === "month") matchesDate = logDate >= monthAgo;
      }

      return matchesSearch && matchesAction && matchesEntity && matchesDate;
    });
  }, [logs, searchTerm, actionFilter, entityFilter, dateFilter]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = logs.filter(l => new Date(l.created_date) >= today);
    
    const byAction = logs.reduce((acc, log) => {
      acc[log.action_type] = (acc[log.action_type] || 0) + 1;
      return acc;
    }, {});

    const byEntity = logs.reduce((acc, log) => {
      acc[log.entity_type] = (acc[log.entity_type] || 0) + 1;
      return acc;
    }, {});

    const uniqueUsers = new Set(logs.map(l => l.user_email)).size;

    return {
      total: logs.length,
      today: todayLogs.length,
      byAction,
      byEntity,
      uniqueUsers
    };
  }, [logs]);

  const exportLogs = () => {
    const csv = [
      ['Date', 'User', 'Action', 'Entity Type', 'Entity Name', 'Description'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_date).toLocaleString('vi-VN'),
        log.user_email,
        log.action_type,
        log.entity_type,
        log.entity_name || '',
        (log.description || '').replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">
            Activity Logs
          </h1>
          <p className="text-gray-600">Audit trail của toàn bộ hệ thống</p>
        </div>
        <button
          onClick={exportLogs}
          className="px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export Logs
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <Activity className="w-8 h-8 text-[#7CB342] mb-2" />
          <p className="text-2xl font-bold text-[#0F0F0F]">{stats.total}</p>
          <p className="text-sm text-gray-600">Tổng hoạt động</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 shadow-lg border border-blue-200">
          <Clock className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
          <p className="text-sm text-blue-700">Hôm nay</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 shadow-lg border border-purple-200">
          <User className="w-8 h-8 text-purple-600 mb-2" />
          <p className="text-2xl font-bold text-purple-600">{stats.uniqueUsers}</p>
          <p className="text-sm text-purple-700">Users hoạt động</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 shadow-lg border border-green-200">
          <FileText className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-2xl font-bold text-green-600">{filteredLogs.length}</p>
          <p className="text-sm text-green-700">Logs hiển thị</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          >
            <option value="all">Tất cả hành động</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="bulk_update">Bulk Update</option>
            <option value="bulk_delete">Bulk Delete</option>
            <option value="export">Export</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="status_change">Status Change</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          >
            <option value="all">Tất cả entity</option>
            <option value="product">Product</option>
            <option value="order">Order</option>
            <option value="customer">Customer</option>
            <option value="post">Post</option>
            <option value="review">Review</option>
            <option value="category">Category</option>
            <option value="user">User</option>
            <option value="setting">Setting</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${actionTypeColors[log.action_type]}`}>
                    {actionTypeIcons[log.action_type]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">
                          {log.user_name || log.user_email}
                        </p>
                        <p className="text-sm text-gray-500">{log.user_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(log.created_date).toLocaleString('vi-VN')}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${actionTypeColors[log.action_type]} mt-1`}>
                          {log.action_type}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">{log.entity_type}</span>
                        {log.entity_name && <span className="text-gray-500"> - {log.entity_name}</span>}
                      </p>
                      {log.description && (
                        <p className="text-sm text-gray-600">{log.description}</p>
                      )}
                    </div>

                    {(log.old_values || log.new_values) && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                          Xem chi tiết thay đổi
                        </summary>
                        <div className="mt-2 grid md:grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
                          {log.old_values && (
                            <div>
                              <p className="text-xs font-bold text-blue-900 mb-1">Giá trị cũ:</p>
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                {JSON.stringify(log.old_values, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.new_values && (
                            <div>
                              <p className="text-xs font-bold text-green-900 mb-1">Giá trị mới:</p>
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                {JSON.stringify(log.new_values, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không có activity log nào</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminActivityLogs() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminActivityLogsContent />
      </AdminLayout>
    </AdminGuard>
  );
}