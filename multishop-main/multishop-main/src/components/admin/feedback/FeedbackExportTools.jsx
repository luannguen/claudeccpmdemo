import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/NotificationToast';
import FeedbackService from '@/components/services/FeedbackService';
import { format } from 'date-fns';

export default function FeedbackExportTools() {
  const { addToast } = useToast();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [showFilters, setShowFilters] = useState(false);

  const { data: allFeedback = [] } = useQuery({
    queryKey: ['all-feedback-export'],
    queryFn: () => base44.entities.Feedback.list('-created_date', 1000)
  });

  const { data: commentsMap = {} } = useQuery({
    queryKey: ['feedback-comments-export'],
    queryFn: async () => {
      const comments = await base44.entities.FeedbackComment.list('-created_date', 2000);
      const map = {};
      comments.forEach(c => {
        if (!c.is_internal) {
          map[c.feedback_id] = (map[c.feedback_id] || 0) + 1;
        }
      });
      return map;
    }
  });

  // Apply filters
  const filteredFeedback = allFeedback.filter(f => {
    const matchStatus = filterStatus === 'all' || f.status === filterStatus;
    const matchCategory = filterCategory === 'all' || f.category === filterCategory;
    
    let matchDate = true;
    if (dateRange.from) {
      matchDate = new Date(f.created_date) >= dateRange.from;
    }
    if (dateRange.to && matchDate) {
      matchDate = new Date(f.created_date) <= dateRange.to;
    }
    
    return matchStatus && matchCategory && matchDate;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Tiêu đề', 'Danh mục', 'Mức độ', 'Trạng thái', 'Sentiment', 'Người gửi', 'Email', 'Số comments', 'Votes', 'Ngày tạo', 'Ngày xử lý'];
    
    const rows = filteredFeedback.map(f => [
      f.id,
      f.title,
      FeedbackService.CATEGORY_LABELS[f.category] || f.category,
      FeedbackService.PRIORITY_LABELS[f.priority] || f.priority,
      FeedbackService.STATUS_LABELS[f.status] || f.status,
      f.ai_sentiment || '',
      f.user_name || '',
      f.user_email || f.created_by || '',
      commentsMap[f.id] || 0,
      f.votes || 0,
      new Date(f.created_date).toLocaleDateString('vi-VN'),
      f.reviewed_date ? new Date(f.reviewed_date).toLocaleDateString('vi-VN') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `feedback-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    addToast(`Đã xuất ${filteredFeedback.length} feedback sang CSV`, 'success');
  };

  const exportToJSON = () => {
    const exportData = filteredFeedback.map(f => ({
      ...f,
      comments_count: commentsMap[f.id] || 0,
      category_label: FeedbackService.CATEGORY_LABELS[f.category],
      priority_label: FeedbackService.PRIORITY_LABELS[f.priority],
      status_label: FeedbackService.STATUS_LABELS[f.status]
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `feedback-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    addToast(`Đã xuất ${filteredFeedback.length} feedback sang JSON`, 'success');
  };

  return (
    <Popover open={showFilters} onOpenChange={setShowFilters}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Icon.Download size={18} />
          Xuất dữ liệu
          {(filterStatus !== 'all' || filterCategory !== 'all' || dateRange.from) && (
            <Badge variant="secondary" className="ml-1">{filteredFeedback.length}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Xuất Feedback</h4>
            <Badge variant="outline">{filteredFeedback.length} / {allFeedback.length}</Badge>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {Object.entries(FeedbackService.STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {Object.entries(FeedbackService.CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Icon.Calendar size={12} />
              {dateRange.from ? (
                <span>
                  {format(dateRange.from, 'dd/MM/yyyy')}
                  {dateRange.to && ` - ${format(dateRange.to, 'dd/MM/yyyy')}`}
                </span>
              ) : (
                <span>Tất cả thời gian</span>
              )}
              {dateRange.from && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-5 px-1"
                  onClick={() => setDateRange({ from: null, to: null })}
                >
                  <Icon.X size={10} />
                </Button>
              )}
            </div>
          </div>

          <div className="border-t pt-3 space-y-2">
            <Button onClick={exportToCSV} variant="outline" className="w-full justify-start">
              <Icon.FileText size={16} className="mr-2" />
              Xuất CSV
            </Button>
            <Button onClick={exportToJSON} variant="outline" className="w-full justify-start">
              <Icon.Code size={16} className="mr-2" />
              Xuất JSON
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}