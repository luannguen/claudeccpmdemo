/**
 * DisputeButton - Nút báo cáo sự cố trên order detail
 * UI Layer
 */

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import DisputeForm from '@/components/preorder/dispute/DisputeForm';
import { useToast } from '@/components/NotificationToast';
import { DisputeService } from '@/components/services/DisputeService';

export default function DisputeButton({ order }) {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  // Check conditions
  const canDispute = () => {
    // Chỉ dispute được khi đã giao
    if (!['delivered', 'partial_delivered'].includes(order.order_status)) {
      return { allowed: false, reason: 'Chỉ báo cáo được sau khi nhận hàng' };
    }

    // Check 24h window after delivery
    if (order.delivery_date) {
      const deliveryDate = new Date(order.delivery_date);
      const hoursSince = (Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60);
      if (hoursSince > 24) {
        return { allowed: false, reason: 'Đã quá thời hạn 24h sau khi nhận hàng' };
      }
    }

    return { allowed: true };
  };

  const handleSubmit = async (disputeData) => {
    setIsSubmitting(true);
    try {
      const result = await DisputeService.createDispute({
        orderId: disputeData.orderId,
        lotId: disputeData.lotId,
        customerEmail: disputeData.customerEmail,
        customerName: disputeData.customerName,
        customerPhone: disputeData.customerPhone,
        disputeType: disputeData.disputeType,
        description: disputeData.description,
        evidencePhotos: disputeData.evidencePhotos
      });

      if (result.success) {
        addToast('Đã gửi báo cáo sự cố. Chúng tôi sẽ phản hồi trong 24h.', 'success');
        setShowModal(false);
      } else {
        addToast(result.message || 'Không thể tạo báo cáo', 'error');
      }
    } catch (error) {
      addToast('Có lỗi xảy ra', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { allowed, reason } = canDispute();

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowModal(true)}
        disabled={!allowed}
        className="border-red-200 text-red-600 hover:bg-red-50"
      >
        <AlertTriangle className="w-4 h-4 mr-2" />
        Báo cáo sự cố
      </Button>

      {!allowed && (
        <p className="text-xs text-gray-500 mt-1">{reason}</p>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DisputeForm
            orderId={order.id}
            orderNumber={order.order_number}
            customerEmail={order.customer_email}
            customerName={order.customer_name}
            customerPhone={order.customer_phone}
            lotId={order.items?.[0]?.lot_id}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}