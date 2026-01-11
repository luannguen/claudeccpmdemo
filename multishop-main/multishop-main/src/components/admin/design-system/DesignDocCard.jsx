/**
 * DesignDocCard - Card hiển thị 1 document
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORY_CONFIG, STATUS_CONFIG } from '@/components/hooks/useDesignDocs';
import { format } from 'date-fns';
import { MoreVertical, Eye, Pencil, Trash2, Copy } from 'lucide-react';

export default function DesignDocCard({ doc, index, onView, onEdit, onDelete, onDuplicate }) {
  const category = CATEGORY_CONFIG[doc.category] || CATEGORY_CONFIG.rules;
  const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.draft;

  const colorClasses = {
    violet: 'bg-violet-50 border-violet-200 hover:border-violet-400',
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    green: 'bg-green-50 border-green-200 hover:border-green-400',
    amber: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    pink: 'bg-pink-50 border-pink-200 hover:border-pink-400',
    cyan: 'bg-cyan-50 border-cyan-200 hover:border-cyan-400',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    teal: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    gray: 'bg-gray-50 border-gray-200 hover:border-gray-400'
  };

  const iconColorClasses = {
    violet: 'text-violet-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    pink: 'text-pink-600',
    cyan: 'text-cyan-600',
    orange: 'text-orange-600',
    indigo: 'text-indigo-600',
    teal: 'text-teal-600',
    gray: 'text-gray-600'
  };

  const statusColorClasses = {
    gray: 'bg-gray-100 text-gray-700',
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 border-2 ${colorClasses[category.color]}`}
        onClick={() => onView(doc)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center ${iconColorClasses[category.color]}`}>
                <Icon.FileText size={20} />
              </div>
              <div>
                <CardTitle className="text-base font-semibold line-clamp-1">
                  {doc.title}
                </CardTitle>
                <p className="text-xs text-gray-500 font-mono">{doc.name}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(doc); }}>
                  <Eye className="w-4 h-4 mr-2" /> Xem
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(doc); }}>
                  <Pencil className="w-4 h-4 mr-2" /> Sửa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(doc); }}>
                  <Copy className="w-4 h-4 mr-2" /> Nhân bản
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(doc); }}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {doc.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {doc.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={statusColorClasses[status.color]}>
                {status.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                v{doc.version || '1.0.0'}
              </Badge>
            </div>
            <span className="text-xs text-gray-400">
              {doc.updated_date ? format(new Date(doc.updated_date), 'dd/MM/yyyy') : '-'}
            </span>
          </div>

          {doc.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {doc.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                  {tag}
                </span>
              ))}
              {doc.tags.length > 3 && (
                <span className="text-xs text-gray-400">+{doc.tags.length - 3}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}