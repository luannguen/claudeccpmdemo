/**
 * 📋 Return Detail Modal - Full return info + admin actions
 */

import React, { useState } from 'react';
import { 
  X, Package, User, Phone, Mail, MapPin, Calendar, 
  CheckCircle, XCircle, Truck, DollarSign, AlertCircle,
  Image as ImageIcon, FileText
} from 'lucide-react';
import EnhancedModal from '../EnhancedModal';
import ReturnTimeline from './ReturnTimeline';
import ReturnService from './ReturnService';
import { useQueryClient } from '@tanstack/react-query';

export default function ReturnDetailModal({ isOpen, onClose, returnRequest, isAdmin }) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  const handleApprove = async () => {
    if (!adminNotes.trim()) {
      alert('Vui lòng nhập ghi chú');
      return;
    }
    setIsApproving(true);
    try {
      await ReturnService.approveReturn(returnRequest, 'admin@email.com', adminNotes);
      await queryClient.invalidateQueries({ queryKey: ['admin-returns-realtime'] });
      await queryClient.invalidateQueries({ queryKey: ['customer-returns-realtime'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['my-orders-list'] });
      await queryClient.refetchQueries({ type: 'active' });
      alert('✅ Đã duyệt yêu cầu trả hàng');
      onClose();
    } catch (error) {
      alert('❌ Có lỗi: ' + error.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    setIsRejecting(true);
    try {
      await ReturnService.rejectReturn(returnRequest, 'admin@email.com', rejectionReason);
      await queryClient.invalidateQueries({ queryKey: ['admin-returns-realtime'] });
      await queryClient.invalidateQueries({ queryKey: ['customer-returns-realtime'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['my-orders-list'] });
      await queryClient.refetchQueries({ type: 'active' });
      alert('❌ Đã từ chối yêu cầu');
      onClose();
    } catch (error) {
      alert('❌ Có lỗi: ' + error.message);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleMarkReceived = async () => {
    try {
      await ReturnService.markReturnReceived(returnRequest, 'admin@email.com');
      await queryClient.invalidateQueries({ queryKey: ['admin-returns-realtime'] });
      await queryClient.invalidateQueries({ queryKey: ['customer-returns-realtime'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['my-orders-list'] });
      await queryClient.refetchQueries({ type: 'active' });
      alert('✅ Đã đánh dấu nhận hàng và xử lý hoàn tiền');
      onClose();
    } catch (error) {
      alert('❌ Có lỗi: ' + error.message);
    }
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi Tiết Trả Hàng #${returnRequest.order_number}`}
      maxWidth="4xl"
    >
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Customer Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-[#7CB342]" />
            Thông Tin Khách Hàng
          </h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{returnRequest.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{returnRequest.customer_phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{returnRequest.customer_email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">
                {new Date(returnRequest.created_date).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        {/* Return Items */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#7CB342]" />
            Sản Phẩm Trả
          </h3>
          <div className="space-y-2">
            {returnRequest.return_items?.map((item, idx) => (
              <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{item.product_name}</p>
                  <p className="text-sm text-gray-600">SL: {item.quantity} x {item.unit_price.toLocaleString()}đ</p>
                </div>
                <p className="font-bold text-[#7CB342]">{item.return_amount.toLocaleString()}đ</p>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Tổng hoàn trả:</span>
              <span className="text-2xl font-bold text-[#7CB342]">
                {returnRequest.total_return_amount.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </div>

        {/* Return Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Lý do trả hàng:</p>
            <p className="font-bold text-gray-900">{returnRequest.return_reason}</p>
            {returnRequest.reason_detail && (
              <p className="text-sm text-gray-700 mt-2">{returnRequest.reason_detail}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Hình thức hoàn tiền:</p>
            <p className="font-bold text-gray-900">{returnRequest.refund_method}</p>
          </div>
        </div>

        {/* Evidence Photos */}
        {returnRequest.evidence_photos?.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#7CB342]" />
              Hình Ảnh Chứng Minh
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {returnRequest.evidence_photos.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`Evidence ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <ReturnTimeline returnRequest={returnRequest} />

        {/* Admin Actions */}
        {isAdmin && returnRequest.status === 'pending' && (
          <div className="border-t-2 border-gray-200 pt-6 space-y-4">
            <h3 className="font-bold text-gray-900 mb-3">Hành Động Admin</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú duyệt:
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#7CB342] focus:outline-none resize-none"
                rows={3}
                placeholder="Nhập ghi chú khi duyệt..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={isApproving || !adminNotes.trim()}
                className="flex-1 bg-green-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {isApproving ? 'Đang duyệt...' : 'Duyệt Yêu Cầu'}
              </button>
              <button
                onClick={() => setIsRejecting(true)}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-600 flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Từ Chối
              </button>
            </div>

            {isRejecting && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <label className="block text-sm font-medium text-red-900 mb-2">
                  Lý do từ chối:
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Nhập lý do từ chối..."
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim()}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
                  >
                    Xác Nhận Từ Chối
                  </button>
                  <button
                    onClick={() => setIsRejecting(false)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isAdmin && returnRequest.status === 'approved' && (
          <button
            onClick={handleMarkReceived}
            className="w-full bg-[#7CB342] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#FF9800] flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            Đánh Dấu Đã Nhận Hàng
          </button>
        )}
      </div>
    </EnhancedModal>
  );
}