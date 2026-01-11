import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Mail, Search, UserPlus, UserMinus, TrendingUp, Users, Send, Download, Tag, Filter, X, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

function SendCampaignModal({ isOpen, onClose, subscribers }) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) return;
    
    setIsSending(true);
    setProgress(0);

    try {
      const total = subscribers.length;
      for (let i = 0; i < total; i++) {
        const sub = subscribers[i];
        try {
          await base44.integrations.Core.SendEmail({
            from_name: 'Zero Farm Newsletter',
            to: sub.email,
            subject: subject,
            body: content
          });

          await base44.entities.NewsletterSubscriber.update(sub.id, {
            last_email_sent: new Date().toISOString(),
            emails_sent: (sub.emails_sent || 0) + 1
          });
        } catch (error) {
          console.error(`Failed to send to ${sub.email}:`, error);
        }
        
        setProgress(Math.round(((i + 1) / total) * 100));
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
      }

      alert(`Đã gửi thành công ${total} email!`);
      onClose();
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSending(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-[#0F0F0F]">
            Gửi Email Campaign
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-700">
              <Users className="w-4 h-4 inline mr-2" />
              Sẽ gửi đến <strong>{subscribers.length}</strong> subscribers
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề email *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="🌱 Ưu đãi đặc biệt từ Zero Farm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung email *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
              rows={10}
              placeholder="Kính chào quý khách,&#10;&#10;Chúng tôi có tin tuyệt vời..."
            />
          </div>

          {isSending && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Đang gửi...</span>
                <span className="text-sm font-bold text-[#7CB342]">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#7CB342] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={!subject.trim() || !content.trim() || isSending}
            className="w-full bg-[#7CB342] text-white py-4 rounded-xl font-medium hover:bg-[#FF9800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {isSending ? `Đang gửi... ${progress}%` : 'Gửi Email Campaign'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function AdminNewsletterContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const result = await base44.entities.NewsletterSubscriber.list('-created_date', 500);
      return result || [];
    },
    staleTime: 2 * 60 * 1000
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.NewsletterSubscriber.update(id, { 
      status,
      unsubscribed_date: status === 'unsubscribed' ? new Date().toISOString() : undefined
    }),
    onSuccess: () => queryClient.invalidateQueries(['newsletter-subscribers'])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NewsletterSubscriber.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['newsletter-subscribers'])
  });

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(sub => {
      const matchesSearch = 
        sub.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscribers, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: subscribers.length,
    active: subscribers.filter(s => s.status === 'active').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
    totalSent: subscribers.reduce((sum, s) => sum + (s.emails_sent || 0), 0),
    totalOpened: subscribers.reduce((sum, s) => sum + (s.emails_opened || 0), 0),
    avgOpenRate: subscribers.length > 0 
      ? Math.round((subscribers.reduce((sum, s) => sum + (s.emails_opened || 0), 0) / 
          Math.max(subscribers.reduce((sum, s) => sum + (s.emails_sent || 0), 0), 1)) * 100)
      : 0
  }), [subscribers]);

  const exportCSV = () => {
    const csv = [
      ['Email', 'Họ tên', 'Trạng thái', 'Ngày đăng ký', 'Email đã gửi', 'Email đã mở'].join(','),
      ...filteredSubscribers.map(s => [
        s.email,
        s.full_name || '',
        s.status,
        new Date(s.created_date).toLocaleDateString('vi-VN'),
        s.emails_sent || 0,
        s.emails_opened || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div>
      {/* Header & Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">
              Newsletter Subscribers
            </h1>
            <p className="text-gray-600">Quản lý danh sách đăng ký nhận tin</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              className="px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
            <button
              onClick={() => setShowCampaignModal(true)}
              disabled={filteredSubscribers.filter(s => s.status === 'active').length === 0}
              className="bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              Gửi Campaign
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
            <Users className="w-8 h-8 text-[#7CB342] mb-2" />
            <p className="text-2xl font-bold text-[#0F0F0F]">{stats.total}</p>
            <p className="text-sm text-gray-600">Tổng subscribers</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 shadow-lg border border-green-200">
            <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-green-700">Đang hoạt động</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 shadow-lg border border-red-200">
            <UserMinus className="w-8 h-8 text-red-600 mb-2" />
            <p className="text-2xl font-bold text-red-600">{stats.unsubscribed}</p>
            <p className="text-sm text-red-700">Đã hủy</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 shadow-lg border border-blue-200">
            <Send className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">{stats.totalSent}</p>
            <p className="text-sm text-blue-700">Email đã gửi</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 shadow-lg border border-purple-200">
            <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-600">{stats.avgOpenRate}%</p>
            <p className="text-sm text-purple-700">Tỷ lệ mở email</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo email, tên..."
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
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="unsubscribed">Đã hủy</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>
      </div>

      {/* Subscribers List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có subscribers nào</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscribers.map((subscriber) => (
            <motion.div
              key={subscriber.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {subscriber.email?.charAt(0).toUpperCase()}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  subscriber.status === 'active' ? 'bg-green-100 text-green-700' :
                  subscriber.status === 'unsubscribed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {subscriber.status === 'active' ? 'Active' :
                   subscriber.status === 'unsubscribed' ? 'Unsubscribed' : 'Bounced'}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 mb-2 truncate">{subscriber.email}</h3>
              {subscriber.full_name && (
                <p className="text-sm text-gray-600 mb-3">{subscriber.full_name}</p>
              )}

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="text-xs text-blue-600">Đã gửi</p>
                  <p className="font-bold text-blue-700">{subscriber.emails_sent || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2">
                  <p className="text-xs text-green-600">Đã mở</p>
                  <p className="font-bold text-green-700">{subscriber.emails_opened || 0}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-2">
                  <p className="text-xs text-purple-600">Clicks</p>
                  <p className="font-bold text-purple-700">{subscriber.emails_clicked || 0}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {subscriber.status === 'active' ? (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: subscriber.id, status: 'unsubscribed' })}
                    className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Unsubscribe
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: subscriber.id, status: 'active' })}
                    className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    Reactivate
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Xóa subscriber này?')) {
                      deleteMutation.mutate(subscriber.id);
                    }
                  }}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Đăng ký: {new Date(subscriber.created_date).toLocaleDateString('vi-VN')}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Campaign Modal */}
      <SendCampaignModal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        subscribers={filteredSubscribers.filter(s => s.status === 'active')}
      />
    </div>
  );
}

export default function AdminNewsletter() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminNewsletterContent />
      </AdminLayout>
    </AdminGuard>
  );
}