/**
 * Batch Testing Toolbar - Test nhiều test cases cùng lúc
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function BatchTestingToolbar({ 
  selectedCount, 
  onClearSelection, 
  onBatchPass, 
  onBatchFail,
  isProcessing 
}) {
  const [batchStatus, setBatchStatus] = useState('passed');

  if (selectedCount === 0) return null;

  const handleBatchSubmit = () => {
    if (batchStatus === 'passed') {
      onBatchPass();
    } else if (batchStatus === 'failed') {
      onBatchFail();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-violet-200 px-6 py-4 flex items-center gap-4">
          <Badge className="bg-violet-100 text-violet-700 text-sm px-3 py-1">
            {selectedCount} test case đã chọn
          </Badge>

          <Select value={batchStatus} onValueChange={setBatchStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passed">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Pass tất cả
                </span>
              </SelectItem>
              <SelectItem value="failed">
                <span className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Fail tất cả
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleBatchSubmit}
            disabled={isProcessing}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {isProcessing ? (
              <>
                <Icon.Spinner className="w-4 h-4" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Icon.Check className="w-4 h-4" />
                Áp dụng
              </>
            )}
          </Button>

          <Button
            onClick={onClearSelection}
            variant="ghost"
            size="icon"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}