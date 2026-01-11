/**
 * DesignDocViewModal - Modal xem chi tiết document
 */
import React from 'react';
import EnhancedModal from '@/components/EnhancedModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { CATEGORY_CONFIG, STATUS_CONFIG } from '@/components/hooks/useDesignDocs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { Pencil, Copy, Download, Printer } from 'lucide-react';

// Icons imported from lucide-react (not AnimatedIcon) for this specific modal controls

export default function DesignDocViewModal({ isOpen, onClose, doc, onEdit }) {
  if (!doc) return null;

  const category = CATEGORY_CONFIG[doc.category] || CATEGORY_CONFIG.rules;
  const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.draft;

  const statusColorClasses = {
    gray: 'bg-gray-100 text-gray-700',
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700'
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(doc.content);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${doc.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1, h2, h3 { margin-top: 24px; }
            code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
            pre { background: #1f2937; color: #e5e7eb; padding: 16px; border-radius: 8px; overflow-x: auto; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
            th { background: #f9fafb; }
          </style>
        </head>
        <body>
          <h1>${doc.title}</h1>
          <p><em>Version ${doc.version} | ${format(new Date(), 'dd/MM/yyyy')}</em></p>
          <hr/>
          ${doc.content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={doc.title}
      maxWidth="5xl"
    >
      <div className="p-6">
        {/* Header Info */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center gap-4">
            <Badge className={`${statusColorClasses[status.color]}`}>
              {status.label}
            </Badge>
            <Badge variant="outline">{category.label}</Badge>
            <Badge variant="secondary">v{doc.version}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy nội dung">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePrint} title="In">
              <Printer className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(doc)}>
              <Pencil className="w-4 h-4 mr-1" /> Chỉnh sửa
            </Button>
          </div>
        </div>

        {/* Meta Info */}
        <div className="grid md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg text-sm">
          <div>
            <span className="text-gray-500">Tên file:</span>
            <span className="ml-2 font-mono">{doc.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Cập nhật:</span>
            <span className="ml-2">
              {doc.updated_date ? format(new Date(doc.updated_date), 'dd/MM/yyyy HH:mm') : '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Người sửa:</span>
            <span className="ml-2">{doc.last_editor || doc.created_by || '-'}</span>
          </div>
        </div>

        {/* Tags */}
        {doc.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {doc.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Description */}
        {doc.description && (
          <div className="mb-6 p-4 bg-violet-50 rounded-lg border border-violet-200">
            <p className="text-gray-700">{doc.description}</p>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-violet-700 prose-table:border prose-th:bg-gray-50">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {doc.content}
          </ReactMarkdown>
        </div>

        {/* Changelog */}
        {doc.changelog?.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon.Clock size={18} /> Lịch sử thay đổi
            </h3>
            <div className="space-y-3">
              {doc.changelog.map((log, idx) => (
                <div key={idx} className="flex items-start gap-4 text-sm p-3 bg-gray-50 rounded-lg">
                  <Badge variant="outline">{log.version}</Badge>
                  <div>
                    <span className="text-gray-500">{log.date}</span>
                    <p className="text-gray-700 mt-1">{log.changes}</p>
                    {log.author && <span className="text-xs text-gray-400">— {log.author}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </EnhancedModal>
  );
}