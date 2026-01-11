import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';

/**
 * TestCaseFormEnhanced - Form with attachments/screenshots support
 */
export default function TestCaseFormEnhanced({ testCase, onSave, onCancel }) {
  const [formData, setFormData] = useState(testCase || {
    id: `tc_${Date.now()}`,
    title: '',
    steps: '',
    expected: '',
    status: 'pending',
    screenshots: [],
    attachments: [],
    video_url: '',
    environment: 'staging',
    severity: 'major'
  });
  
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();

  const handleFileUpload = async (e, fieldName) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploads = await Promise.all(
        files.map(file => base44.integrations.Core.UploadFile({ file }))
      );
      
      const urls = uploads.map(u => u.file_url);
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...(prev[fieldName] || []), ...urls]
      }));
      
      addToast(`Đã tải lên ${files.length} file`, 'success');
    } catch (error) {
      addToast('Lỗi khi tải file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fieldName, url) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter(u => u !== url)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      addToast('Nhập tiêu đề test case', 'error');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Tiêu đề test case *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="VD: Kiểm tra thêm sản phẩm vào giỏ hàng"
        />
      </div>

      <div>
        <Label>Các bước thực hiện</Label>
        <Textarea
          value={formData.steps}
          onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
          placeholder="1. Truy cập trang sản phẩm&#10;2. Click 'Thêm vào giỏ'&#10;3. Kiểm tra giỏ hàng"
          rows={4}
        />
      </div>

      <div>
        <Label>Kết quả mong đợi</Label>
        <Textarea
          value={formData.expected}
          onChange={(e) => setFormData({ ...formData, expected: e.target.value })}
          placeholder="Sản phẩm được thêm vào giỏ, số lượng badge cập nhật"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Environment</Label>
          <Select value={formData.environment} onValueChange={(v) => setFormData({ ...formData, environment: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Severity (nếu fail)</Label>
          <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blocker">🔴 Blocker</SelectItem>
              <SelectItem value="critical">🟠 Critical</SelectItem>
              <SelectItem value="major">🟡 Major</SelectItem>
              <SelectItem value="minor">🔵 Minor</SelectItem>
              <SelectItem value="trivial">⚪ Trivial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Screenshots */}
      <div>
        <Label className="flex items-center gap-2">
          <Icon.Image size={14} />
          Screenshots
        </Label>
        <div className="mt-2 space-y-2">
          {formData.screenshots?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.screenshots.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => removeFile('screenshots', url)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon.X size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('screenshots-upload').click()}
            disabled={uploading}
          >
            {uploading ? <Icon.Spinner className="mr-2" /> : <Icon.Upload className="mr-2" />}
            Tải ảnh
          </Button>
          <input
            id="screenshots-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e, 'screenshots')}
          />
        </div>
      </div>

      {/* Attachments */}
      <div>
        <Label className="flex items-center gap-2">
          <Icon.Paperclip size={14} />
          Files đính kèm (logs, reports)
        </Label>
        <div className="mt-2 space-y-2">
          {formData.attachments?.length > 0 && (
            <div className="space-y-1">
              {formData.attachments.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                  <Icon.File size={14} className="text-gray-400" />
                  <span className="flex-1 truncate">{url.split('/').pop()}</span>
                  <button
                    type="button"
                    onClick={() => removeFile('attachments', url)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Icon.X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('attachments-upload').click()}
            disabled={uploading}
          >
            {uploading ? <Icon.Spinner className="mr-2" /> : <Icon.Paperclip className="mr-2" />}
            Đính kèm file
          </Button>
          <input
            id="attachments-upload"
            type="file"
            accept=".txt,.log,.pdf,.zip"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e, 'attachments')}
          />
        </div>
      </div>

      {/* Video URL */}
      <div>
        <Label className="flex items-center gap-2">
          <Icon.Video size={14} />
          Video recording URL
        </Label>
        <Input
          value={formData.video_url}
          onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
          placeholder="https://..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
          {testCase ? 'Cập nhật' : 'Thêm Test Case'}
        </Button>
      </div>
    </form>
  );
}