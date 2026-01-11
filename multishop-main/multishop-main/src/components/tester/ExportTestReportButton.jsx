/**
 * Export Test Report Button - Xuất báo cáo test thành PDF
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ExportTestReportButton({ feature, testCases, testerName }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    
    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text('Test Report', 20, 20);

      // Feature info
      doc.setFontSize(12);
      doc.text(`Feature: ${feature.name}`, 20, 35);
      doc.text(`Version: ${feature.version || 'N/A'}`, 20, 42);
      doc.text(`Tester: ${testerName}`, 20, 49);
      doc.text(`Date: ${new Date().toLocaleDateString('vi-VN')}`, 20, 56);

      // Test stats
      const passed = testCases.filter(tc => tc.status === 'passed').length;
      const failed = testCases.filter(tc => tc.status === 'failed').length;
      const pending = testCases.filter(tc => tc.status === 'pending').length;

      doc.setFontSize(14);
      doc.text('Test Summary', 20, 70);
      doc.setFontSize(10);
      doc.text(`Total: ${testCases.length} | Passed: ${passed} | Failed: ${failed} | Pending: ${pending}`, 20, 78);

      // Test cases
      doc.setFontSize(12);
      doc.text('Test Cases', 20, 92);
      
      let y = 100;
      testCases.forEach((tc, i) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(10);
        const statusSymbol = tc.status === 'passed' ? '✓' : tc.status === 'failed' ? '✗' : '○';
        doc.text(`${i + 1}. ${statusSymbol} ${tc.title}`, 20, y);
        
        doc.setFontSize(8);
        doc.setTextColor(100);
        
        if (tc.status === 'failed' && tc.error_description) {
          doc.text(`   Error: ${tc.error_description.substring(0, 80)}`, 20, y + 6);
          y += 12;
        } else {
          y += 8;
        }
        
        doc.setTextColor(0);
      });

      // Footer
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }

      // Save
      doc.save(`test-report-${feature.name.replace(/\s/g, '-')}-${Date.now()}.pdf`);
      toast.success('Báo cáo đã được tải xuống');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất báo cáo');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exporting || !testCases || testCases.length === 0}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {exporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      Xuất báo cáo
    </Button>
  );
}