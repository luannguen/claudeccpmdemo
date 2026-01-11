/**
 * ExportTestReportAdmin - Export báo cáo test cho Admin
 */

import React, { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/NotificationToast";

export default function ExportTestReportAdmin({ testResults }) {
  const { addToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!testResults?.testCases?.length) {
      addToast('Không có dữ liệu để export', 'warning');
      return;
    }

    setIsExporting(true);
    try {
      // Create CSV content
      const headers = [
        'Feature',
        'Category',
        'Test Case',
        'Status',
        'Tester',
        'Tested At',
        'Environment',
        'Severity',
        'Error Code',
        'Pass/Fail'
      ];

      const rows = testResults.testCases.map(tc => [
        tc.featureName || '',
        tc.featureCategory || '',
        tc.title || '',
        tc.status || '',
        tc.tester_name || tc.tester_email || '',
        tc.tested_at || '',
        tc.environment || '',
        tc.severity || '',
        tc.error_code || '',
        tc.status === 'passed' ? 'Pass' : tc.status === 'failed' ? 'Fail' : 'Pending'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `test-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast('Đã export báo cáo test', 'success');
    } catch (error) {
      addToast('Không thể export báo cáo', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleExport}
      disabled={isExporting || !testResults?.testCases?.length}
    >
      <Download className="w-4 h-4 mr-2" />
      {isExporting ? 'Đang export...' : 'Export CSV'}
    </Button>
  );
}