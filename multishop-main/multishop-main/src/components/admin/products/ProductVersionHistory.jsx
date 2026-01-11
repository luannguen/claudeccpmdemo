/**
 * Product Version History
 * UI Component - Timeline view of product changes
 */

import React, { useState } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProductVersions, useRestoreVersion } from "@/components/hooks/useProductVersions";
import { useConfirmDialog } from "@/components/hooks/useConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function ProductVersionHistory({ productId, productName }) {
  const { data: versions = [], isLoading } = useProductVersions(productId);
  const restoreMutation = useRestoreVersion();
  const { showConfirm } = useConfirmDialog();
  const [expandedVersion, setExpandedVersion] = useState(null);

  const handleRestore = async (version) => {
    const confirmed = await showConfirm({
      title: 'Khôi phục version cũ',
      message: `Khôi phục "${productName}" về version ${version.version_number}? Trạng thái hiện tại sẽ được lưu lại.`,
      type: 'warning',
      confirmText: 'Khôi phục',
      cancelText: 'Hủy'
    });

    if (confirmed) {
      restoreMutation.mutate({ productId, version });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon.Spinner className="w-8 h-8 text-[#7CB342]" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon.Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Chưa có lịch sử thay đổi</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {versions.map((version, index) => (
        <motion.div
          key={version.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-[#7CB342] transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#7CB342]/10 rounded-full flex items-center justify-center">
                <Icon.Clock className="w-5 h-5 text-[#7CB342]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">Version {version.version_number}</span>
                  {index === 0 && (
                    <Badge className="bg-[#7CB342] text-white text-xs">Mới Nhất</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {format(new Date(version.created_date), 'dd/MM/yyyy HH:mm')} • {version.changed_by || 'Unknown'}
                </p>
              </div>
            </div>
            
            {index > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRestore(version)}
                disabled={restoreMutation.isPending}
                className="text-xs"
              >
                <Icon.CornerDownLeft className="w-4 h-4 mr-1" />
                Khôi Phục
              </Button>
            )}
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-700 font-medium mb-2">
              {version.change_summary || 'Không có mô tả'}
            </p>
            
            {version.changed_fields?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {version.changed_fields.map((field) => (
                  <Badge key={field} variant="outline" className="text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setExpandedVersion(expandedVersion === version.id ? null : version.id)}
            className="text-sm text-[#7CB342] hover:underline flex items-center gap-1"
          >
            {expandedVersion === version.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
            <Icon.ChevronDown className={`w-4 h-4 transition-transform ${
              expandedVersion === version.id ? 'rotate-180' : ''
            }`} />
          </button>

          <AnimatePresence>
            {expandedVersion === version.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 pt-3 border-t border-gray-200"
              >
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(version.snapshot, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}