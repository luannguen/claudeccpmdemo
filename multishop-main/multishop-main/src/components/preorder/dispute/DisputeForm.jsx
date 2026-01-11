/**
 * DisputeForm - Form tạo dispute/khiếu nại
 * UI Layer
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, Upload, Camera, X, 
  Clock, Package, Truck, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { base44 } from '@/api/base44Client';
import { DISPUTE_TYPE } from '@/components/services/DisputeService';

const DISPUTE_TYPES = [
  { 
    value: DISPUTE_TYPE.DELIVERY_DELAY, 
    label: 'Giao hàng trễ',
    icon: Clock,
    description: 'Đơn hàng chưa giao đúng ngày dự kiến'
  },
  { 
    value: DISPUTE_TYPE.PARTIAL_DELIVERY, 
    label: 'Giao thiếu hàng',
    icon: Package,
    description: 'Số lượng nhận được ít hơn đặt'
  },
  { 
    value: DISPUTE_TYPE.QUALITY_ISSUE, 
    label: 'Vấn đề chất lượng',
    icon: AlertCircle,
    description: 'Sản phẩm không đạt chất lượng'
  },
  { 
    value: DISPUTE_TYPE.DAMAGED_GOODS, 
    label: 'Hàng bị hư hỏng',
    icon: AlertTriangle,
    description: 'Sản phẩm bị hư hại khi nhận'
  },
  { 
    value: DISPUTE_TYPE.WRONG_SPECIFICATION, 
    label: 'Sai quy cách',
    icon: Package,
    description: 'Sản phẩm không đúng mô tả'
  },
  { 
    value: DISPUTE_TYPE.NOT_AS_DESCRIBED, 
    label: 'Không như mô tả',
    icon: AlertCircle,
    description: 'Sản phẩm khác với hình ảnh/mô tả'
  }
];

export default function DisputeForm({ 
  orderId, 
  orderNumber,
  customerEmail,
  customerName,
  customerPhone,
  lotId,
  onSubmit,
  onCancel,
  isLoading = false
}) {
  const [disputeType, setDisputeType] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await base44.integrations.Core.UploadFile({ file });
        return result.file_url;
      });
      
      const urls = await Promise.all(uploadPromises);
      setPhotos(prev => [...prev, ...urls]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!disputeType || !description.trim()) return;

    onSubmit({
      orderId,
      lotId,
      customerEmail,
      customerName,
      customerPhone,
      disputeType,
      description: description.trim(),
      evidencePhotos: photos
    });
  };

  const isValid = disputeType && description.trim().length >= 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Báo cáo sự cố</h2>
        <p className="text-sm text-gray-500 mt-1">
          Đơn hàng #{orderNumber}
        </p>
      </div>

      {/* Dispute Type Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Loại sự cố *</Label>
        <RadioGroup value={disputeType} onValueChange={setDisputeType}>
          <div className="grid gap-3">
            {DISPUTE_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    disputeType === type.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value={type.value} className="mt-1" />
                  <Icon className={`w-5 h-5 mt-0.5 ${
                    disputeType === type.value ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Mô tả chi tiết *</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả chi tiết vấn đề bạn gặp phải (tối thiểu 10 ký tự)..."
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-gray-500 text-right">
          {description.length}/500
        </p>
      </div>

      {/* Photo Upload */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Ảnh chứng minh (nếu có)</Label>
        <p className="text-xs text-gray-500 mb-2">
          Tải lên ảnh để giúp xử lý nhanh hơn
        </p>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {photos.map((url, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={url}
                  alt={`Evidence ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <>
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-sm text-blue-600">Đang tải lên...</span>
            </>
          ) : (
            <>
              <Camera className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Nhấn để chọn ảnh</span>
              <span className="text-xs text-gray-400">Tối đa 5 ảnh</span>
            </>
          )}
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="flex-1 bg-red-600 hover:bg-red-700"
        >
          {isLoading ? 'Đang gửi...' : 'Gửi báo cáo'}
        </Button>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-500 text-center">
        Chúng tôi sẽ phản hồi trong vòng 24h. Vui lòng theo dõi thông báo.
      </p>
    </div>
  );
}