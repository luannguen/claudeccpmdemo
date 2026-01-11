/**
 * AdminCommunityBooks Page
 * Admin dashboard để quản lý toàn bộ Community Books
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Icon } from '@/components/ui/AnimatedIcon';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/components/NotificationToast';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';
import AdminLayout from '@/components/AdminLayout';
import {
  BOOK_STATUS,
  BOOK_STATUS_LABELS,
  BOOK_CATEGORY_LABELS,
  getBookStatusBadge
} from '@/components/community-book';

const TABS = [
  { key: 'all', label: 'Tất cả', icon: 'List' },
  { key: 'published', label: 'Đã xuất bản', icon: 'CheckCircle' },
  { key: 'draft', label: 'Bản nháp', icon: 'Edit' },
  { key: 'featured', label: 'Nổi bật', icon: 'Star' },
  { key: 'reported', label: 'Báo cáo', icon: 'AlertTriangle' }
];

export default function AdminCommunityBooks() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { showConfirm } = useConfirmDialog();
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);

  // Fetch books
  const { data: books = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-community-books'],
    queryFn: async () => {
      return await base44.entities.CommunityBook.list('-created_date', 500);
    }
  });

  // Fetch chapters count per book
  const { data: chaptersMap = {} } = useQuery({
    queryKey: ['admin-chapters-count'],
    queryFn: async () => {
      const chapters = await base44.entities.BookChapter.list('-created_date', 1000);
      const map = {};
      chapters.forEach(ch => {
        if (!map[ch.book_id]) map[ch.book_id] = 0;
        map[ch.book_id]++;
      });
      return map;
    }
  });

  // Update book mutation
  const updateBookMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.CommunityBook.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-community-books']);
      addToast('Đã cập nhật sách', 'success');
      setEditingBook(null);
    },
    onError: (err) => {
      addToast('Lỗi: ' + err.message, 'error');
    }
  });

  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: async (id) => {
      // Delete all chapters first
      const chapters = await base44.entities.BookChapter.filter({ book_id: id });
      for (const ch of chapters) {
        await base44.entities.BookChapter.delete(ch.id);
      }
      return await base44.entities.CommunityBook.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-community-books']);
      addToast('Đã xóa sách', 'success');
    },
    onError: (err) => {
      addToast('Lỗi: ' + err.message, 'error');
    }
  });

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedBooks.length === 0) return;

    const confirmed = await showConfirm({
      title: `${action === 'delete' ? 'Xóa' : 'Cập nhật'} ${selectedBooks.length} sách`,
      message: `Bạn có chắc chắn muốn thực hiện hành động này?`,
      type: action === 'delete' ? 'danger' : 'warning',
      confirmText: 'Xác nhận'
    });

    if (!confirmed) return;

    for (const bookId of selectedBooks) {
      if (action === 'delete') {
        await deleteBookMutation.mutateAsync(bookId);
      } else if (action === 'publish') {
        await updateBookMutation.mutateAsync({ id: bookId, data: { status: BOOK_STATUS.PUBLISHED } });
      } else if (action === 'archive') {
        await updateBookMutation.mutateAsync({ id: bookId, data: { status: BOOK_STATUS.ARCHIVED } });
      } else if (action === 'feature') {
        await updateBookMutation.mutateAsync({ id: bookId, data: { featured: true } });
      } else if (action === 'unfeature') {
        await updateBookMutation.mutateAsync({ id: bookId, data: { featured: false } });
      }
    }
    setSelectedBooks([]);
  };

  // Filter books
  const filteredBooks = books.filter(book => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = book.title?.toLowerCase().includes(query);
      const matchAuthor = book.author_name?.toLowerCase().includes(query);
      if (!matchTitle && !matchAuthor) return false;
    }

    // Tab filter
    if (activeTab === 'published') return book.status === BOOK_STATUS.PUBLISHED;
    if (activeTab === 'draft') return book.status === BOOK_STATUS.DRAFT;
    if (activeTab === 'featured') return book.featured;
    if (activeTab === 'reported') return false; // TODO: Implement reporting
    return true;
  });

  // Stats
  const stats = {
    total: books.length,
    published: books.filter(b => b.status === BOOK_STATUS.PUBLISHED).length,
    draft: books.filter(b => b.status === BOOK_STATUS.DRAFT).length,
    featured: books.filter(b => b.featured).length,
    totalChapters: Object.values(chaptersMap).reduce((a, b) => a + b, 0)
  };

  const handleDeleteBook = async (book) => {
    const confirmed = await showConfirm({
      title: 'Xóa sách',
      message: `Bạn có chắc chắn muốn xóa "${book.title}"? Tất cả chương sẽ bị xóa.`,
      type: 'danger',
      confirmText: 'Xóa'
    });
    if (confirmed) {
      deleteBookMutation.mutate(book.id);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản Lý Sách Cộng Đồng</h1>
            <p className="text-gray-500 mt-1">Quản lý toàn bộ sách do người dùng tạo</p>
          </div>
          <button
            onClick={() => navigate(createPageUrl('BookLibrary'))}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#558B2F] transition-colors flex items-center gap-2"
          >
            <Icon.Eye size={18} />
            Xem Thư Viện
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard icon="FileText" label="Tổng sách" value={stats.total} color="blue" />
          <StatCard icon="CheckCircle" label="Đã xuất bản" value={stats.published} color="green" />
          <StatCard icon="Edit" label="Bản nháp" value={stats.draft} color="yellow" />
          <StatCard icon="Star" label="Nổi bật" value={stats.featured} color="purple" />
          <StatCard icon="List" label="Tổng chương" value={stats.totalChapters} color="gray" />
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Icon.Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sách..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
                />
              </div>
            </div>
            
            {selectedBooks.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Đã chọn {selectedBooks.length}
                </span>
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                >
                  Xuất bản
                </button>
                <button
                  onClick={() => handleBulkAction('feature')}
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200"
                >
                  Nổi bật
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                >
                  Xóa
                </button>
                <button
                  onClick={() => setSelectedBooks([])}
                  className="px-3 py-1.5 text-gray-500 text-sm hover:text-gray-700"
                >
                  Bỏ chọn
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 flex items-center gap-2 text-sm font-medium border-b-2 -mb-[1px] transition-colors ${
                  activeTab === tab.key
                    ? 'text-[#7CB342] border-[#7CB342]'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {Icon[tab.icon] && React.createElement(Icon[tab.icon], { size: 16 })}
                {tab.label}
                {tab.key === 'all' && <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded">{books.length}</span>}
              </button>
            ))}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="p-12 text-center">
              <Icon.Spinner size={32} className="text-[#7CB342] mx-auto" />
              <p className="text-gray-500 mt-2">Đang tải...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="p-12 text-center">
              <Icon.FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không có sách nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedBooks.length === filteredBooks.length && filteredBooks.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBooks(filteredBooks.map(b => b.id));
                          } else {
                            setSelectedBooks([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left">Sách</th>
                    <th className="px-4 py-3 text-left">Tác giả</th>
                    <th className="px-4 py-3 text-center">Chương</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3 text-center">Lượt xem</th>
                    <th className="px-4 py-3 text-center">Thích</th>
                    <th className="px-4 py-3 text-left">Ngày tạo</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBooks.map(book => {
                    const statusBadge = getBookStatusBadge(book.status);
                    return (
                      <tr key={book.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedBooks.includes(book.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBooks([...selectedBooks, book.id]);
                              } else {
                                setSelectedBooks(selectedBooks.filter(id => id !== book.id));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[#7CB342]/20 to-[#FF9800]/20 flex-shrink-0">
                              {book.cover_image ? (
                                <img src={book.cover_image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Icon.FileText size={20} className="text-[#7CB342]/50" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 line-clamp-1">{book.title}</p>
                              <p className="text-xs text-gray-500">
                                {BOOK_CATEGORY_LABELS[book.category] || book.category}
                              </p>
                              {book.featured && (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                  <Icon.Star size={12} /> Nổi bật
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                              {book.author_avatar ? (
                                <img src={book.author_avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                book.author_name?.[0]?.toUpperCase()
                              )}
                            </div>
                            <span className="text-sm text-gray-700">{book.author_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium">{chaptersMap[book.id] || book.chapters_count || 0}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">
                          {book.views_count || 0}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">
                          {book.likes_count || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDistanceToNow(new Date(book.created_date), { addSuffix: true, locale: vi })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(createPageUrl('BookDetail') + `?id=${book.id}`)}
                              className="p-2 text-gray-400 hover:text-[#7CB342] rounded-lg hover:bg-gray-100"
                              title="Xem"
                            >
                              <Icon.Eye size={16} />
                            </button>
                            <button
                              onClick={() => setEditingBook(book)}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                              title="Chỉnh sửa"
                            >
                              <Icon.Edit size={16} />
                            </button>
                            <button
                              onClick={() => updateBookMutation.mutate({
                                id: book.id,
                                data: { featured: !book.featured }
                              })}
                              className={`p-2 rounded-lg hover:bg-gray-100 ${
                                book.featured ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'
                              }`}
                              title={book.featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                            >
                              <Icon.Star size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book)}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                              title="Xóa"
                            >
                              <Icon.Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Book Modal */}
      {editingBook && (
        <EditBookModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSave={(data) => updateBookMutation.mutate({ id: editingBook.id, data })}
          isSaving={updateBookMutation.isPending}
        />
      )}
    </AdminLayout>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-600'
  };

  const IconComponent = Icon[icon];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {IconComponent && <IconComponent size={20} />}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function EditBookModal({ book, onClose, onSave, isSaving }) {
  const [form, setForm] = useState({
    title: book.title || '',
    description: book.description || '',
    category: book.category || 'knowledge',
    status: book.status || BOOK_STATUS.DRAFT,
    visibility: book.visibility || 'public',
    allow_contributions: book.allow_contributions ?? true,
    allow_fork: book.allow_fork ?? true,
    featured: book.featured ?? false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Chỉnh Sửa Sách</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <Icon.X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thể loại</label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
              >
                {Object.entries(BOOK_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
              >
                {Object.entries(BOOK_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hiển thị</label>
            <select
              value={form.visibility}
              onChange={(e) => setForm(prev => ({ ...prev, visibility: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
            >
              <option value="public">Công khai</option>
              <option value="private">Riêng tư</option>
              <option value="contributors">Chỉ cộng tác viên</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allow_contributions}
                onChange={(e) => setForm(prev => ({ ...prev, allow_contributions: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342]"
              />
              <span className="text-sm text-gray-700">Cho phép đóng góp</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allow_fork}
                onChange={(e) => setForm(prev => ({ ...prev, allow_fork: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342]"
              />
              <span className="text-sm text-gray-700">Cho phép Fork</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342]"
              />
              <span className="text-sm text-gray-700">Đánh dấu nổi bật</span>
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || !form.title.trim()}
              className="flex-1 px-4 py-2 bg-[#7CB342] text-white rounded-lg font-medium hover:bg-[#558B2F] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? <Icon.Spinner size={18} /> : <Icon.Save size={18} />}
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}