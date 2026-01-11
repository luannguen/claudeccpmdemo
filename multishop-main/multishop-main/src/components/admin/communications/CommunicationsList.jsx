import React from 'react';
import { MessageSquare } from 'lucide-react';
import CommunicationLogCard from '@/components/communication/CommunicationLogCard';

export default function CommunicationsList({ logs, isLoading, hasFilters }) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Đang tải logs...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center shadow-lg">
        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Không có logs</h3>
        <p className="text-gray-600">
          {hasFilters
            ? 'Thử thay đổi bộ lọc'
            : 'Chưa có giao tiếp nào được ghi nhận'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map(log => (
        <CommunicationLogCard key={log.id} log={log} isAdmin={true} />
      ))}
    </div>
  );
}