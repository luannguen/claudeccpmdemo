/**
 * AdminVerificationQueue - Admin queue for verification requests
 * UI Layer - Presentation only
 * 
 * @module admin/ecards
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TYPE_CONFIG = {
  email: { icon: 'Mail', label: 'Email', color: 'bg-blue-100 text-blue-700' },
  phone: { icon: 'Phone', label: 'SĐT', color: 'bg-green-100 text-green-700' },
  company: { icon: 'Building', label: 'Công ty', color: 'bg-purple-100 text-purple-700' },
  identity: { icon: 'Fingerprint', label: 'Danh tính', color: 'bg-amber-100 text-amber-700' }
};

const STATUS_CONFIG = {
  pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700' }
};

export default function AdminVerificationQueue({
  pendingRequests = [],
  allRequests = [],
  onApprove,
  onReject,
  isProcessing = false
}) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const handleApprove = async () => {
    if (!selectedRequest) return;
    await onApprove({ requestId: selectedRequest.id, notes: '' });
    setSelectedRequest(null);
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason) return;
    await onReject({ requestId: selectedRequest.id, reason: rejectReason });
    setSelectedRequest(null);
    setRejectReason('');
  };

  const requests = activeTab === 'pending' ? pendingRequests : allRequests;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Yêu cầu xác thực</h3>
          {pendingRequests.length > 0 && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
              {pendingRequests.length} chờ duyệt
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-4 pt-2 border-b">
          <TabsList className="bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="pending"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7CB342] data-[state=active]:shadow-none rounded-none px-4 py-2"
            >
              Chờ duyệt ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7CB342] data-[state=active]:shadow-none rounded-none px-4 py-2"
            >
              Tất cả ({allRequests.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="m-0">
          <div className="max-h-[400px] overflow-y-auto">
            {requests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Icon.CheckCircle size={48} className="mx-auto mb-3 opacity-50" />
                <p>Không có yêu cầu nào</p>
              </div>
            ) : (
              <AnimatePresence>
                {requests.map((request, idx) => {
                  const typeConfig = TYPE_CONFIG[request.type] || TYPE_CONFIG.email;
                  const statusConfig = STATUS_CONFIG[request.status];
                  const TypeIcon = Icon[typeConfig.icon];

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 border-b hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                            {TypeIcon && <TypeIcon size={18} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {request.user_name || request.user_email}
                              </span>
                              <Badge className={statusConfig.color}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              Xác thực {typeConfig.label.toLowerCase()}
                            </p>
                            {request.notes && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                "{request.notes}"
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(request.created_date).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => setSelectedRequest({ ...request, action: 'reject' })}
                            >
                              <Icon.X size={14} />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#7CB342] hover:bg-[#689F38] text-white"
                              onClick={() => setSelectedRequest({ ...request, action: 'approve' })}
                            >
                              <Icon.Check size={14} />
                            </Button>
                          </div>
                        )}

                        {request.evidence_url && (
                          <a
                            href={request.evidence_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Xem chứng cứ
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.action === 'approve' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {selectedRequest?.action === 'approve' ? (
              <p className="text-gray-600">
                Bạn có chắc muốn duyệt yêu cầu xác thực từ{' '}
                <strong>{selectedRequest?.user_name || selectedRequest?.user_email}</strong>?
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-600">Lý do từ chối:</p>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Hủy
            </Button>
            {selectedRequest?.action === 'approve' ? (
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
                className="bg-[#7CB342] hover:bg-[#689F38] text-white"
              >
                {isProcessing ? <Icon.Spinner size={16} /> : 'Duyệt'}
              </Button>
            ) : (
              <Button
                onClick={handleReject}
                disabled={isProcessing || !rejectReason}
                variant="destructive"
              >
                {isProcessing ? <Icon.Spinner size={16} /> : 'Từ chối'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}