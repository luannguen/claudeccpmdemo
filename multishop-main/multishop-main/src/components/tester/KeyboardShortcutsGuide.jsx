/**
 * KeyboardShortcutsGuide - Hướng dẫn phím tắt (UI Layer)
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Keyboard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const shortcuts = [
  { keys: ['P'], action: 'Đánh dấu Passed' },
  { keys: ['F'], action: 'Đánh dấu Failed' },
  { keys: ['S'], action: 'Đánh dấu Skipped' },
  { keys: ['B'], action: 'Báo Bug nhanh' },
  { keys: ['E'], action: 'Expand/Collapse card' },
  { keys: ['?'], action: 'Hiện bảng phím tắt' },
  { keys: ['Esc'], action: 'Đóng modal' }
];

export default function KeyboardShortcutsGuide() {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShow(true)}
        className="gap-2"
      >
        <Keyboard className="w-4 h-4" />
        Phím tắt
      </Button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShow(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-violet-500" />
                    Phím Tắt
                  </h3>
                  <button
                    onClick={() => setShow(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {shortcuts.map((sc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{sc.action}</span>
                      <div className="flex gap-1">
                        {sc.keys.map((key, j) => (
                          <kbd key={j} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}