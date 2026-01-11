/**
 * FeatureSpecCard - Card hiển thị feature spec
 * UI Layer only
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Eye, Copy, ExternalLink } from 'lucide-react';

const STATUS_CONFIG = {
  idea: { label: 'Ý tưởng', color: 'bg-gray-100 text-gray-700', icon: '💡' },
  spec_ready: { label: 'Spec Ready', color: 'bg-blue-100 text-blue-700', icon: '📋' },
  planned: { label: 'Đã lên kế hoạch', color: 'bg-purple-100 text-purple-700', icon: '📅' },
  in_progress: { label: 'Đang thực hiện', color: 'bg-yellow-100 text-yellow-700', icon: '🔄' },
  code_review: { label: 'Code Review', color: 'bg-orange-100 text-orange-700', icon: '👀' },
  testing: { label: 'Đang test', color: 'bg-cyan-100 text-cyan-700', icon: '🧪' },
  staged: { label: 'Staged', color: 'bg-indigo-100 text-indigo-700', icon: '🎭' },
  released: { label: 'Đã phát hành', color: 'bg-green-100 text-green-700', icon: '🚀' },
  deprecated: { label: 'Deprecated', color: 'bg-red-100 text-red-700', icon: '⚠️' }
};

const PRIORITY_CONFIG = {
  P0: { label: 'P0 - Critical', color: 'bg-red-500 text-white' },
  P1: { label: 'P1 - High', color: 'bg-orange-500 text-white' },
  P2: { label: 'P2 - Medium', color: 'bg-yellow-500 text-white' },
  P3: { label: 'P3 - Low', color: 'bg-gray-400 text-white' }
};

const TYPE_CONFIG = {
  new: { label: 'Mới', color: 'bg-emerald-100 text-emerald-700' },
  enhancement: { label: 'Nâng cấp', color: 'bg-blue-100 text-blue-700' },
  bugfix: { label: 'Sửa lỗi', color: 'bg-red-100 text-red-700' },
  refactor: { label: 'Refactor', color: 'bg-purple-100 text-purple-700' },
  techdebt: { label: 'Tech Debt', color: 'bg-gray-100 text-gray-700' }
};

export default function FeatureSpecCard({ 
  spec, 
  index = 0, 
  onView, 
  onEdit, 
  onDelete, 
  onDuplicate 
}) {
  const status = STATUS_CONFIG[spec.status] || STATUS_CONFIG.idea;
  const priority = PRIORITY_CONFIG[spec.priority] || PRIORITY_CONFIG.P2;
  const type = TYPE_CONFIG[spec.type] || TYPE_CONFIG.new;

  const taskStats = spec.tasks?.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const taskProgress = spec.tasks?.length > 0 
    ? Math.round((taskStats.done || 0) / spec.tasks.length * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView?.(spec)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
                {spec.fcode}
              </span>
              <Badge className={type.color} variant="secondary">
                {type.label}
              </Badge>
            </div>
            <h3 className="font-semibold text-gray-900 line-clamp-1">{spec.name}</h3>
            {spec.short_description && (
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{spec.short_description}</p>
            )}
            {spec.solution_algorithm && (
              <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                <p className="text-xs text-blue-600 font-medium mb-1">💡 Giải pháp:</p>
                <p className="text-xs text-gray-600 line-clamp-2">{spec.solution_algorithm}</p>
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(spec)}>
                <Eye className="w-4 h-4 mr-2" /> Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(spec)}>
                <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(spec)}>
                <Copy className="w-4 h-4 mr-2" /> Nhân bản
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(spec)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status & Priority */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className={status.color}>
            {status.icon} {status.label}
          </Badge>
          <Badge className={priority.color}>
            {priority.label}
          </Badge>
          {spec.module && (
            <Badge variant="outline">{spec.module}</Badge>
          )}
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">Tiến độ</span>
            <span className="font-medium">{spec.progress || 0}%</span>
          </div>
          <Progress value={spec.progress || 0} className="h-2" />
        </div>

        {/* Task Stats */}
        {spec.tasks?.length > 0 && (
          <div className="flex items-center gap-3 text-xs mb-3">
            <span className="text-gray-500">Tasks:</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {taskStats.done || 0} done
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              {taskStats.in_progress || 0} wip
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              {taskStats.todo || 0} todo
            </span>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
          <div className="flex items-center gap-2">
            {spec.milestone && (
              <span className="flex items-center gap-1">
                <Icon.Tag size={12} /> {spec.milestone}
              </span>
            )}
            {spec.phase && (
              <span className="flex items-center gap-1">
                <Icon.Layers size={12} /> {spec.phase}
              </span>
            )}
          </div>
          {spec.owner_tech && (
            <span className="flex items-center gap-1">
              <Icon.User size={12} /> {spec.owner_tech}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export { STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG };