/**
 * PageCard - Card hiển thị thông tin trang trong danh sách
 */

import React from "react";
import { motion } from "framer-motion";
import { 
  FileText, Eye, Edit, Trash2, MoreVertical, 
  Globe, EyeOff, Calendar, ExternalLink, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig = {
  draft: { label: 'Bản nháp', color: 'gray', icon: EyeOff },
  published: { label: 'Đã xuất bản', color: 'green', icon: Globe },
  archived: { label: 'Lưu trữ', color: 'orange', icon: FileText }
};

const templateLabels = {
  default: 'Mặc định',
  landing: 'Landing Page',
  content: 'Nội dung',
  contact: 'Liên hệ',
  team: 'Đội ngũ'
};

export default function PageCard({ 
  page, 
  onEdit, 
  onDelete, 
  onPublish, 
  onUnpublish,
  onPreview 
}) {
  const status = statusConfig[page.status] || statusConfig.draft;
  const StatusIcon = status.icon;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa cập nhật';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      {/* Featured Image */}
      {page.featured_image_url ? (
        <div className="h-40 overflow-hidden relative">
          <img 
            src={page.featured_image_url} 
            alt={page.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-700`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-24 bg-gradient-to-br from-[#7CB342]/10 to-[#FF9800]/10 flex items-center justify-center relative">
          <FileText className="w-10 h-10 text-[#7CB342]/30" />
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-700`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#7CB342] transition-colors">
              {page.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">/{page.slug}</span>
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(page)}>
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPreview(page)}>
                <Eye className="w-4 h-4 mr-2" />
                Xem trước
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/${page.slug}`, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Mở trang
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {page.status === 'published' ? (
                <DropdownMenuItem onClick={() => onUnpublish(page.id)}>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Gỡ xuất bản
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onPublish(page.id)}>
                  <Globe className="w-4 h-4 mr-2" />
                  Xuất bản
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(page.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa trang
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {page.subtitle && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {page.subtitle}
          </p>
        )}

        {/* Meta info */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(page.updated_date || page.created_date)}
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
              {templateLabels[page.template] || 'Mặc định'}
            </span>
            {page.show_in_menu && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                <Menu className="w-3 h-3" />
                Menu
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}