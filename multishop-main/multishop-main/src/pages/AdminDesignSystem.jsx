/**
 * AdminDesignSystem - Design System Documentation Package
 * ADMIN-F11: Quản lý UI/UX rules, design tokens, component specs
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useDesignDocs, CATEGORY_CONFIG, STATUS_CONFIG } from '@/components/hooks/useDesignDocs';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';
import { useToast } from '@/components/NotificationToast';

import DesignDocCard from '@/components/admin/design-system/DesignDocCard';
import DesignDocFormModal from '@/components/admin/design-system/DesignDocFormModal';
import DesignDocViewModal from '@/components/admin/design-system/DesignDocViewModal';

import {
  ArrowLeft, Plus, Search, Filter, LayoutGrid, List, 
  FileText, Palette, Box, Layers, ArrowRight, Database,
  Tag, Clock, Activity, Sliders
} from 'lucide-react';

// Default templates for quick start
const DOCUMENT_TEMPLATES = [
  {
    slug: 'ui_ux_rules',
    name: 'UI_UX_RULES.md',
    category: 'rules',
    title: 'UI/UX Design Rules',
    description: 'Quy tắc thiết kế UI/UX toàn diện',
    content: `# UI/UX Design Rules

## 1. Mobile-First Principles
- Thiết kế cho mobile trước, sau đó scale up
- Touch targets tối thiểu 44x44px

## 2. Typography
- Heading: Inter Bold
- Body: Inter Regular
- Monospace: JetBrains Mono

## 3. Spacing System
- Base: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64

## 4. Color Guidelines
- Primary: Violet-600 (#7C3AED)
- Success: Green-500
- Error: Red-500
- Warning: Amber-500
`,
    version: '1.0.0',
    status: 'draft',
    priority: 1,
    tags: ['ui', 'ux', 'mobile', 'typography']
  },
  {
    slug: 'design_tokens',
    name: 'DESIGN_TOKENS.md',
    category: 'tokens',
    title: 'Design Tokens',
    description: 'Spacing, colors, fonts, shadows, z-index',
    content: `# Design Tokens

## Colors
\`\`\`css
--color-primary: #7C3AED;
--color-primary-hover: #6D28D9;
--color-background: #FFFFFF;
--color-surface: #F9FAFB;
--color-border: #E5E7EB;
\`\`\`

## Spacing
| Token | Value |
|-------|-------|
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-6 | 24px |
| space-8 | 32px |

## Shadows
\`\`\`css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
\`\`\`

## Z-Index Scale
- Dropdown: 50
- Modal: 100
- Toast: 150
- Tooltip: 200
`,
    version: '1.0.0',
    status: 'draft',
    priority: 2,
    tags: ['tokens', 'colors', 'spacing', 'shadows']
  }
];

function AdminDesignSystemContent() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { 
    docs, isLoading, stats, 
    createDoc, updateDoc, deleteDoc,
    isCreating, isUpdating, isDeleting 
  } = useDesignDocs();
  
  const { showConfirm } = useConfirmDialog();
  const { addToast } = useToast();

  // Filtered docs
  const filteredDocs = useMemo(() => {
    return docs.filter(doc => {
      const matchSearch = !search || 
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.description?.toLowerCase().includes(search.toLowerCase()) ||
        doc.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
      const matchCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || doc.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [docs, search, categoryFilter, statusFilter]);

  // Handlers
  const handleCreate = () => {
    setEditingDoc(null);
    setIsFormOpen(true);
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setIsFormOpen(true);
    setViewingDoc(null);
  };

  const handleView = (doc) => {
    setViewingDoc(doc);
  };

  const handleSave = async (data) => {
    try {
      if (editingDoc) {
        await updateDoc({ id: editingDoc.id, data: { ...data, last_editor: 'admin' } });
        addToast(`Đã cập nhật "${data.title}"`, 'success');
      } else {
        await createDoc(data);
        addToast(`Đã tạo "${data.title}"`, 'success');
      }
      setIsFormOpen(false);
      setEditingDoc(null);
    } catch (error) {
      addToast('Có lỗi xảy ra: ' + error.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      try {
        await deleteDoc(deleteConfirm.id);
        addToast(`Đã xóa "${deleteConfirm.title}"`, 'success');
        setDeleteConfirm(null);
      } catch (error) {
        addToast('Không thể xóa: ' + error.message, 'error');
      }
    }
  };

  const handleDuplicate = async (doc) => {
    try {
      const newDoc = {
        ...doc,
        slug: `${doc.slug}_copy`,
        name: doc.name.replace('.md', '_copy.md'),
        title: `${doc.title} (Copy)`,
        status: 'draft'
      };
      delete newDoc.id;
      delete newDoc.created_date;
      delete newDoc.updated_date;
      await createDoc(newDoc);
      addToast(`Đã nhân bản "${doc.title}"`, 'success');
    } catch (error) {
      addToast('Không thể nhân bản: ' + error.message, 'error');
    }
  };

  const handleCreateFromTemplate = async (template) => {
    try {
      await createDoc(template);
      addToast(`Đã tạo "${template.title}" từ template`, 'success');
    } catch (error) {
      addToast('Không thể tạo: ' + error.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("AdminHandbook")} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Palette className="w-7 h-7 text-violet-600" />
              Design System Documentation
            </h1>
            <p className="text-gray-500 text-sm">ADMIN-F11 • Quản lý UI/UX rules, tokens, component specs</p>
          </div>
        </div>
        <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" /> Tạo Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-violet-600">Tổng Documents</p>
                <p className="text-2xl font-bold text-violet-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-violet-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Published</p>
                <p className="text-2xl font-bold text-green-900">{stats.published}</p>
              </div>
              <Icon.CheckCircle size={32} className="text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">In Review</p>
                <p className="text-2xl font-bold text-amber-900">{stats.review}</p>
              </div>
              <Icon.Clock size={32} className="text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              </div>
              <Icon.Edit size={32} className="text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Categories</p>
                <p className="text-2xl font-bold text-blue-900">{Object.keys(stats.byCategory).length}</p>
              </div>
              <Layers className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Templates */}
      {docs.length === 0 && (
        <Card className="border-dashed border-2 border-violet-300 bg-violet-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon.Sparkles size={20} className="text-violet-600" />
              Bắt đầu nhanh với Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Chưa có document nào. Tạo nhanh từ template có sẵn:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {DOCUMENT_TEMPLATES.map(template => (
                <Button
                  key={template.slug}
                  variant="outline"
                  className="justify-start h-auto py-3 hover:bg-violet-50 hover:border-violet-400"
                  onClick={() => handleCreateFromTemplate(template)}
                >
                  <FileText className="w-5 h-5 mr-3 text-violet-600" />
                  <div className="text-left">
                    <div className="font-medium">{template.title}</div>
                    <div className="text-xs text-gray-500">{template.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm document, tags..."
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-violet-600' : ''}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-violet-600' : ''}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Document List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Icon.Spinner size={40} className="text-violet-500" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy document</h3>
          <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc tạo document mới</p>
          <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" /> Tạo Document
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDocs.map((doc, idx) => (
              <DesignDocCard
                key={doc.id}
                doc={doc}
                index={idx}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={setDeleteConfirm}
                onDuplicate={handleDuplicate}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Tên</th>
                <th className="text-left p-4 font-medium text-gray-700">Danh mục</th>
                <th className="text-left p-4 font-medium text-gray-700">Trạng thái</th>
                <th className="text-left p-4 font-medium text-gray-700">Version</th>
                <th className="text-right p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => {
                const category = CATEGORY_CONFIG[doc.category] || CATEGORY_CONFIG.rules;
                const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.draft;
                return (
                  <tr 
                    key={doc.id} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleView(doc)}
                  >
                    <td className="p-4">
                      <div className="font-medium">{doc.title}</div>
                      <div className="text-xs text-gray-500 font-mono">{doc.name}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{category.label}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge>{status.label}</Badge>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm">v{doc.version}</span>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(doc)}>
                        <Icon.Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(doc)}>
                        <Icon.Trash size={16} className="text-red-500" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <div className="text-sm text-gray-500 text-center">
        Hiển thị {filteredDocs.length} / {docs.length} documents
      </div>

      {/* Form Modal */}
      <DesignDocFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingDoc(null); }}
        doc={editingDoc}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />

      {/* View Modal */}
      <DesignDocViewModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        doc={viewingDoc}
        onEdit={handleEdit}
      />

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa "{deleteConfirm?.title}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminDesignSystem() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminDesignSystemContent />
      </AdminLayout>
    </AdminGuard>
  );
}