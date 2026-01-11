/**
 * BulkActionsBar - Bulk actions for connections (delete, tag, export)
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/AnimatedIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useConfirmDialog } from "@/components/hooks/useConfirmDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/NotificationToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function BulkActionsBar({ 
  selectedIds, 
  connections,
  onClearSelection,
  onSelectAll,
  isAllSelected
}) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { dialog, showConfirm, handleConfirm, handleCancel } = useConfirmDialog();
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');

  const selectedCount = selectedIds.length;
  const selectedConnections = connections.filter(c => selectedIds.includes(c.id));

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      const deletePromises = [];
      
      for (const id of selectedIds) {
        const conn = connections.find(c => c.id === id);
        if (conn) {
          // Delete main connection
          deletePromises.push(base44.entities.UserConnection.delete(id));
          
          // Find and delete reverse connection
          const reversePromise = base44.entities.UserConnection.filter({
            initiator_user_id: conn.target_user_id,
            target_user_id: conn.initiator_user_id
          }).then(async (reverseConns) => {
            for (const reverse of reverseConns) {
              await base44.entities.UserConnection.delete(reverse.id);
            }
          });
          deletePromises.push(reversePromise);
        }
      }
      
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      addToast(`Đã xóa ${selectedCount} kết nối`, 'success');
      onClearSelection();
    },
    onError: () => {
      addToast('Không thể xóa một số kết nối', 'error');
    }
  });

  // Bulk add tag mutation
  const bulkAddTagMutation = useMutation({
    mutationFn: async (tag) => {
      const updatePromises = selectedIds.map(id => {
        const conn = connections.find(c => c.id === id);
        const existingTags = conn?.tags || [];
        if (!existingTags.includes(tag)) {
          return base44.entities.UserConnection.update(id, {
            tags: [...existingTags, tag]
          });
        }
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      addToast(`Đã thêm tag "${newTag}" cho ${selectedCount} kết nối`, 'success');
      setNewTag('');
      setShowTagInput(false);
    },
    onError: () => {
      addToast('Không thể thêm tag', 'error');
    }
  });

  // Bulk update care level
  const bulkUpdateCareLevelMutation = useMutation({
    mutationFn: async (newLevel) => {
      const updatePromises = selectedIds.map(id => 
        base44.entities.UserConnection.update(id, { care_level: newLevel })
      );
      await Promise.all(updatePromises);
    },
    onSuccess: (_, newLevel) => {
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      addToast(`Đã cập nhật ${selectedCount} kết nối thành ${newLevel.toUpperCase()}`, 'success');
      onClearSelection();
    },
    onError: () => {
      addToast('Không thể cập nhật', 'error');
    }
  });

  const handleBulkDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Xóa nhiều kết nối',
      message: `Bạn có chắc muốn xóa ${selectedCount} kết nối? Hành động này không thể hoàn tác và sẽ xóa kết nối cả 2 phía.`,
      type: 'danger',
      confirmText: 'Xóa tất cả',
      cancelText: 'Hủy'
    });

    if (confirmed) {
      bulkDeleteMutation.mutate();
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      bulkAddTagMutation.mutate(newTag.trim());
    }
  };

  const handleExportSelected = () => {
    // Create vCard for selected connections
    const vcards = selectedConnections.map(conn => {
      return `BEGIN:VCARD
VERSION:3.0
FN:${conn.target_name || ''}
TITLE:${conn.target_title || ''}
ORG:${conn.target_company || ''}
NOTE:Care Level: ${conn.care_level}${conn.notes ? ` | Notes: ${conn.notes}` : ''}
END:VCARD`;
    }).join('\n');

    const blob = new Blob([vcards], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connections-${selectedCount}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    
    addToast(`Đã xuất ${selectedCount} kết nối`, 'success');
  };

  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[95vw]"
      >
        <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-4 flex-wrap justify-center">
          {/* Selection Info */}
          <div className="flex items-center gap-1 md:gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white text-xs md:text-sm">
              {selectedCount}
            </Badge>
            <button
              onClick={isAllSelected ? onClearSelection : onSelectAll}
              className="text-xs md:text-sm text-white/70 hover:text-white underline"
            >
              {isAllSelected ? 'Bỏ' : 'Tất cả'}
            </button>
          </div>

          <div className="hidden md:block w-px h-8 bg-white/20" />

          {/* Tag Input */}
          {showTagInput ? (
            <div className="flex items-center gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Nhập tag..."
                className="w-24 md:w-32 h-8 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim() || bulkAddTagMutation.isPending}
                className="h-8 bg-blue-500 hover:bg-blue-600"
              >
                {bulkAddTagMutation.isPending ? <Icon.Spinner size={14} /> : 'OK'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowTagInput(false)}
                className="h-8 text-white/70 hover:text-white hover:bg-white/10"
              >
                <Icon.X size={14} />
              </Button>
            </div>
          ) : (
            <>
              {/* Quick Actions - Responsive */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowTagInput(true)}
                className="text-white/70 hover:text-white hover:bg-white/10 px-2 md:px-3"
              >
                <Icon.Tag size={16} />
                <span className="hidden md:inline ml-2">Gắn tag</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => bulkUpdateCareLevelMutation.mutate('vip')}
                disabled={bulkUpdateCareLevelMutation.isPending}
                className="text-blue-400 hover:text-blue-300 hover:bg-white/10 px-2 md:px-3"
              >
                <Icon.Star size={16} />
                <span className="hidden md:inline ml-2">VIP</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => bulkUpdateCareLevelMutation.mutate('premium')}
                disabled={bulkUpdateCareLevelMutation.isPending}
                className="text-purple-400 hover:text-purple-300 hover:bg-white/10 px-2 md:px-3"
              >
                <Icon.Crown size={16} />
                <span className="hidden md:inline ml-2">Premium</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleExportSelected}
                className="text-green-400 hover:text-green-300 hover:bg-white/10 px-2 md:px-3"
              >
                <Icon.Download size={16} />
                <span className="hidden md:inline ml-2">Xuất</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="text-red-400 hover:text-red-300 hover:bg-white/10 px-2 md:px-3"
              >
                {bulkDeleteMutation.isPending ? (
                  <Icon.Spinner size={16} />
                ) : (
                  <Icon.Trash size={16} />
                )}
                <span className="hidden md:inline ml-2">Xóa</span>
              </Button>
            </>
          )}

          <div className="hidden md:block w-px h-8 bg-white/20" />

          {/* Close */}
          <button
            onClick={onClearSelection}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <Icon.X size={16} />
          </button>
        </div>

        <ConfirmDialog 
          dialog={dialog}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </motion.div>
    </AnimatePresence>
  );
}