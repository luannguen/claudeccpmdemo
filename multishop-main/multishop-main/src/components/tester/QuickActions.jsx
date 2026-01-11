/**
 * QuickActions - Nút bấm nhanh cho tester
 * Pass/Fail nhanh, skip, block
 */

import React from "react";
import { Check, X, SkipForward, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/hooks/useConfirmDialog";
import { useToast } from "@/components/NotificationToast";

export default function QuickActions({ testCase, onSubmit, isSubmitting, disabled }) {
  const { showConfirm } = useConfirmDialog();
  const { addToast } = useToast();

  const handleQuickPass = async () => {
    const confirmed = await showConfirm({
      title: '✅ Đánh dấu Passed',
      message: `Test case "${testCase.title}" đạt yêu cầu?`,
      type: 'success',
      confirmText: 'Passed',
      cancelText: 'Hủy'
    });

    if (confirmed) {
      await onSubmit(testCase.id, {
        status: 'passed',
        actual_result: 'Test case đạt yêu cầu - Quick Pass'
      });
      addToast('Đã đánh dấu test case Passed', 'success');
    }
  };

  const handleQuickFail = async () => {
    const confirmed = await showConfirm({
      title: '❌ Đánh dấu Failed',
      message: `Test case "${testCase.title}" có lỗi?`,
      type: 'danger',
      confirmText: 'Failed - Báo lỗi',
      cancelText: 'Hủy'
    });

    if (confirmed) {
      // Don't submit yet, let user add details
      addToast('Vui lòng mô tả lỗi chi tiết bên dưới', 'warning');
    }
  };

  const handleQuickSkip = async () => {
    const confirmed = await showConfirm({
      title: '⏭️ Bỏ qua test case',
      message: `Bỏ qua test case "${testCase.title}"?`,
      type: 'warning',
      confirmText: 'Skip',
      cancelText: 'Hủy'
    });

    if (confirmed) {
      await onSubmit(testCase.id, {
        status: 'skipped',
        actual_result: 'Test case bị bỏ qua - Quick Skip'
      });
      addToast('Đã bỏ qua test case', 'info');
    }
  };

  const handleQuickBlock = async () => {
    const confirmed = await showConfirm({
      title: '🚫 Đánh dấu Blocked',
      message: `Test case "${testCase.title}" bị chặn (dependencies chưa sẵn sàng)?`,
      type: 'warning',
      confirmText: 'Blocked',
      cancelText: 'Hủy'
    });

    if (confirmed) {
      await onSubmit(testCase.id, {
        status: 'blocked',
        actual_result: 'Test case bị chặn - dependencies chưa sẵn sàng'
      });
      addToast('Đã đánh dấu test case Blocked', 'warning');
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        onClick={handleQuickPass}
        disabled={isSubmitting || disabled}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Check className="w-4 h-4 mr-1" />
        Quick Pass
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleQuickSkip}
        disabled={isSubmitting || disabled}
        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
      >
        <SkipForward className="w-4 h-4 mr-1" />
        Skip
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleQuickBlock}
        disabled={isSubmitting || disabled}
        className="border-orange-300 text-orange-700 hover:bg-orange-50"
      >
        <Ban className="w-4 h-4 mr-1" />
        Block
      </Button>
    </div>
  );
}