/**
 * TestCaseHistory - Hiển thị lịch sử test case chi tiết
 */

import React from "react";
import { motion } from "framer-motion";
import { 
  Clock, Check, X, AlertCircle, RefreshCw, User, MessageSquare,
  ChevronDown, ChevronUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";

const statusIcons = {
  pending: Clock,
  passed: Check,
  failed: X,
  skipped: AlertCircle,
  blocked: AlertCircle,
  ready_for_retest: RefreshCw
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-600 border-gray-300',
  passed: 'bg-green-100 text-green-700 border-green-300',
  failed: 'bg-red-100 text-red-700 border-red-300',
  skipped: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  blocked: 'bg-orange-100 text-orange-700 border-orange-300',
  ready_for_retest: 'bg-blue-100 text-blue-700 border-blue-300'
};

const statusLabels = {
  pending: 'Chờ test',
  passed: 'Đạt',
  failed: 'Lỗi',
  skipped: 'Bỏ qua',
  blocked: 'Bị chặn',
  ready_for_retest: 'Sẵn sàng test lại'
};

function HistoryItem({ item, isLast }) {
  const Icon = statusIcons[item.status] || Clock;
  const colorClass = statusColors[item.status] || statusColors.pending;

  return (
    <div className="flex gap-3">
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        {!isLast && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge className={colorClass}>
              {statusLabels[item.status] || item.status}
            </Badge>
            {item.version && (
              <Badge variant="outline" className="ml-2">v{item.version}</Badge>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {item.timestamp ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: vi }) : ''}
          </span>
        </div>

        {/* Tester info */}
        {item.tester && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{item.tester}</span>
            {item.tester_email && (
              <span className="text-gray-400">({item.tester_email})</span>
            )}
          </div>
        )}

        {/* Note */}
        {item.note && (
          <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            {item.note}
          </p>
        )}

        {/* Dev response */}
        {item.dev_response && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
              <MessageSquare className="w-4 h-4" />
              Phản hồi từ Developer
            </div>
            <p className="mt-1 text-sm text-blue-600">{item.dev_response}</p>
          </div>
        )}

        {/* Timestamp detail */}
        {item.timestamp && (
          <p className="mt-2 text-xs text-gray-400">
            {format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
          </p>
        )}
      </div>
    </div>
  );
}

export default function TestCaseHistory({ history = [], testCase }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Combine current state with history
  const allHistory = React.useMemo(() => {
    const items = [...(history || [])];
    
    // Sort by timestamp descending (newest first)
    items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return items;
  }, [history]);

  if (allHistory.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-400">
        Chưa có lịch sử test
      </div>
    );
  }

  const displayItems = isExpanded ? allHistory : allHistory.slice(0, 3);
  const hasMore = allHistory.length > 3;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-700 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Lịch sử Test ({allHistory.length} lần)
        </h4>
        {testCase?.retest_count > 0 && (
          <Badge variant="outline" className="bg-blue-50">
            <RefreshCw className="w-3 h-3 mr-1" />
            Đã test lại {testCase.retest_count} lần
          </Badge>
        )}
      </div>

      <div className="mt-4">
        {displayItems.map((item, index) => (
          <HistoryItem 
            key={index} 
            item={item} 
            isLast={index === displayItems.length - 1} 
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 mt-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" /> Thu gọn
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> Xem thêm {allHistory.length - 3} mục
            </>
          )}
        </button>
      )}
    </div>
  );
}