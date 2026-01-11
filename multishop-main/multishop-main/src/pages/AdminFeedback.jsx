import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import FeedbackAITriage from '@/components/admin/feedback/FeedbackAITriage';
import FeedbackAnalyticsDashboard from '@/components/admin/feedback/FeedbackAnalyticsDashboard';
import FeedbackWorkflowManager from '@/components/admin/feedback/FeedbackWorkflowManager';
import FeedbackThreadView from '@/components/feedback/FeedbackThreadView';
import FeedbackExportTools from '@/components/admin/feedback/FeedbackExportTools';
import FeedbackLinkToFeature from '@/components/admin/feedback/FeedbackLinkToFeature';
import FeedbackService from '@/components/services/FeedbackService';
import { useFeedbacks, useFeedbackStats } from '@/components/hooks/useFeedback';
import { Dialog, DialogContent } from '@/components/ui/dialog';

function FeedbackCard({ feedback, onClick, onLinkToFeature }) {
  const categoryColors = {
    bug: 'bg-red-100 text-red-700',
    feature_request: 'bg-blue-100 text-blue-700',
    improvement: 'bg-green-100 text-green-700',
    ui_ux: 'bg-purple-100 text-purple-700',
    performance: 'bg-orange-100 text-orange-700',
    other: 'bg-gray-100 text-gray-700'
  };

  const emojiMap = { 1: '😠', 2: '😐', 3: '😊', 4: '😍' };

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            {feedback.rating && <span className="text-2xl">{emojiMap[feedback.rating]}</span>}
            <h3 className="font-bold text-lg flex-1">{feedback.title}</h3>
          </div>
          
          {/* Quick link button */}
          {(feedback.category === 'bug' || feedback.category === 'feature_request') && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onLinkToFeature(feedback);
              }}
              className="flex-shrink-0"
            >
              <Icon.Link size={14} />
            </Button>
          )}
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{feedback.description}</p>
        
        <div className="flex flex-wrap gap-2">
          {/* Unread badge */}
          {feedback.admin_response && !feedback.user_read_response && (
            <Badge className="bg-blue-500">Mới phản hồi</Badge>
          )}
          
          <Badge className={categoryColors[feedback.category]}>
            {FeedbackService.CATEGORY_LABELS[feedback.category]}
          </Badge>
          <Badge variant="outline">{feedback.user_name || feedback.created_by?.split('@')[0]}</Badge>
          
          {feedback.ai_sentiment && (
            <Badge variant="outline">
              {feedback.ai_sentiment === 'positive' ? '😊' :
               feedback.ai_sentiment === 'negative' ? '😠' : '😐'}
            </Badge>
          )}
          
          {feedback.votes > 0 && (
            <Badge variant="outline">
              <Icon.ThumbsUp size={10} className="mr-1" />
              {feedback.votes}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AdminFeedbackContent() {
  const [activeTab, setActiveTab] = useState('workflow');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [linkFeedbackToFeature, setLinkFeedbackToFeature] = useState(null);
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });

  const { data: feedbacks = [], isLoading, error } = useFeedbacks(filters);
  const { data: stats } = useFeedbackStats();

  if (error) {
    return (
      <Card className="m-6">
        <CardContent className="py-12 text-center">
          <Icon.AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-bold text-red-600 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-gray-600">{error.message}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            <Icon.RefreshCw size={16} className="mr-2" />
            Tải lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Icon.MessageCircle size={36} className="text-[#7CB342]" />
            Quản Lý Feedback
          </h1>
          <p className="text-gray-500 mt-1">Hệ thống feedback thông minh với AI</p>
        </div>
        <FeedbackExportTools />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflow">
            <Icon.Filter size={16} className="mr-2" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Icon.Sparkles size={16} className="mr-2" />
            AI Triage
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Icon.BarChart size={16} className="mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="list">
            <Icon.List size={16} className="mr-2" />
            Tất Cả
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="mt-6">
          <FeedbackWorkflowManager />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <FeedbackAITriage />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <FeedbackAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Icon.MessageCircle size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-xs text-gray-500">Tổng</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Icon.Clock size={24} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.byStatus?.new || 0}</p>
                      <p className="text-xs text-gray-500">Chờ xử lý</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Icon.CheckCircle size={24} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.byStatus?.resolved || 0}</p>
                      <p className="text-xs text-gray-500">Đã giải quyết</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Icon.TrendingUp size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.recentCount || 0}</p>
                      <p className="text-xs text-gray-500">7 ngày qua</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Icon.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <Select value={filters.status || 'all'} onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? '' : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {Object.entries(FeedbackService.STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.category || 'all'} onValueChange={(v) => setFilters({ ...filters, category: v === 'all' ? '' : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {Object.entries(FeedbackService.CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {feedbacks.map(f => (
              <FeedbackCard 
                key={f.id} 
                feedback={f} 
                onClick={() => setSelectedFeedback(f)}
                onLinkToFeature={setLinkFeedbackToFeature}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedFeedback && <FeedbackThreadView feedbackId={selectedFeedback.id} />}
        </DialogContent>
      </Dialog>

      <FeedbackLinkToFeature
        feedback={linkFeedbackToFeature}
        isOpen={!!linkFeedbackToFeature}
        onClose={() => setLinkFeedbackToFeature(null)}
      />
    </div>
  );
}

export default function AdminFeedback() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminFeedbackContent />
      </AdminLayout>
    </AdminGuard>
  );
}