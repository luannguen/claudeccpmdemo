/**
 * ContactExportButton - Export connections to vCard/Excel
 * Feature Enhancement #4
 */

import React, { useState } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { useToast } from "@/components/NotificationToast";

export default function ContactExportButton({ connections = [] }) {
  const [exporting, setExporting] = useState(false);
  const { addToast } = useToast();

  const exportToVCard = () => {
    setExporting(true);
    
    try {
      const vCards = connections.map(conn => {
        return `BEGIN:VCARD
VERSION:3.0
FN:${conn.target_name}
TEL:${conn.target_phone || ''}
EMAIL:${conn.target_email || ''}
ORG:${conn.target_company || ''}
TITLE:${conn.target_title || ''}
NOTE:${conn.notes || ''}
END:VCARD`;
      }).join('\n\n');

      const blob = new Blob([vCards], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts-${Date.now()}.vcf`;
      a.click();
      URL.revokeObjectURL(url);

      addToast('Đã xuất danh bạ thành công', 'success');
    } catch (error) {
      addToast('Không thể xuất file', 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    setExporting(true);
    
    try {
      const headers = ['Tên', 'Công ty', 'Chức vụ', 'Email', 'SĐT', 'Ghi chú', 'Tags'];
      const rows = connections.map(conn => [
        conn.target_name,
        conn.target_company || '',
        conn.target_title || '',
        conn.target_email || '',
        conn.target_phone || '',
        conn.notes || '',
        (conn.tags || []).join('; ')
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      addToast('Đã xuất Excel thành công', 'success');
    } catch (error) {
      addToast('Không thể xuất file', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative group">
      <button
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        disabled={exporting || connections.length === 0}
      >
        {exporting ? (
          <>
            <Icon.Spinner size={18} />
            <span>Đang xuất...</span>
          </>
        ) : (
          <>
            <Icon.Download size={18} />
            <span>Xuất danh bạ</span>
          </>
        )}
      </button>

      {!exporting && connections.length > 0 && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[180px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
          <button
            onClick={exportToVCard}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
          >
            <Icon.FileText size={16} />
            <span>vCard (.vcf)</span>
          </button>
          <button
            onClick={exportToCSV}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
          >
            <Icon.File size={16} />
            <span>Excel (.csv)</span>
          </button>
        </div>
      )}
    </div>
  );
}