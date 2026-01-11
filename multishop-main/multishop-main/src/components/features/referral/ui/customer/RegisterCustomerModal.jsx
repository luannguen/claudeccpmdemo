/**
 * RegisterCustomerModal Component
 * UI Layer - Form for registering new customers
 * 
 * @module features/referral/ui/customer
 */

import React, { useState } from 'react';
import { UserPlus, Phone, User, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function RegisterCustomerModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting 
}) {
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.name?.trim()) {
      newErrors.name = 'Vui lòng nhập tên khách hàng';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      phone: formData.phone.replace(/\s/g, ''),
      name: formData.name.trim(),
      email: formData.email?.trim() || null
    });
  };

  const handleClose = () => {
    setFormData({ phone: '', name: '', email: '' });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#7CB342]" />
            Đăng Ký Khách Hàng Mới
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin khách hàng bạn muốn giới thiệu
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="0987654321"
              className={errors.phone ? 'border-red-400' : ''}
              autoFocus
            />
            {errors.phone && (
              <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <Label className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Họ tên <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nguyễn Văn A"
              className={errors.name ? 'border-red-400' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Email <span className="text-gray-400 text-xs">(Tùy chọn)</span>
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              className={errors.email ? 'border-red-400' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <p className="font-medium mb-1">📌 Lưu ý:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Khách hàng sẽ được gán cho bạn</li>
              <li>Mọi đơn hàng sau này sẽ tính hoa hồng cho bạn</li>
              <li>Không thể chuyển cho CTV khác (trừ admin)</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#7CB342] hover:bg-[#5a8f31]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Đăng ký
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}