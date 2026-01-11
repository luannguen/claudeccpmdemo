/**
 * AdminHomeFrames - Quản lý Homepage Frames (Scroll-Driven Storytelling)
 * 
 * Features:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Drag & drop reorder
 * - Preview desktop/mobile
 * - Toggle active status
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Icon } from "@/components/ui/AnimatedIcon";
import { useToast } from "@/components/NotificationToast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import HomeFrameFormModal from "@/components/admin/home/HomeFrameFormModal";
import HomeFramePreview from "@/components/admin/home/HomeFramePreview";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function AdminHomeFrames() {
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  
  // Confirm dialog state (render directly instead of using hook)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    frameToDelete: null
  });
  
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch frames - import useAllHomeFrames from hook
  const { data: frames = [], isLoading } = useQuery({
    queryKey: ['homeFrames', 'admin', 'all'],
    queryFn: () => base44.entities.HomeFrame.list('order', 100),
    staleTime: 30 * 1000,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.HomeFrame.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeFrames'] });
      addToast('Đã tạo frame mới thành công', 'success');
    },
    onError: (err) => addToast('Lỗi tạo frame: ' + err.message, 'error'),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.HomeFrame.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeFrames'] });
      addToast('Đã cập nhật frame', 'success');
    },
    onError: (err) => addToast('Lỗi: ' + err.message, 'error'),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HomeFrame.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeFrames'] });
      addToast('Đã xóa frame', 'success');
    },
    onError: (err) => addToast('Lỗi xóa: ' + err.message, 'error'),
  });

  // Toggle active
  const handleToggleActive = (frame) => {
    updateMutation.mutate({
      id: frame.id,
      data: { is_active: !frame.is_active }
    });
  };

  // Calculate next order (find max order + 1, not frames.length)
  const getNextOrder = () => {
    if (frames.length === 0) return 0;
    const maxOrder = Math.max(...frames.map(f => f.order ?? 0));
    return maxOrder + 1;
  };

  // Generate unique frame_id
  const generateFrameId = () => {
    return `frame_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  };

  // Create new frame
  const handleCreate = () => {
    setSelectedFrame(null);
    setIsCreateMode(true);
    setShowFormModal(true);
  };

  // Edit frame
  const handleEdit = (frame) => {
    setSelectedFrame(frame);
    setIsCreateMode(false);
    setShowFormModal(true);
  };

  // Delete frame - Open confirm dialog
  const handleDelete = (frame) => {
    console.log('[AdminHomeFrames] Opening delete confirm dialog for frame:', frame.id, frame.title);
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa Frame',
      message: `Bạn có chắc muốn xóa frame "${frame.title || 'Frame ' + frame.order}"? Hành động này không thể hoàn tác.`,
      type: 'danger',
      frameToDelete: frame
    });
  };
  
  // Execute delete when confirmed
  const handleConfirmDelete = async () => {
    const frame = confirmDialog.frameToDelete;
    if (!frame) return;
    
    console.log('[AdminHomeFrames] User confirmed delete, executing for id:', frame.id);
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    
    try {
      await deleteMutation.mutateAsync(frame.id);
      console.log('[AdminHomeFrames] Delete successful');
    } catch (error) {
      console.error('[AdminHomeFrames] Delete error:', error);
      addToast('Lỗi xóa frame: ' + error.message, 'error');
    }
  };
  
  // Close confirm dialog
  const handleCancelDelete = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false, frameToDelete: null }));
  };

  // Save frame (create or update)
  const handleSave = async (data) => {
    try {
      if (isCreateMode) {
        // Auto-assign order to end (max + 1, not frames.length to avoid collision)
        const newOrder = getNextOrder();
        const frameId = generateFrameId();
        await createMutation.mutateAsync({
          ...data,
          frame_id: frameId,
          order: newOrder
        });
      } else {
        await base44.entities.HomeFrame.update(selectedFrame.id, data);
        queryClient.invalidateQueries({ queryKey: ['homeFrames'] });
        addToast('Đã lưu frame thành công', 'success');
      }
      setShowFormModal(false);
      setSelectedFrame(null);
      setIsCreateMode(false);
    } catch (err) {
      addToast('Lỗi: ' + err.message, 'error');
    }
  };

  // Drag end handler
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(frames);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    // Update order for all items
    for (let i = 0; i < items.length; i++) {
      if (items[i].order !== i) {
        await base44.entities.HomeFrame.update(items[i].id, { order: i });
      }
    }
    
    queryClient.invalidateQueries({ queryKey: ['homeFrames'] });
    addToast('Đã sắp xếp lại thứ tự', 'success');
  };

  // Duplicate frame
  const handleDuplicate = async (frame) => {
    // Use max order + 1 to avoid collision
    const newOrder = getNextOrder();
    const newData = {
      ...frame,
      frame_id: generateFrameId(),
      order: newOrder,
      title: frame.title + ' (Copy)',
      is_active: false
    };
    delete newData.id;
    delete newData.created_date;
    delete newData.updated_date;
    delete newData.created_by;
    
    try {
      await createMutation.mutateAsync(newData);
      addToast('Đã nhân bản frame', 'success');
    } catch (err) {
      addToast('Lỗi nhân bản: ' + err.message, 'error');
    }
  };

  const sortedFrames = [...frames].sort((a, b) => a.order - b.order);

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Homepage Frames</h1>
            <p className="text-gray-600 mt-1">Scroll-driven storytelling - Kéo thả để sắp xếp</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
            >
              <Icon.Eye size={18} className="mr-2" />
              Xem trước
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-[#7CB342] hover:bg-[#689F38]"
            >
              <Icon.Plus size={18} className="mr-2" />
              Thêm Frame
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon.Layers size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng frames</p>
                <p className="text-xl font-bold">{frames.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon.CheckCircle size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang bật</p>
                <p className="text-xl font-bold">{frames.filter(f => f.is_active).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon.Film size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Có video</p>
                <p className="text-xl font-bold">{frames.filter(f => f.background_type === 'video').length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Frames List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Icon.Spinner size={32} className="text-[#7CB342]" />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="frames">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {sortedFrames.map((frame, index) => (
                    <Draggable key={frame.id} draggableId={frame.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        >
                          <Card className={`${!frame.is_active ? 'opacity-60' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                {/* Drag Handle */}
                                <div {...provided.dragHandleProps} className="cursor-grab p-2 hover:bg-gray-100 rounded">
                                  <Icon.Menu size={20} className="text-gray-400" />
                                </div>

                                {/* Thumbnail */}
                                <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  {frame.background_url ? (
                                    <img
                                      src={frame.background_url}
                                      alt={frame.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Icon.Image size={24} className="text-gray-400" />
                                    </div>
                                  )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                      Frame {frame.order}
                                    </Badge>
                                    <Badge className={`text-xs ${
                                      frame.background_type === 'video' 
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {frame.background_type}
                                    </Badge>
                                  </div>
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {frame.title || 'Chưa có tiêu đề'}
                                  </h3>
                                  <p className="text-sm text-gray-500 truncate">
                                    {frame.subtitle || 'Chưa có mô tả'}
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Bật</span>
                                    <Switch
                                      checked={frame.is_active}
                                      onCheckedChange={() => handleToggleActive(frame)}
                                    />
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(frame)}
                                  >
                                    <Icon.Edit size={16} className="mr-1" />
                                    Sửa
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDuplicate(frame)}
                                    title="Nhân bản frame"
                                  >
                                    <Icon.Copy size={16} />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(frame)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Xóa frame"
                                  >
                                    <Icon.Trash size={16} />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Empty State */}
        {!isLoading && frames.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Icon.Layers size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có frame nào</h3>
              <p className="text-gray-500 mb-4">Tạo frame đầu tiên để bắt đầu xây dựng trang chủ</p>
              <Button onClick={handleCreate} className="bg-[#7CB342] hover:bg-[#689F38]">
                <Icon.Plus size={18} className="mr-2" />
                Tạo Frame Đầu Tiên
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Form Modal */}
        {showFormModal && (
          <HomeFrameFormModal
            frame={selectedFrame}
            isCreateMode={isCreateMode}
            onSave={handleSave}
            onClose={() => {
              setShowFormModal(false);
              setSelectedFrame(null);
              setIsCreateMode(false);
            }}
          />
        )}

        {/* Preview Modal */}
        {showPreview && (
          <HomeFramePreview
            frames={sortedFrames}
            device={previewDevice}
            onDeviceChange={setPreviewDevice}
            onClose={() => setShowPreview(false)}
          />
        )}

        {/* Confirm Delete Dialog - MUST render to work */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          confirmText="Xóa"
          cancelText="Hủy"
        />
      </div>
    </AdminLayout>
  );
}