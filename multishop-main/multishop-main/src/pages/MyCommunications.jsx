import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CommunicationLogCard from '@/components/communication/CommunicationLogCard';
import { MessageSquare, Mail, Bell, Filter } from 'lucide-react';

const channelOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Thông báo' },
  { value: 'order_chat', label: 'Chat đơn hàng' }
];

export default function MyCommunications() {
  const [channelFilter, setChannelFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['my-communications-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['my-communication-logs', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const allLogs = await base44.entities.CommunicationLog.list('-created_date', 500);
      return allLogs.filter(log => log.customer_email === user.email);
    },
    enabled: !!user?.email,
    refetchInterval: 10000
  });

  const stats = useMemo(() => {
    return {
      total: logs.length,
      email: logs.filter(l => l.channel === 'email').length,
      sms: logs.filter(l => l.channel === 'sms').length,
      unread: logs.filter(l => l.status === 'sent').length
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (channelFilter === 'all') return logs;
    return logs.filter(log => log.channel === channelFilter);
  }, [logs, channelFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-32 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold mb-2">Lịch Sử Giao Tiếp</h1>
          <p className="text-gray-600">Xem tất cả tin nhắn, email và thông báo từ chúng tôi</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Tổng</p>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Email</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.email}</p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">SMS</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.sms}</p>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-gray-600">Mới</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.unread}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Lọc theo kênh</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {channelOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setChannelFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  channelFilter === option.value
                    ? 'bg-[#7CB342] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label} ({option.value === 'all' ? stats.total : 
                  logs.filter(l => l.channel === option.value).length})
              </button>
            ))}
          </div>
        </div>

        {/* Logs */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="space-y-3">
            {filteredLogs.map(log => (
              <CommunicationLogCard key={log.id} log={log} isAdmin={false} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có tin nhắn</h3>
            <p className="text-gray-600">
              {channelFilter !== 'all' 
                ? `Bạn chưa nhận ${channelOptions.find(o => o.value === channelFilter)?.label.toLowerCase()} nào`
                : 'Khi có giao tiếp mới, chúng sẽ hiển thị ở đây'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}