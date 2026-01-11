/**
 * VerificationRequestForm - Form to request verification
 * UI Layer - Presentation only
 * 
 * @module features/ecard/ui
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { base44 } from '@/api/base44Client';

const VERIFICATION_TYPES = [
  { value: 'email', label: 'Xác thực Email', icon: 'Mail', description: 'Xác nhận email là của bạn' },
  { value: 'phone', label: 'Xác thực SĐT', icon: 'Phone', description: 'Xác nhận số điện thoại' },
  { value: 'company', label: 'Xác thực Công ty', icon: 'Building', description: 'Xác nhận bạn làm việc tại công ty' },
  { value: 'identity', label: 'Xác thực Danh tính', icon: 'Fingerprint', description: 'Xác nhận danh tính bằng CMND/CCCD' }
];

export default function VerificationRequestForm({ 
  onSubmit, 
  isSubmitting = false,
  existingRequests = []
}) {
  const [type, setType] = useState('');
  const [notes, setNotes] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEvidenceFile(file_url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type) return;

    await onSubmit({
      type,
      notes,
      evidence_url: evidenceFile
    });

    // Reset form
    setType('');
    setNotes('');
    setEvidenceFile(null);
  };

  // Check which types are already pending/approved
  const getPendingOrApproved = (t) => {
    return existingRequests.find(r => r.type === t && ['pending', 'approved'].includes(r.status));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="mb-2 block">Loại xác thực</Label>
        <div className="grid grid-cols-2 gap-3">
          {VERIFICATION_TYPES.map((vt) => {
            const existing = getPendingOrApproved(vt.value);
            const IconComponent = Icon[vt.icon];
            
            return (
              <motion.button
                key={vt.value}
                type="button"
                disabled={!!existing}
                onClick={() => !existing && setType(vt.value)}
                whileHover={!existing ? { scale: 1.02 } : {}}
                whileTap={!existing ? { scale: 0.98 } : {}}
                className={`p-4 rounded-xl border text-left transition-all ${
                  type === vt.value 
                    ? 'border-[#7CB342] bg-[#7CB342]/5 ring-2 ring-[#7CB342]/30' 
                    : existing
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {IconComponent && (
                    <div className={`p-2 rounded-lg ${
                      type === vt.value ? 'bg-[#7CB342]/20 text-[#558B2F]' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <IconComponent size={18} />
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{vt.label}</span>
                </div>
                <p className="text-xs text-gray-500">{vt.description}</p>
                {existing && (
                  <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${
                    existing.status === 'approved' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {existing.status === 'approved' ? 'Đã xác thực' : 'Đang chờ'}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {type && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="evidence">Tài liệu chứng minh (nếu có)</Label>
            <div className="mt-2">
              {evidenceFile ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Icon.CheckCircle size={20} className="text-green-600" />
                  <span className="text-sm text-green-700 flex-1 truncate">Đã tải lên</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEvidenceFile(null)}
                  >
                    <Icon.X size={16} />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                  {uploading ? (
                    <Icon.Spinner size={24} className="text-gray-400" />
                  ) : (
                    <>
                      <Icon.Upload size={24} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Click để tải lên</span>
                      <span className="text-xs text-gray-400 mt-1">PNG, JPG, PDF (max 5MB)</span>
                    </>
                  )}
                  <Input
                    id="evidence"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Ghi chú thêm</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mô tả thêm về yêu cầu xác thực..."
              className="mt-2"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !type}
            className="w-full bg-[#7CB342] hover:bg-[#689F38] text-white"
          >
            {isSubmitting ? (
              <>
                <Icon.Spinner size={18} className="mr-2" />
                Đang gửi...
              </>
            ) : (
              <>
                <Icon.Send size={18} className="mr-2" />
                Gửi yêu cầu xác thực
              </>
            )}
          </Button>
        </motion.div>
      )}
    </form>
  );
}