import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  MessageSquare, Search, Clock, CheckCircle, AlertCircle,
  User, Mail, Calendar, X, Send, Paperclip, Tag,
  Filter, TrendingUp, Star
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

const PRIORITIES = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' }
};

const STATUSES = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: TrendingUp },
  waiting_customer: { label: 'Waiting', color: 'bg-purple-100 text-purple-700', icon: User },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700', icon: CheckCircle }
};

const CATEGORIES = {
  technical: { label: 'Technical', emoji: '🔧' },
  billing: { label: 'Billing', emoji: '💳' },
  feature_request: { label: 'Feature Request', emoji: '✨' },
  bug: { label: 'Bug', emoji: '🐛' },
  general: { label: 'General', emoji: '💬' }
};

function TicketDetailModal({ ticket, onClose, onUpdate }) {
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState(ticket?.status || 'open');
  const [priority, setPriority] = useState(ticket?.priority || 'normal');
  const [assignedTo, setAssignedTo] = useState(ticket?.assigned_to || '');
  const [isSending, setIsSending] = useState(false);

  if (!ticket) return null;

  const handleSendResponse = async () => {
    if (!response.trim()) return;
    
    setIsSending(true);
    try {
      // Update ticket with response
      const updatedResponses = [
        ...(ticket.responses || []),
        {
          author: assignedTo || 'admin@zerofarm.vn',
          message: response,
          timestamp: new Date().toISOString(),
          is_internal: false
        }
      ];

      await onUpdate(ticket.id, {
        responses: updatedResponses,
        status: status === 'open' ? 'in_progress' : status,
        assigned_to: assignedTo
      });

      // Send email to customer
      await base44.integrations.Core.SendEmail({
        from_name: 'Zero Farm Support',
        to: ticket.requester_email,
        subject: `Re: ${ticket.subject} [#${ticket.ticket_number}]`,
        body: `
Xin chào ${ticket.requester_name},

${response}

---
Support Team
Zero Farm Platform

Ticket #${ticket.ticket_number}
        `
      });

      setResponse('');
      onClose();
    } catch (error) {
      alert('Có lỗi xảy ra.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#0F0F0F]">
              Ticket #{ticket.ticket_number}
            </h2>
            <p className="text-sm text-gray-600">{ticket.subject}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Ticket Info */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Requester</p>
                  <p className="font-medium">{ticket.requester_name}</p>
                  <p className="text-sm text-gray-600">{ticket.requester_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="font-medium">{new Date(ticket.created_date).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold text-[#0F0F0F] mb-3">Mô Tả:</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Response History */}
          {ticket.responses && ticket.responses.length > 0 && (
            <div>
              <h3 className="font-bold text-[#0F0F0F] mb-3">Lịch Sử Phản Hồi:</h3>
              <div className="space-y-3">
                {ticket.responses.map((resp, idx) => (
                  <div key={idx} className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-blue-900">{resp.author}</p>
                      <p className="text-xs text-blue-600">
                        {new Date(resp.timestamp).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <p className="text-gray-700">{resp.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update Fields */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              >
                {Object.entries(STATUSES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              >
                {Object.entries(PRIORITIES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
              <input
                type="email"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="admin@zerofarm.vn"
              />
            </div>
          </div>

          {/* Response Form */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phản Hồi Ticket
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
              placeholder="Nhập phản hồi của bạn..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
            >
              Đóng
            </button>
            <button
              onClick={handleSendResponse}
              disabled={!response.trim() || isSending}
              className="flex-1 px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Gửi Phản Hồi
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SuperAdminSupportContent() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 500),
    initialData: []
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupportTicket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['support-tickets']);
    }
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.requester_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.requester_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    avgResponseTime: '2.5h', // Mock
    satisfaction: 4.5 // Mock
  };

  const handleUpdate = (id, data) => {
    updateMutation.mutate({ id, data });
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gray-600">Đang tải support tickets...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">
          Support Tickets
        </h1>
        <p className="text-gray-600">Quản lý yêu cầu hỗ trợ từ tenants</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Tổng Tickets</p>
          <p className="text-3xl font-bold text-[#0F0F0F]">{stats.total}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow-lg border border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Open</p>
          <p className="text-3xl font-bold text-blue-600">{stats.open}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 shadow-lg border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-lg border border-green-200">
          <p className="text-sm text-green-700 mb-1">Resolved</p>
          <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 shadow-lg border border-purple-200">
          <p className="text-sm text-purple-700 mb-1">Avg Response</p>
          <p className="text-3xl font-bold text-purple-600">{stats.avgResponseTime}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 shadow-lg border border-orange-200">
          <p className="text-sm text-orange-700 mb-1">Satisfaction</p>
          <p className="text-3xl font-bold text-orange-600 flex items-center gap-1">
            <Star className="w-6 h-6 fill-current" />
            {stats.satisfaction}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="grid md:grid-cols-5 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo subject, name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          >
            <option value="all">All Status</option>
            {Object.entries(STATUSES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          >
            <option value="all">All Priority</option>
            {Object.entries(PRIORITIES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORIES).map(([key, val]) => (
              <option key={key} value={key}>{val.emoji} {val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Không có ticket nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const StatusIcon = STATUSES[ticket.status]?.icon || Clock;
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    ticket.priority === 'urgent' ? 'bg-red-100' :
                    ticket.priority === 'high' ? 'bg-orange-100' :
                    'bg-blue-100'
                  }`}>
                    <MessageSquare className={`w-6 h-6 ${
                      ticket.priority === 'urgent' ? 'text-red-600' :
                      ticket.priority === 'high' ? 'text-orange-600' :
                      'text-blue-600'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{ticket.subject}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${PRIORITIES[ticket.priority]?.color}`}>
                            {PRIORITIES[ticket.priority]?.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm mt-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{ticket.requester_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{ticket.requester_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(ticket.created_date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {CATEGORIES[ticket.category]?.emoji} {CATEGORIES[ticket.category]?.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${STATUSES[ticket.status]?.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {STATUSES[ticket.status]?.label}
                      </span>
                      {ticket.responses && ticket.responses.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {ticket.responses.length} responses
                        </span>
                      )}
                      {ticket.assigned_to && (
                        <span className="text-xs text-gray-500">
                          Assigned to: {ticket.assigned_to}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

export default function SuperAdminSupport() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin']}>
      <AdminLayout>
        <SuperAdminSupportContent />
      </AdminLayout>
    </AdminGuard>
  );
}