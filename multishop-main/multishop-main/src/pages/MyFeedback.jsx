import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeedbackQuickCreateModal from '@/components/feedback/FeedbackQuickCreateModal';
import FeedbackUserAnalytics from '@/components/feedback/FeedbackUserAnalytics';
import FeedbackRealTimeNotification from '@/components/feedback/FeedbackRealTimeNotification';
import FeedbackService from '@/components/services/FeedbackService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/NotificationToast';

function FeedbackCard({ feedback, onClick }) {
  const categoryColors = {
    bug: 'bg-red-100 text-red-700',
    feature_request: 'bg-blue-100 text-blue-700',
    improvement: 'bg-green-100 text-green-700',
    ui_ux: 'bg-purple-100 text-purple-700',
    performance: 'bg-orange-100 text-orange-700',
    other: 'bg-gray-100 text-gray-700'
  };

  const statusColors = {
    new: 'bg-amber-100 text-amber-700',
    reviewing: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    resolved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    duplicate: 'bg-gray-100 text-gray-700'
  };

  const emojiMap = {
    1: '😠',
    2: '😐',
    3: '😊',
    4: '😍'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg">{feedback.title}</h3>
              {feedback.rating && (
                <span className="text-2xl">{emojiMap[feedback.rating]}</span>
              )}
              {feedback.admin_response && !feedback.user_read_response && (
                <Badge className="bg-green-500 text-white animate-pulse">
                  <Icon.Bell size={12} className="mr-1" />
                  Có phản hồi mới
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{feedback.description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={categoryColors[feedback.category]}>
                {FeedbackService.CATEGORY_LABELS[feedback.category]}
              </Badge>
              <Badge className={statusColors[feedback.status]}>
                {FeedbackService.STATUS_LABELS[feedback.status]}
              </Badge>
              {feedback.ai_sentiment && (
                <Badge variant="outline">
                  {feedback.ai_sentiment === 'positive' ? '😊 Tích cực' :
                   feedback.ai_sentiment === 'negative' ? '😠 Tiêu cực' : '😐 Trung lập'}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
          <span className="flex items-center gap-1">
            <Icon.Calendar size={14} />
            {new Date(feedback.created_date).toLocaleDateString('vi-VN')}
          </span>
          {feedback.reviewed_date && (
            <span className="flex items-center gap-1 text-green-600">
              <Icon.CheckCircle size={14} />
              {new Date(feedback.reviewed_date).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FeedbackDetailModalClient({ feedback, isOpen, onClose, currentUser, onRefresh }) {
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [quotedComment, setQuotedComment] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Get user's profile for avatar
  const { data: userProfile } = useQuery({
    queryKey: ['my-profile-feedback', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return null;
      const profiles = await base44.entities.UserProfile.list('-created_date', 500);
      return profiles.find(p => p.user_email === currentUser.email);
    },
    enabled: !!currentUser?.email
  });

  // Load comments - filter chỉ hiện non-internal cho user
  const { data: comments = [] } = useQuery({
    queryKey: ['feedback-comments-client', feedback?.id],
    queryFn: async () => {
      if (!feedback?.id) return [];
      const result = await base44.entities.FeedbackComment.filter({ feedback_id: feedback.id }, 'created_date');
      // Chỉ hiện comment không internal
      return (result || []).filter(c => !c.is_internal);
    },
    enabled: !!feedback?.id && isOpen,
    refetchInterval: 10000 // Refetch mỗi 10s để realtime
  });

  // Mark feedback as read when opening
  React.useEffect(() => {
    const markAsRead = async () => {
      if (feedback?.id && !feedback.user_read_response && feedback.admin_response) {
        try {
          await base44.entities.Feedback.update(feedback.id, { user_read_response: true });
          onRefresh?.();
        } catch (e) {
          // Silent fail
        }
      }
    };
    if (isOpen) markAsRead();
  }, [isOpen, feedback?.id]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    try {
      await base44.entities.FeedbackComment.create({
        feedback_id: feedback.id,
        author_email: currentUser.email,
        author_name: currentUser.full_name,
        author_avatar: userProfile?.avatar_url,
        content: comment,
        images: images,
        quoted_comment_id: quotedComment?.id,
        quoted_content: quotedComment?.content,
        quoted_author_name: quotedComment?.author_name,
        is_admin: false,
        is_internal: false
      });
      
      queryClient.invalidateQueries({ queryKey: ['feedback-comments-client'] });
      setComment('');
      setImages([]);
      setQuotedComment(null);
      addToast('Đã gửi góp ý', 'success');
    } catch (error) {
      addToast('Lỗi khi gửi', 'error');
    }
  };

  if (!feedback) return null;

  // Import dynamic
  const FeedbackImageUpload = React.lazy(() => import('@/components/feedback/FeedbackImageUpload'));
  const ImageLightbox = React.lazy(() => import('@/components/feedback/ImageLightbox'));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {feedback.rating && <span className="text-3xl">{['', '😠', '😐', '😊', '😍'][feedback.rating]}</span>}
            {feedback.title}
          </DialogTitle>
        </DialogHeader>

        {/* Lightbox */}
        <React.Suspense fallback={null}>
          {lightboxImage && (
            <ImageLightbox
              imageUrl={lightboxImage}
              isOpen={!!lightboxImage}
              onClose={() => setLightboxImage(null)}
            />
          )}
        </React.Suspense>

        <div className="space-y-6 mt-4">
          <div className="flex flex-wrap gap-2">
            <Badge>{FeedbackService.STATUS_LABELS[feedback.status]}</Badge>
            <Badge>{FeedbackService.CATEGORY_LABELS[feedback.category]}</Badge>
            <Badge variant="outline">{new Date(feedback.created_date).toLocaleDateString('vi-VN')}</Badge>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">
            {feedback.description}
          </div>

          {feedback.screenshot_url && (
            <button type="button" onClick={() => setLightboxImage(feedback.screenshot_url)}>
              <img src={feedback.screenshot_url} className="max-w-full max-h-[200px] object-contain rounded-xl border cursor-zoom-in hover:border-[#7CB342]" alt="Screenshot" />
            </button>
          )}

          {/* Admin Response Section */}
          {feedback.admin_response && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon.Shield size={20} className="text-green-600" />
                <p className="font-bold text-green-700">Phản hồi từ Admin</p>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{feedback.admin_response}</p>
              {feedback.reviewed_date && (
                <p className="text-xs text-green-600 mt-2">
                  {new Date(feedback.reviewed_date).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          )}

          {/* Comments Thread */}
          <div>
            <p className="text-sm font-bold mb-4 flex items-center gap-2">
              <Icon.MessageCircle size={18} />
              Trao đổi ({comments.length})
            </p>
            
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Chưa có trao đổi nào</p>
            ) : (
              <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
                {comments.map(c => (
                  <div key={c.id} className={`p-3 rounded-xl ${
                    c.author_email === currentUser.email ? 'bg-blue-50 border border-blue-200' : 
                    c.is_admin ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold overflow-hidden ${
                        c.is_admin ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-blue-400 to-indigo-600'
                      }`}>
                        {c.author_avatar ? (
                          <img src={c.author_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          c.author_name?.charAt(0)?.toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{c.author_name}</span>
                          {c.is_admin && <Badge className="text-[10px] bg-green-500 px-1.5 py-0">Admin</Badge>}
                          {c.author_email === currentUser.email && !c.is_admin && <Badge className="text-[10px] bg-blue-500 px-1.5 py-0">Bạn</Badge>}
                        </div>
                        
                        {/* Quoted */}
                        {c.quoted_content && (
                          <div className="mt-1 mb-2 pl-2 border-l-2 border-gray-300 bg-white/50 rounded-r py-1 px-2">
                            <p className="text-xs text-gray-500">{c.quoted_author_name}</p>
                            <p className="text-xs text-gray-600 line-clamp-2">{c.quoted_content}</p>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                        
                        {/* Images */}
                        {c.images && c.images.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {c.images.map((img, idx) => (
                              <button key={idx} type="button" onClick={() => setLightboxImage(img)}>
                                <img src={img} alt="" className="w-16 h-16 object-cover rounded border hover:border-[#7CB342] cursor-zoom-in" />
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 mt-2">
                          <p className="text-xs text-gray-500">
                            {new Date(c.created_date).toLocaleString('vi-VN')}
                          </p>
                          <button
                            type="button"
                            onClick={() => setQuotedComment(c)}
                            className="text-xs text-gray-400 hover:text-[#7CB342] flex items-center gap-1"
                          >
                            <Icon.CornerDownLeft size={12} />
                            Trả lời
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Form */}
            <div className="border-2 border-gray-200 rounded-xl p-3 space-y-3">
              {/* Quoted Preview */}
              {quotedComment && (
                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg border-l-4 border-[#7CB342]">
                  <Icon.CornerDownLeft size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600">{quotedComment.author_name}</p>
                    <p className="text-xs text-gray-700 line-clamp-2">{quotedComment.content}</p>
                  </div>
                  <button type="button" onClick={() => setQuotedComment(null)} className="p-1 hover:bg-gray-200 rounded">
                    <Icon.X size={12} className="text-gray-400" />
                  </button>
                </div>
              )}

              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Thêm góp ý hoặc trả lời..."
                rows={3}
              />

              {/* Image Upload */}
              <React.Suspense fallback={null}>
                <FeedbackImageUpload
                  images={images}
                  onImagesChange={setImages}
                  maxFiles={5}
                />
              </React.Suspense>

              <div className="flex justify-end">
                <Button onClick={handleAddComment} disabled={!comment.trim()} className="bg-[#7CB342] hover:bg-[#5a8f31]">
                  <Icon.Send size={16} className="mr-2" />
                  Gửi
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MyFeedback() {
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('list');

  const { data: user } = useQuery({
    queryKey: ['current-user-feedback'],
    queryFn: () => base44.auth.me()
  });

  const { data: myFeedback = [], isLoading, refetch } = useQuery({
    queryKey: ['my-feedbacks', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      // Query by user_email hoặc created_by (fallback)
      const allFeedback = await base44.entities.Feedback.list('-created_date', 500);
      return allFeedback.filter(f => f.user_email === user.email || f.created_by === user.email);
    },
    enabled: !!user?.email,
    refetchInterval: 30000 // Auto refetch mỗi 30s để cập nhật realtime
  });

  // Count unread responses
  const unreadResponses = myFeedback.filter(f => f.admin_response && !f.user_read_response).length;

  const stats = {
    total: myFeedback.length,
    pending: myFeedback.filter(f => ['new', 'reviewing'].includes(f.status)).length,
    resolved: myFeedback.filter(f => f.status === 'resolved').length,
    withResponse: myFeedback.filter(f => f.admin_response).length,
    unread: unreadResponses
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <FeedbackRealTimeNotification />
      
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Icon.MessageCircle size={32} className="text-[#7CB342]" />
            Feedback & Góp Ý
          </h1>
          <Button 
            onClick={() => setShowQuickCreate(true)}
            className="bg-[#7CB342] hover:bg-[#5a8f31]"
          >
            <Icon.Plus className="mr-2" />
            Gửi Feedback
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="list">
              <Icon.List size={16} className="mr-2" />
              Danh Sách
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Icon.BarChart size={16} className="mr-2" />
              Thống Kê
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Icon.MessageCircle size={32} className="mx-auto mb-2 text-blue-600" />
                    <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-sm text-gray-600">Tổng</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Icon.Clock size={32} className="mx-auto mb-2 text-amber-600" />
                    <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                    <p className="text-sm text-gray-600">Đang xử lý</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Icon.CheckCircle size={32} className="mx-auto mb-2 text-green-600" />
                    <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                    <p className="text-sm text-gray-600">Đã giải quyết</p>
                  </div>
                </CardContent>
              </Card>
              <Card className={stats.unread > 0 ? 'ring-2 ring-green-400 ring-offset-2' : ''}>
                <CardContent className="pt-6">
                  <div className="text-center relative">
                    <Icon.MessageCircle size={32} className="mx-auto mb-2 text-purple-600" />
                    <p className="text-3xl font-bold text-purple-600">{stats.withResponse}</p>
                    <p className="text-sm text-gray-600">Đã phản hồi</p>
                    {stats.unread > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-green-500 text-white animate-pulse">
                        {stats.unread} mới
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <Icon.Spinner size={48} className="mx-auto mb-4" />
              </div>
            ) : myFeedback.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon.MessageCircle size={64} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Chưa có feedback nào</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myFeedback.map(f => (
                  <FeedbackCard key={f.id} feedback={f} onClick={() => setSelectedFeedback(f)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <FeedbackUserAnalytics />
          </TabsContent>
        </Tabs>

        <FeedbackQuickCreateModal isOpen={showQuickCreate} onClose={() => setShowQuickCreate(false)} />
        
        {selectedFeedback && user && (
          <FeedbackDetailModalClient 
            feedback={selectedFeedback} 
            isOpen={!!selectedFeedback} 
            onClose={() => setSelectedFeedback(null)} 
            currentUser={user}
            onRefresh={refetch}
          />
        )}
      </div>
    </div>
  );
}