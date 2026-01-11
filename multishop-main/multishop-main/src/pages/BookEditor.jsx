/**
 * BookEditor Page
 * Create and edit book with chapters
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';

import {
  useBookEditor,
  useBookCollaboration,
  useChapterVersions,
  ChapterCard,
  ContributorsList,
  InviteContributorModal,
  VersionHistoryPanel,
  DiffViewer,
  BOOK_CATEGORIES,
  BOOK_CATEGORY_LABELS,
  BOOK_STATUS,
  BOOK_STATUS_LABELS,
  BOOK_VISIBILITY,
  BOOK_VISIBILITY_LABELS
} from '@/components/community-book';
import { useToast } from '@/components/NotificationToast';

// Book Settings Form Component
function BookSettingsForm({ book, onUpdate, isSaving }) {
  const [form, setForm] = useState({
    title: book?.title || '',
    description: book?.description || '',
    category: book?.category || 'knowledge',
    visibility: book?.visibility || 'public',
    allow_contributions: book?.allow_contributions ?? true,
    allow_fork: book?.allow_fork ?? true,
    tags: book?.tags || []
  });
  const [tagInput, setTagInput] = useState('');
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      addToast('Tiêu đề không được để trống', 'error');
      return;
    }
    await onUpdate(form);
    addToast('Đã cập nhật cài đặt sách', 'success');
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Cài Đặt Sách</h2>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề sách *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Nhập tiêu đề sách..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Mô tả ngắn về nội dung sách..."
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{form.description.length}/500 ký tự</p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thể loại
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] bg-white"
          >
            {Object.entries(BOOK_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Độ hiển thị
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'public', label: 'Công khai', icon: 'Globe', desc: 'Ai cũng xem được' },
              { value: 'contributors', label: 'Cộng tác viên', icon: 'Users', desc: 'Chỉ thành viên' },
              { value: 'private', label: 'Riêng tư', icon: 'Lock', desc: 'Chỉ mình bạn' }
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, visibility: opt.value }))}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.visibility === opt.value
                    ? 'border-[#7CB342] bg-[#7CB342]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {Icon[opt.icon] && React.createElement(Icon[opt.icon], { 
                    size: 16, 
                    className: form.visibility === opt.value ? 'text-[#7CB342]' : 'text-gray-400' 
                  })}
                  <span className={`text-sm font-medium ${
                    form.visibility === opt.value ? 'text-[#7CB342]' : 'text-gray-700'
                  }`}>{opt.label}</span>
                </div>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (tối đa 10)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.tags.map(tag => (
              <span 
                key={tag} 
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#7CB342]/10 text-[#7CB342] rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-500"
                >
                  <Icon.X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value.replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Nhập tag..."
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!tagInput.trim() || form.tags.length >= 10}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Thêm
            </button>
          </div>
        </div>

        {/* Permissions */}
        <div className="space-y-3 pt-2">
          <p className="text-sm font-medium text-gray-700">Quyền hạn</p>
          
          <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={form.allow_contributions}
              onChange={(e) => setForm(prev => ({ ...prev, allow_contributions: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342] mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Cho phép đóng góp</span>
              <p className="text-xs text-gray-500 mt-0.5">Người khác có thể đề xuất thêm chương vào sách</p>
            </div>
          </label>
          
          <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={form.allow_fork}
              onChange={(e) => setForm(prev => ({ ...prev, allow_fork: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342] mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Cho phép Fork</span>
              <p className="text-xs text-gray-500 mt-0.5">Người khác có thể sao chép sách để tạo phiên bản riêng</p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSaving || !form.title.trim()}
            className="w-full py-3 bg-gradient-to-r from-[#7CB342] to-[#558B2F] text-white rounded-xl font-medium disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Icon.Spinner size={20} />
                Đang lưu...
              </>
            ) : (
              <>
                <Icon.Save size={20} />
                Lưu Cài Đặt
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="text-center text-xs text-gray-400 pt-2">
          <p>Trạng thái: {BOOK_STATUS_LABELS[book?.status]} • Tạo bởi: {book?.author_name}</p>
        </div>
      </form>
    </div>
  );
}

export default function BookEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('id');
  const { showConfirm } = useConfirmDialog();
  
  const [activeTab, setActiveTab] = useState('chapters'); // chapters | team | import | settings
  const [chapterForm, setChapterForm] = useState({ title: '', content: '', originalContent: '' });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionChapterId, setVersionChapterId] = useState(null);
  const [diffViewerData, setDiffViewerData] = useState(null);

  // Get current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    }
  });

  const {
    book,
    chapters,
    userPosts,
    editingChapterId,
    isCreatingChapter,
    isLoading,
    isSaving,
    isSavingChapter,
    isDeletingChapter,
    isImporting,
    setEditingChapterId,
    setIsCreatingChapter,
    handleUpdateBook,
    handleCreateChapter,
    handleUpdateChapter,
    handleDeleteChapter,
    handleImportPost,
    handlePublishChapter
  } = useBookEditor(bookId, currentUser);

  // Collaboration hook
  const {
    contributors,
    pendingInvites,
    currentUserRole,
    canInvite,
    invitableRoles,
    isInviting,
    handleInvite,
    handleRemoveContributor,
    handleChangeRole
  } = useBookCollaboration(bookId, currentUser);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      base44.auth.redirectToLogin(window.location.href);
    }
  }, [currentUser, isLoadingUser]);

  // Redirect if no book ID
  useEffect(() => {
    if (!bookId) {
      navigate(createPageUrl('BookLibrary'));
    }
  }, [bookId, navigate]);

  // Load chapter for editing
  useEffect(() => {
    if (editingChapterId) {
      const chapter = chapters.find(c => c.id === editingChapterId);
      if (chapter) {
        setChapterForm({ 
          title: chapter.title, 
          content: chapter.content,
          originalContent: chapter.content // For versioning
        });
      }
    } else {
      setChapterForm({ title: '', content: '', originalContent: '' });
    }
  }, [editingChapterId, chapters]);

  const handleChapterSubmit = async () => {
    if (!chapterForm.title.trim() || !chapterForm.content.trim()) return;

    if (editingChapterId) {
      await handleUpdateChapter(editingChapterId, chapterForm, chapterForm.originalContent);
    } else {
      await handleCreateChapter(chapterForm);
    }
    
    setChapterForm({ title: '', content: '', originalContent: '' });
    setIsCreatingChapter(false);
  };

  const confirmDeleteChapter = async (chapterId) => {
    const confirmed = await showConfirm({
      title: 'Xóa Chương',
      message: 'Bạn có chắc chắn muốn xóa chương này? Hành động không thể hoàn tác.',
      type: 'danger',
      confirmText: 'Xóa'
    });
    
    if (confirmed) {
      await handleDeleteChapter(chapterId);
    }
  };

  if (isLoading || isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F9F3] to-white pt-28 flex items-center justify-center">
        <div className="text-center">
          <Icon.Spinner size={48} className="text-[#7CB342] mx-auto" />
          <p className="mt-4 text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F9F3] to-white pt-28 flex items-center justify-center">
        <div className="text-center">
          <Icon.AlertCircle size={48} className="text-red-500 mx-auto" />
          <h2 className="text-xl font-bold mt-4">Không tìm thấy sách</h2>
          <button
            onClick={() => navigate(createPageUrl('BookLibrary'))}
            className="mt-4 px-6 py-2 bg-[#7CB342] text-white rounded-xl"
          >
            Về Thư Viện
          </button>
        </div>
      </div>
    );
  }

  // Check ownership or editor role
  const isOwner = book.author_email === currentUser?.email;
  const isEditor = currentUserRole === 'owner' || currentUserRole === 'editor';
  
  if (!isOwner && !isEditor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F9F3] to-white pt-28 flex items-center justify-center">
        <div className="text-center">
          <Icon.Ban size={48} className="text-red-500 mx-auto" />
          <h2 className="text-xl font-bold mt-4">Không có quyền truy cập</h2>
          <p className="text-gray-500 mt-2">Bạn không phải tác giả hoặc biên tập viên của sách này.</p>
          <button
            onClick={() => navigate(createPageUrl('BookLibrary'))}
            className="mt-4 px-6 py-2 bg-[#7CB342] text-white rounded-xl"
          >
            Về Thư Viện
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9F3] to-white pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(createPageUrl('BookDetail') + `?id=${book.id}`)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Icon.ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
              <p className="text-sm text-gray-500">
                {BOOK_STATUS_LABELS[book.status]} • {chapters.length} chương
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(createPageUrl('BookDetail') + `?id=${book.id}`)}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#558B2F] transition-colors flex items-center gap-2"
          >
            <Icon.Eye size={18} />
            Xem Sách
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {[
            { key: 'chapters', label: 'Chương', icon: 'List' },
            { key: 'team', label: `Cộng Tác (${contributors.length + 1})`, icon: 'Users' },
            { key: 'import', label: 'Import', icon: 'Download' },
            { key: 'settings', label: 'Cài Đặt', icon: 'Settings' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 border-b-2 -mb-[2px] ${
                activeTab === tab.key
                  ? 'text-[#7CB342] border-[#7CB342]'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {Icon[tab.icon] && React.createElement(Icon[tab.icon], { size: 18 })}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chapters Tab */}
        {activeTab === 'chapters' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chapters List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Danh Sách Chương</h2>
                <button
                  onClick={() => {
                    setEditingChapterId(null);
                    setIsCreatingChapter(true);
                    setChapterForm({ title: '', content: '' });
                  }}
                  className="px-3 py-1.5 bg-[#7CB342] text-white rounded-lg text-sm font-medium hover:bg-[#558B2F] transition-colors flex items-center gap-1"
                >
                  <Icon.Plus size={16} />
                  Thêm Chương
                </button>
              </div>

              {chapters.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <Icon.FileText size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Chưa có chương nào</p>
                  <button
                    onClick={() => setIsCreatingChapter(true)}
                    className="px-4 py-2 bg-[#7CB342] text-white rounded-xl text-sm"
                  >
                    Tạo Chương Đầu Tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {chapters.map((chapter, index) => (
                    <ChapterCard
                      key={chapter.id}
                      chapter={chapter}
                      index={index}
                      isActive={editingChapterId === chapter.id}
                      showStatus
                      showActions
                      onView={() => setEditingChapterId(chapter.id)}
                      onEdit={() => setEditingChapterId(chapter.id)}
                      onDelete={() => confirmDeleteChapter(chapter.id)}
                      onPublish={handlePublishChapter}
                      onVersionHistory={() => {
                        setVersionChapterId(chapter.id);
                        setShowVersionHistory(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Chapter Editor */}
            <div>
              <AnimatePresence mode="wait">
                {(isCreatingChapter || editingChapterId) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-28"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {editingChapterId ? 'Chỉnh Sửa Chương' : 'Tạo Chương Mới'}
                      </h3>
                      <button
                        onClick={() => {
                          setEditingChapterId(null);
                          setIsCreatingChapter(false);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        <Icon.X size={20} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tiêu đề chương *
                        </label>
                        <input
                          type="text"
                          value={chapterForm.title}
                          onChange={(e) => setChapterForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Nhập tiêu đề..."
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nội dung (Markdown) *
                        </label>
                        <textarea
                          value={chapterForm.content}
                          onChange={(e) => setChapterForm(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Viết nội dung chương... Hỗ trợ Markdown"
                          rows={15}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] font-mono text-sm resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {chapterForm.content.length} ký tự
                        </p>
                      </div>

                      <button
                        onClick={handleChapterSubmit}
                        disabled={!chapterForm.title.trim() || !chapterForm.content.trim() || isSavingChapter}
                        className="w-full py-3 bg-gradient-to-r from-[#7CB342] to-[#558B2F] text-white rounded-xl font-medium disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        {isSavingChapter ? (
                          <>
                            <Icon.Spinner size={20} />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Icon.Save size={20} />
                            {editingChapterId ? 'Cập Nhật' : 'Tạo Chương'}
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isCreatingChapter && !editingChapterId && (
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <Icon.Edit size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chọn một chương để chỉnh sửa hoặc tạo chương mới</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Team/Collaboration Tab */}
        {activeTab === 'team' && (
          <div className="max-w-2xl">
            <ContributorsList
              contributors={contributors}
              pendingInvites={pendingInvites}
              bookOwner={{
                email: book.author_email,
                name: book.author_name,
                avatar: book.author_avatar
              }}
              currentUserRole={currentUserRole}
              canManage={canInvite}
              onChangeRole={handleChangeRole}
              onRemove={handleRemoveContributor}
              onInvite={() => setShowInviteModal(true)}
            />

            {book.allow_contributions && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700">
                  💡 <strong>Cho phép đóng góp:</strong> Mọi người có thể đề xuất thêm nội dung vào sách này.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Import từ Bài Viết Cộng Đồng</h2>
            <p className="text-gray-600 mb-6">
              Chọn bài viết của bạn để import thành chương trong sách.
            </p>

            {userPosts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <Icon.FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Bạn chưa có bài viết nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userPosts.map(post => {
                  const postData = post.data || post;
                  const isImported = chapters.some(c => c.source_post_id === post.id);
                  
                  return (
                    <div
                      key={post.id}
                      className={`bg-white rounded-xl border p-4 ${
                        isImported 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-100 hover:border-[#7CB342]/30'
                      }`}
                    >
                      <p className="text-sm text-gray-900 line-clamp-3 mb-3">
                        {postData.content?.substring(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(post.created_date).toLocaleDateString('vi-VN')}
                        </span>
                        {isImported ? (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Icon.CheckCircle size={14} />
                            Đã import
                          </span>
                        ) : (
                          <button
                            onClick={() => handleImportPost(post)}
                            disabled={isImporting}
                            className="px-3 py-1 bg-[#7CB342] text-white rounded-lg text-xs font-medium hover:bg-[#558B2F] disabled:opacity-50"
                          >
                            {isImporting ? 'Đang import...' : 'Import'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <BookSettingsForm
            book={book}
            onUpdate={handleUpdateBook}
            isSaving={isSaving}
          />
        )}
      </div>

      {/* Invite Modal */}
      <InviteContributorModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        invitableRoles={invitableRoles}
        isLoading={isInviting}
      />

      {/* Version History Panel */}
      <AnimatePresence>
        {showVersionHistory && versionChapterId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowVersionHistory(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="max-w-2xl w-full"
            >
              <VersionHistoryPanel
                chapterId={versionChapterId}
                currentUser={currentUser}
                onViewVersion={(versionData) => {
                  if (versionData.comparison) {
                    setDiffViewerData(versionData);
                  }
                }}
                onClose={() => setShowVersionHistory(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diff Viewer */}
      <AnimatePresence>
        {diffViewerData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setDiffViewerData(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="max-w-4xl w-full"
            >
              <DiffViewer
                version1={diffViewerData.v1}
                version2={diffViewerData.v2}
                onClose={() => setDiffViewerData(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}