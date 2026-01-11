/**
 * FeatureBulkActions - Toolbar thao tác hàng loạt trên Features
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, X, Trash2, RefreshCw, Share2, Tag, MoreHorizontal,
  ChevronDown, Loader2, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
import { statusConfig, categoryConfig, priorityConfig } from "@/components/services/featureService";

export default function FeatureBulkActions({ 
  selectedIds = [], 
  features = [],
  onClearSelection,
  onBulkUpdateStatus,
  onBulkUpdatePriority,
  onBulkUpdateCategory,
  onBulkDelete,
  onBulkGenerateLinks,
  onBulkRevokeLinks,
  isProcessing = false
}) {
  const [confirmAction, setConfirmAction] = useState(null);

  const selectedCount = selectedIds.length;
  const selectedFeatures = features.filter(f => selectedIds.includes(f.id));

  // Stats of selected
  const stats = {
    withPublicLink: selectedFeatures.filter(f => f.is_public && f.public_token).length,
    withoutPublicLink: selectedFeatures.filter(f => !f.is_public || !f.public_token).length
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case 'delete':
        await onBulkDelete(selectedIds);
        break;
      case 'status':
        await onBulkUpdateStatus(selectedIds, confirmAction.value);
        break;
      case 'priority':
        await onBulkUpdatePriority(selectedIds, confirmAction.value);
        break;
      case 'category':
        await onBulkUpdateCategory(selectedIds, confirmAction.value);
        break;
      case 'generate_links':
        await onBulkGenerateLinks(selectedIds);
        break;
      case 'revoke_links':
        await onBulkRevokeLinks(selectedIds);
        break;
    }
    
    setConfirmAction(null);
    onClearSelection();
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gray-900 text-white rounded-xl shadow-2xl px-4 py-3 flex items-center gap-4">
            {/* Selection info */}
            <div className="flex items-center gap-2">
              <Badge className="bg-violet-500 text-white">{selectedCount}</Badge>
              <span className="text-sm">đã chọn</span>
            </div>

            <div className="w-px h-6 bg-gray-700" />

            {/* Quick actions */}
            <div className="flex items-center gap-2">
              {/* Change Status */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                    <RefreshCw className="w-4 h-4 mr-1" /> Trạng thái
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <DropdownMenuItem 
                      key={key}
                      onClick={() => setConfirmAction({ 
                        type: 'status', 
                        value: key, 
                        label: `Đổi trạng thái thành "${cfg.label}"` 
                      })}
                    >
                      <Badge className={`${cfg.color} mr-2`}>{cfg.icon}</Badge>
                      {cfg.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Change Priority */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                    <Tag className="w-4 h-4 mr-1" /> Ưu tiên
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Object.entries(priorityConfig).map(([key, cfg]) => (
                    <DropdownMenuItem 
                      key={key}
                      onClick={() => setConfirmAction({ 
                        type: 'priority', 
                        value: key, 
                        label: `Đổi độ ưu tiên thành "${cfg.label}"` 
                      })}
                    >
                      <Badge className={`${cfg.color} mr-2`}>{cfg.label}</Badge>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Category submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      📁 Đổi danh mục
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {Object.entries(categoryConfig).map(([key, cfg]) => (
                        <DropdownMenuItem 
                          key={key}
                          onClick={() => setConfirmAction({ 
                            type: 'category', 
                            value: key, 
                            label: `Đổi danh mục thành "${cfg.label}"` 
                          })}
                        >
                          <Badge className={`${cfg.color} mr-2 text-xs`}>{cfg.label}</Badge>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  {/* Public Links */}
                  {stats.withoutPublicLink > 0 && (
                    <DropdownMenuItem 
                      onClick={() => setConfirmAction({ 
                        type: 'generate_links', 
                        label: `Tạo public link cho ${stats.withoutPublicLink} feature` 
                      })}
                    >
                      <Share2 className="w-4 h-4 mr-2 text-blue-500" />
                      Tạo public links ({stats.withoutPublicLink})
                    </DropdownMenuItem>
                  )}
                  
                  {stats.withPublicLink > 0 && (
                    <DropdownMenuItem 
                      onClick={() => setConfirmAction({ 
                        type: 'revoke_links', 
                        label: `Hủy public link của ${stats.withPublicLink} feature` 
                      })}
                    >
                      <X className="w-4 h-4 mr-2 text-orange-500" />
                      Hủy public links ({stats.withPublicLink})
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  {/* Delete */}
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => setConfirmAction({ 
                      type: 'delete', 
                      label: `Xóa ${selectedCount} feature` 
                    })}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa tất cả đã chọn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="w-px h-6 bg-gray-700" />

            {/* Clear selection */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={onClearSelection}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmAction?.type === 'delete' ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : (
                <RefreshCw className="w-5 h-5 text-violet-500" />
              )}
              Xác nhận thao tác hàng loạt
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn <strong>{confirmAction?.label}</strong>?
              <br />
              Thao tác này sẽ áp dụng cho <strong>{selectedCount}</strong> tính năng đã chọn.
              {confirmAction?.type === 'delete' && (
                <span className="block mt-2 text-red-600 font-medium">
                  ⚠️ Hành động này không thể hoàn tác!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction}
              disabled={isProcessing}
              className={confirmAction?.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'}
            >
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" /> Xác nhận</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}