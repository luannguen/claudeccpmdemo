import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/NotificationToast';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import FeedbackThreadView from '@/components/feedback/FeedbackThreadView';

const statusConfig = {
  new: { label: 'Mới', color: 'bg-blue-100 text-blue-700', icon: 'Bell' },
  reviewing: { label: 'Đang xem', color: 'bg-purple-100 text-purple-700', icon: 'Eye' },
  in_progress: { label: 'Đang xử lý', color: 'bg-amber-100 text-amber-700', icon: 'Loader2' },
  resolved: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-700', icon: 'CheckCircle' },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: 'XCircle' },
  duplicate: { label: 'Trùng lặp', color: 'bg-gray-100 text-gray-700', icon: 'Copy' }
};

export default function FeedbackWorkflowManager() {
  const [activeStatus, setActiveStatus] = useState('new');
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewDetailId, setViewDetailId] = useState(null);
  const [quickReplyId, setQuickReplyId] = useState(null);
  const [quickReplyText, setQuickReplyText] = useState('');
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { dialog, showConfirm, handleConfirm, handleCancel } = useConfirmDialog();

  // Fetch comments count for each feedback
  const { data: commentsCountMap = {} } = useQuery({
    queryKey: ['feedback-comments-count'],
    queryFn: async () => {
      const comments = await base44.entities.FeedbackComment.list('-created_date', 1000);
      const countMap = {};
      comments.forEach(c => {
        if (!c.is_internal) {
          countMap[c.feedback_id] = (countMap[c.feedback_id] || 0) + 1;
        }
      });
      return countMap;
    },
    staleTime: 30 * 1000
  });

  const { data: feedbackByStatus = [] } = useQuery({
    queryKey: ['feedback-workflow', activeStatus],
    queryFn: async () => {
      const feedback = await base44.entities.Feedback.list('-created_date', 500);
      return feedback.filter(f => f.status === activeStatus);
    },
    staleTime: 30 * 1000
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, note }) => {
      const user = await base44.auth.me();
      return await base44.entities.Feedback.update(id, {
        status,
        admin_note: note,
        reviewed_by: user.email,
        reviewed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-workflow'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-list'] });
      addToast('Đã cập nhật trạng thái', 'success');
    }
  });

  const bulkUpdateStatus = async (status) => {
    const confirmed = await showConfirm({
      title: 'Xác nhận thay đổi hàng loạt',
      message: `Cập nhật ${selectedItems.length} feedback sang trạng thái "${statusConfig[status].label}"?`,
      type: 'warning',
      confirmText: 'Cập nhật'
    });

    if (confirmed) {
      for (const id of selectedItems) {
        await updateStatusMutation.mutateAsync({ id, status, note: 'Bulk update' });
      }
      setSelectedItems([]);
      addToast(`Đã cập nhật ${selectedItems.length} feedback`, 'success');
    }
  };

  // Quick reply mutation
  const quickReplyMutation = useMutation({
    mutationFn: async ({ feedbackId, content }) => {
      const user = await base44.auth.me();
      
      // Create comment
      await base44.entities.FeedbackComment.create({
        feedback_id: feedbackId,
        author_email: user.email,
        author_name: user.full_name,
        content,
        is_admin: true,
        is_internal: false
      });
      
      // Update feedback status
      await base44.entities.Feedback.update(feedbackId, {
        status: 'reviewing',
        admin_response: content,
        user_read_response: false,
        reviewed_by: user.email,
        reviewed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-workflow'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-comments-count'] });
      setQuickReplyId(null);
      setQuickReplyText('');
      addToast('Đã gửi phản hồi', 'success');
    }
  });

  const toggleSelect = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === feedbackByStatus.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(feedbackByStatus.map(f => f.id));
    }
  };

  return (
    <>
      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
      />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon.Filter size={24} className="text-[#7CB342]" />
              Quản Lý Workflow
            </CardTitle>
          
          {selectedItems.length > 0 && (
            <div className="flex gap-2">
              <Badge variant="outline">{selectedItems.length} đã chọn</Badge>
              <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('in_progress')}>
                Đang xử lý
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('resolved')}>
                Đã giải quyết
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedItems([])}>
                Bỏ chọn
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeStatus} onValueChange={setActiveStatus}>
          <TabsList className="grid w-full grid-cols-6">
            {Object.entries(statusConfig).map(([key, config]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {config.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeStatus} className="mt-6">
            {feedbackByStatus.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Icon.Inbox size={48} className="mx-auto mb-3 opacity-30" />
                <p>Không có feedback nào ở trạng thái này</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <Button size="sm" variant="outline" onClick={selectAll}>
                    {selectedItems.length === feedbackByStatus.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </Button>
                  <span className="text-sm text-gray-500">
                    {feedbackByStatus.length} feedback
                  </span>
                </div>

                <div className="space-y-3">
                  {feedbackByStatus.map((feedback) => (
                    <div
                      key={feedback.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedItems.includes(feedback.id)
                          ? 'border-[#7CB342] bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1 cursor-pointer" onClick={() => toggleSelect(feedback.id)}>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedItems.includes(feedback.id)
                              ? 'bg-[#7CB342] border-[#7CB342]'
                              : 'border-gray-300'
                          }`}>
                            {selectedItems.includes(feedback.id) && (
                              <Icon.Check size={14} className="text-white" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{feedback.title}</h4>
                              {/* Unread badge */}
                              {feedback.admin_response && !feedback.user_read_response && (
                                <Badge className="text-xs bg-blue-500">Chờ user đọc</Badge>
                              )}
                              {/* Comments count */}
                              {commentsCountMap[feedback.id] > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <Icon.MessageCircle size={10} className="mr-1" />
                                  {commentsCountMap[feedback.id]}
                                </Badge>
                              )}
                              {/* Votes */}
                              {feedback.votes > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <Icon.ThumbsUp size={10} className="mr-1" />
                                  {feedback.votes}
                                </Badge>
                              )}
                            </div>
                            <Badge className={statusConfig[feedback.priority]?.color || 'bg-gray-100'}>
                              {feedback.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {feedback.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{feedback.user_name || feedback.created_by?.split('@')[0]}</span>
                              <span>•</span>
                              <span>{new Date(feedback.created_date).toLocaleDateString('vi-VN')}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {feedback.category}
                              </Badge>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewDetailId(feedback.id)}
                                className="h-7 text-xs"
                              >
                                <Icon.Eye size={12} className="mr-1" />
                                Chi tiết
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setQuickReplyId(feedback.id);
                                  setQuickReplyText('');
                                }}
                                className="h-7 text-xs"
                              >
                                <Icon.Send size={12} className="mr-1" />
                                Phản hồi
                              </Button>
                            </div>
                          </div>
                          
                          {/* Quick Reply Inline Form */}
                          {quickReplyId === feedback.id && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                              <Textarea
                                value={quickReplyText}
                                onChange={(e) => setQuickReplyText(e.target.value)}
                                placeholder="Viết phản hồi nhanh..."
                                rows={2}
                                className="mb-2"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setQuickReplyId(null)}
                                >
                                  Hủy
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-[#7CB342] hover:bg-[#5a8f31]"
                                  onClick={() => quickReplyMutation.mutate({
                                    feedbackId: feedback.id,
                                    content: quickReplyText
                                  })}
                                  disabled={!quickReplyText.trim() || quickReplyMutation.isPending}
                                >
                                  {quickReplyMutation.isPending ? (
                                    <Icon.Spinner size={14} />
                                  ) : (
                                    <>
                                      <Icon.Send size={12} className="mr-1" />
                                      Gửi
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
      {/* View Detail Modal */}
      <Dialog open={!!viewDetailId} onOpenChange={() => setViewDetailId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết Feedback</DialogTitle>
          </DialogHeader>
          {viewDetailId && <FeedbackThreadView feedbackId={viewDetailId} />}
        </DialogContent>
      </Dialog>
    </>
  );
}