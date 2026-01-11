/**
 * AdminPages - Trang quản lý CMS Pages
 */

import React, { useState, useMemo } from "react";
import { 
  Plus, Search, FileText, Globe, EyeOff, 
  Archive, Filter, LayoutGrid, List, Loader2 
} from "lucide-react";
import { motion } from "framer-motion";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAdminPages, usePageMutations, usePageStats } from "@/components/hooks/useCMSPages";
import PageCard from "@/components/admin/cms/PageCard";
import PageFormModal from "@/components/admin/cms/PageFormModal";

const statusTabs = [
  { value: 'all', label: 'Tất cả', icon: FileText },
  { value: 'published', label: 'Đã xuất bản', icon: Globe },
  { value: 'draft', label: 'Bản nháp', icon: EyeOff },
  { value: 'archived', label: 'Lưu trữ', icon: Archive }
];

function AdminPagesContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);

  // Data hooks
  const { data: pages = [], isLoading, error } = useAdminPages();
  const { createPage, updatePage, deletePage, publishPage, unpublishPage, isCreating, isUpdating } = usePageMutations();
  const stats = usePageStats(pages);

  // Filtered pages
  const filteredPages = useMemo(() => {
    return pages.filter(page => {
      const matchesSearch = 
        page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [pages, searchTerm, statusFilter]);

  // Handlers
  const handleCreate = () => {
    setEditingPage(null);
    setIsFormOpen(true);
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setIsFormOpen(true);
  };

  const handleSave = async (formData) => {
    if (editingPage) {
      await updatePage({ id: editingPage.id, data: formData });
    } else {
      await createPage(formData);
    }
    setIsFormOpen(false);
    setEditingPage(null);
  };

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa trang này?')) {
      await deletePage(id);
    }
  };

  const handlePreview = (page) => {
    // Open in preview mode or modal
    window.open(`/${page.slug}?preview=true`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Trang</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý các trang nội dung của website</p>
        </div>
        <Button onClick={handleCreate} className="bg-[#7CB342] hover:bg-[#689F38] gap-2">
          <Plus className="w-4 h-4" />
          Tạo Trang Mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-5 border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Tổng trang</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-5 border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
              <p className="text-sm text-gray-500">Đã xuất bản</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-5 border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              <p className="text-sm text-gray-500">Bản nháp</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-5 border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Archive className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.archived}</p>
              <p className="text-sm text-gray-500">Lưu trữ</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề hoặc slug..."
              className="pl-10"
            />
          </div>

          {/* Status Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              {statusTabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* View Mode */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#7CB342] animate-spin" />
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy trang nào' : 'Chưa có trang nào'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Bắt đầu tạo trang đầu tiên cho website của bạn'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={handleCreate} className="bg-[#7CB342] hover:bg-[#689F38] gap-2">
              <Plus className="w-4 h-4" />
              Tạo Trang Mới
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredPages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PageCard
                page={page}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPublish={publishPage}
                onUnpublish={unpublishPage}
                onPreview={handlePreview}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <PageFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPage(null);
        }}
        page={editingPage}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />
    </div>
  );
}

export default function AdminPages() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminPagesContent />
      </AdminLayout>
    </AdminGuard>
  );
}