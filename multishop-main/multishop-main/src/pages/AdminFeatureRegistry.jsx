/**
 * AdminFeatureRegistry - Trang quản lý Feature Specs
 * 
 * Feature Control Tower - Quản lý đề xuất, tiến độ, version
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { 
  ArrowLeft, Plus, Zap, LayoutGrid, List, FileText, RefreshCw, 
  Download, Upload, Settings, Home, Rocket, Clock
} from 'lucide-react';

import AdminGuard from '@/components/AdminGuard';
import FeatureSpecCard from '@/components/admin/feature-registry/FeatureSpecCard';
import FeatureSpecFilters, { DEFAULT_FILTERS } from '@/components/admin/feature-registry/FeatureSpecFilters';
import FeatureSpecStats from '@/components/admin/feature-registry/FeatureSpecStats';
import FeatureSpecFormModal from '@/components/admin/feature-registry/FeatureSpecFormModal';
import FeatureSpecDetailModal from '@/components/admin/feature-registry/FeatureSpecDetailModal';
import { useFeatureSpecs, filterSpecs } from '@/components/hooks/useFeatureSpecs';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';
import { exportToXLSX, exportToPDF } from '@/components/admin/feature-registry/FeatureSpecExporter';

function AdminFeatureRegistryContent() {
  // State
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);
  const [viewingSpec, setViewingSpec] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  // Data
  const {
    specs,
    isLoading,
    stats,
    createSpec,
    updateSpec,
    deleteSpec,
    duplicateSpec,
    isCreating,
    isUpdating,
    isDeleting,
    isDuplicating
  } = useFeatureSpecs();

  // Filter specs based on tab and filters
  const filteredSpecs = useMemo(() => {
    let result = specs;

    // Tab filter
    if (activeTab !== 'all') {
      if (activeTab === 'active') {
        result = result.filter(s => ['in_progress', 'code_review', 'testing', 'staged'].includes(s.status));
      } else if (activeTab === 'released') {
        result = result.filter(s => s.status === 'released');
      } else if (activeTab === 'backlog') {
        result = result.filter(s => ['idea', 'spec_ready', 'planned'].includes(s.status));
      }
    }

    // Apply filters
    return filterSpecs(result, filters);
  }, [specs, filters, activeTab]);

  // Handlers
  const handleCreate = () => {
    setEditingSpec(null);
    setIsFormOpen(true);
  };

  const handleEdit = (spec) => {
    setEditingSpec(spec);
    setIsFormOpen(true);
    setViewingSpec(null);
  };

  const handleView = (spec) => {
    setViewingSpec(spec);
  };

  const handleSave = async (data) => {
    if (editingSpec) {
      await updateSpec({ id: editingSpec.id, data });
    } else {
      await createSpec(data);
    }
    setIsFormOpen(false);
    setEditingSpec(null);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteSpec(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleDuplicate = async (spec) => {
    await duplicateSpec(spec);
  };

  // Bulk selection
  const toggleSelection = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSpecs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSpecs.map(s => s.id)));
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Xác nhận xóa',
      message: `Xóa ${selectedIds.size} feature specs? Hành động này không thể hoàn tác.`,
      type: 'danger',
      confirmText: 'Xóa',
      cancelText: 'Hủy'
    });
    
    if (!confirmed) return;

    try {
      await Promise.all([...selectedIds].map(id => deleteSpec(id)));
      addToast(`Đã xóa ${selectedIds.size} feature specs`, 'success');
      setSelectedIds(new Set());
      setShowBulkMenu(false);
    } catch (error) {
      addToast('Lỗi khi xóa: ' + error.message, 'error');
    }
  };

  const handleBulkUpdateStatus = async (newStatus) => {
    try {
      const updates = [...selectedIds].map(id => {
        const spec = specs.find(s => s.id === id);
        return updateSpec({ id, data: { status: newStatus } });
      });
      await Promise.all(updates);
      addToast(`Đã cập nhật ${selectedIds.size} specs sang status: ${newStatus}`, 'success');
      setSelectedIds(new Set());
      setShowBulkMenu(false);
    } catch (error) {
      addToast('Lỗi khi cập nhật: ' + error.message, 'error');
    }
  };

  const handleBulkUpdatePriority = async (newPriority) => {
    try {
      const updates = [...selectedIds].map(id => {
        const spec = specs.find(s => s.id === id);
        return updateSpec({ id, data: { priority: newPriority } });
      });
      await Promise.all(updates);
      addToast(`Đã cập nhật ${selectedIds.size} specs sang priority: ${newPriority}`, 'success');
      setSelectedIds(new Set());
      setShowBulkMenu(false);
    } catch (error) {
      addToast('Lỗi khi cập nhật: ' + error.message, 'error');
    }
  };

  // Export functions - Full export with all tabs (Tổng quan, Phạm vi, Kỹ thuật, Tasks, Test Cases, QA & Logs)
  const handleExportXLSX = () => {
    try {
      setIsExporting(true);
      const dataToExport = selectedIds.size > 0 
        ? filteredSpecs.filter(s => selectedIds.has(s.id))
        : filteredSpecs;

      const result = exportToXLSX(dataToExport);
      addToast(`Đã xuất ${result.count} feature specs ra Excel (6 sheets: Tổng quan, Phạm vi, Kỹ thuật, Tasks, Test Cases, QA & Logs)`, 'success');
    } catch (error) {
      addToast('Lỗi khi xuất Excel: ' + error.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const dataToExport = selectedIds.size > 0 
        ? filteredSpecs.filter(s => selectedIds.has(s.id))
        : filteredSpecs;

      const result = exportToPDF(dataToExport);
      addToast(`Đã chuẩn bị PDF chi tiết cho ${result.count} feature specs (đầy đủ 6 tabs, tách trang theo feature)`, 'success');
    } catch (error) {
      addToast('Lỗi khi xuất PDF: ' + error.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Map FeatureSpec.module -> Feature.category
  const mapModuleToCategory = (module) => {
    const mapping = {
      'ecard': 'client',        // ecard là tính năng client-facing
      'community': 'client',    // community cũng client-facing
      'shop': 'client',         // shop là gian hàng client
      'admin': 'admin',         // admin giữ nguyên
      'core': 'core',           // core giữ nguyên
      'notification': 'notification', // notification giữ nguyên
      'referral': 'referral',   // referral giữ nguyên  
      'checkout': 'payment',    // checkout thuộc payment
      'preorder': 'order',      // preorder thuộc order
      'saas': 'integration',    // saas là integration
      'gift': 'client',         // gift là tính năng client
      'other': 'other'          // other giữ nguyên
    };
    return mapping[module] || 'other';
  };

  // Map priority từ P0/P1/P2/P3 sang critical/high/medium/low
  const mapPriority = (priority) => {
    const mapping = {
      'P0': 'critical',
      'P1': 'high',
      'P2': 'medium',
      'P3': 'low'
    };
    return mapping[priority] || 'medium';
  };

  // Sync to Features Registry
  const handleSyncToFeaturesRegistry = async () => {
    try {
      setIsSyncing(true);
      
      // Get all FeatureSpecs with status=released and progress=100
      const releasedSpecs = specs.filter(s => s.status === 'released' && s.progress === 100);
      
      if (releasedSpecs.length === 0) {
        addToast('Không có Feature Spec nào đã released để đồng bộ', 'info');
        return;
      }

      // Map FeatureSpec -> Feature entity
      const featuresToSync = releasedSpecs.map(spec => ({
        name: spec.name,
        description: spec.short_description || spec.objective || '',
        category: mapModuleToCategory(spec.module),
        status: 'completed',
        priority: mapPriority(spec.priority),
        version: spec.version_released || spec.milestone || '1.0.0',
        acceptance_criteria: spec.acceptance_criteria || [],
        test_cases: (spec.test_cases || []).map(tc => ({
          id: tc.id,
          title: tc.scenario,
          steps: tc.steps,
          expected: tc.expected,
          status: 'pending', // Always set pending when syncing - testers need to re-verify
          assigned_tester: null,
          dev_response: null
        })),
        related_pages: spec.modules_involved?.filter(m => m.startsWith('pages/')) || [],
        related_components: spec.modules_involved?.filter(m => m.startsWith('components/')) || [],
        is_public: false,
        public_token: null,
        notes: `Imported from Feature Control Tower (${spec.fcode})\n\nMục tiêu: ${spec.objective || ''}\n\n${spec.notes || ''}`,
        tags: [...new Set([...(spec.tags || []), spec.fcode, spec.module])].filter(Boolean),
        source_fcode: spec.fcode
      }));

      // Check existing features to avoid duplicates
      const existingFeatures = await base44.entities.Feature.list();
      const existingFCodes = new Set(existingFeatures.map(f => f.tags?.find(t => t.startsWith('ECARD-') || t.startsWith('SHOP-'))));

      const newFeatures = featuresToSync.filter(f => !existingFCodes.has(f.source_fcode));
      
      if (newFeatures.length === 0) {
        addToast('Tất cả features đã được đồng bộ rồi', 'info');
        setIsSyncing(false);
        return;
      }

      // Bulk create
      await base44.entities.Feature.bulkCreate(newFeatures);
      
      addToast(`✅ Đã đồng bộ ${newFeatures.length} features sang Features Registry`, 'success');
    } catch (error) {
      addToast('Lỗi khi đồng bộ: ' + error.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("AdminDashboard")} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Feature Control Tower</h1>
                  <p className="text-sm text-gray-500">Quản lý tính năng, version & tiến độ</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Bulk Actions */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-100 rounded-lg">
                  <span className="text-sm font-medium text-violet-900">{selectedIds.size} đã chọn</span>
                  <DropdownMenu open={showBulkMenu} onOpenChange={setShowBulkMenu}>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="h-7">
                        Bulk Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => handleBulkUpdateStatus('in_progress')}>
                        Chuyển sang In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkUpdateStatus('testing')}>
                        Chuyển sang Testing
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkUpdateStatus('released')}>
                        Chuyển sang Released
                      </DropdownMenuItem>
                      <DropdownMenuItem className="border-t mt-1 pt-1" onClick={() => handleBulkUpdatePriority('P0')}>
                        Set Priority P0
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkUpdatePriority('P1')}>
                        Set Priority P1
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkUpdatePriority('P2')}>
                        Set Priority P2
                      </DropdownMenuItem>
                      <DropdownMenuItem className="border-t mt-1 pt-1 text-red-600" onClick={handleBulkDelete}>
                        <Icon.Trash size={14} className="mr-2" /> Xóa tất cả
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} className="h-7">
                    <Icon.X size={14} />
                  </Button>
                </div>
              )}

              {/* View Mode */}
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

              {/* Sync Button - Nổi bật */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSyncToFeaturesRegistry}
                disabled={isSyncing}
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ → Features Registry'}
              </Button>

              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" /> 
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem onClick={handleExportXLSX}>
                    <FileText className="w-4 h-4 mr-2" /> 
                    <div className="flex-1">
                      <div>Export Excel (Full)</div>
                      <div className="text-xs text-gray-500">6 sheets: Tổng quan, Phạm vi, Kỹ thuật, Tasks, Test Cases, QA</div>
                    </div>
                    {selectedIds.size > 0 && <Badge variant="secondary" className="ml-2">{selectedIds.size}</Badge>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileText className="w-4 h-4 mr-2" /> 
                    <div className="flex-1">
                      <div>Export PDF (Full)</div>
                      <div className="text-xs text-gray-500">Chi tiết từng spec, tách trang</div>
                    </div>
                    {selectedIds.size > 0 && <Badge variant="secondary" className="ml-2">{selectedIds.size}</Badge>}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to={createPageUrl("Features")}>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <Zap className="w-4 h-4 mr-2" /> Features Registry (Testing)
                </Button>
              </Link>

              <Link to={createPageUrl("Home")}>
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" /> Trang chủ
                </Button>
              </Link>

              <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4 mr-2" /> Tạo Feature Spec
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <FeatureSpecStats specs={specs} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="all">
                Tất cả
                <Badge variant="secondary" className="ml-2">{specs.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="active">
                <Clock className="w-4 h-4 mr-1" /> Đang thực hiện
                <Badge variant="secondary" className="ml-2">{stats.inProgress + stats.testing}</Badge>
              </TabsTrigger>
              <TabsTrigger value="released">
                <Rocket className="w-4 h-4 mr-1" /> Đã phát hành
                <Badge variant="secondary" className="ml-2">{stats.released}</Badge>
              </TabsTrigger>
              <TabsTrigger value="backlog">
                Backlog
                <Badge variant="secondary" className="ml-2">
                  {specs.filter(s => ['idea', 'spec_ready', 'planned'].includes(s.status)).length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Filters */}
          <FeatureSpecFilters 
            filters={filters} 
            onChange={setFilters} 
            stats={stats}
          />

          {/* Content */}
          <div className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Icon.Spinner size={40} className="text-violet-500" />
              </div>
            ) : filteredSpecs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border">
                <Rocket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có Feature Spec nào</h3>
                <p className="text-gray-500 mb-6">Bắt đầu tạo Feature Spec đầu tiên để quản lý tính năng</p>
                <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-2" /> Tạo Feature Spec
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredSpecs.map((spec, idx) => (
                    <div key={spec.id} className="relative">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(spec.id)}
                        onChange={() => toggleSelection(spec.id)}
                        className="absolute top-3 left-3 z-10 w-4 h-4 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <FeatureSpecCard
                        spec={spec}
                        index={idx}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={setDeleteConfirm}
                        onDuplicate={handleDuplicate}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="w-12 p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === filteredSpecs.length && filteredSpecs.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded"
                        />
                      </th>
                      <th className="text-left p-4 font-medium text-gray-700">FCode</th>
                      <th className="text-left p-4 font-medium text-gray-700">Tên</th>
                      <th className="text-left p-4 font-medium text-gray-700">Module</th>
                      <th className="text-left p-4 font-medium text-gray-700">Trạng thái</th>
                      <th className="text-left p-4 font-medium text-gray-700">Ưu tiên</th>
                      <th className="text-left p-4 font-medium text-gray-700">Tiến độ</th>
                      <th className="text-right p-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSpecs.map((spec) => (
                      <tr key={spec.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleView(spec)}>
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(spec.id)}
                            onChange={() => toggleSelection(spec.id)}
                            className="w-4 h-4 rounded"
                          />
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm text-violet-600">{spec.fcode}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">{spec.name}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{spec.module}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge>{spec.status}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge>{spec.priority}</Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">{spec.progress || 0}%</span>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(spec)}>
                            <Icon.Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(spec)}>
                            <Icon.Trash size={16} className="text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-4 text-sm text-gray-500 text-center">
            Hiển thị {filteredSpecs.length} / {specs.length} Feature Specs
          </div>
        </Tabs>
      </main>

      {/* Form Modal */}
      <FeatureSpecFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingSpec(null); }}
        spec={editingSpec}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />

      {/* Detail Modal */}
      <FeatureSpecDetailModal
        isOpen={!!viewingSpec}
        onClose={() => setViewingSpec(null)}
        spec={viewingSpec}
        onEdit={handleEdit}
      />

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa Feature Spec "{deleteConfirm?.fcode} - {deleteConfirm?.name}"? 
              Hành động này không thể hoàn tác.
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

export default function AdminFeatureRegistry() {
  return (
    <AdminGuard>
      <AdminFeatureRegistryContent />
    </AdminGuard>
  );
}