/**
 * TestCaseAssignModal - Modal gán tester cho test case
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Loader2, Check, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TestCaseAssignModal({
  isOpen,
  onClose,
  testCases = [],
  assignedTesters = [],
  onAssign,
  isSubmitting
}) {
  const [selectedTestCases, setSelectedTestCases] = useState([]);
  const [testerEmail, setTesterEmail] = useState('');
  const [errors, setErrors] = useState({});

  const toggleTestCase = (tcId) => {
    setSelectedTestCases(prev => 
      prev.includes(tcId) ? prev.filter(id => id !== tcId) : [...prev, tcId]
    );
  };

  const toggleAll = () => {
    if (selectedTestCases.length === testCases.length) {
      setSelectedTestCases([]);
    } else {
      setSelectedTestCases(testCases.map(tc => tc.id));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!testerEmail?.trim()) {
      newErrors.email = 'Vui lòng nhập email tester';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testerEmail)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (selectedTestCases.length === 0) {
      newErrors.testCases = 'Vui lòng chọn ít nhất 1 test case';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onAssign(selectedTestCases, testerEmail.trim());
    setSelectedTestCases([]);
    setTesterEmail('');
  };

  const selectTester = (email) => {
    setTesterEmail(email);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-violet-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Gán Tester</h2>
                <p className="text-sm text-gray-500">Chọn test case và tester</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Tester Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Tester *
              </label>
              <Input
                value={testerEmail}
                onChange={(e) => setTesterEmail(e.target.value)}
                placeholder="tester@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}

              {/* Quick select from assigned testers */}
              {assignedTesters.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {assignedTesters.map(email => (
                    <Badge 
                      key={email}
                      variant="outline"
                      className="cursor-pointer hover:bg-violet-50"
                      onClick={() => selectTester(email)}
                    >
                      {email}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Test Cases Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4 inline mr-1" />
                  Chọn Test Cases ({selectedTestCases.length}/{testCases.length})
                </label>
                <Button variant="ghost" size="sm" onClick={toggleAll}>
                  {selectedTestCases.length === testCases.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </Button>
              </div>

              <ScrollArea className="h-[200px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {testCases.map((tc, index) => (
                    <div 
                      key={tc.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedTestCases.includes(tc.id) ? 'bg-violet-50' : ''
                      }`}
                      onClick={() => toggleTestCase(tc.id)}
                    >
                      <Checkbox 
                        checked={selectedTestCases.includes(tc.id)}
                        onCheckedChange={() => toggleTestCase(tc.id)}
                      />
                      <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{tc.title}</p>
                        {tc.assigned_tester && (
                          <p className="text-xs text-gray-500">Đã gán: {tc.assigned_tester}</p>
                        )}
                      </div>
                      {tc.status && (
                        <Badge variant="outline" className="text-xs">
                          {tc.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {errors.testCases && (
                <p className="text-sm text-red-500 mt-1">{errors.testCases}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            <p className="text-sm text-gray-500">
              {selectedTestCases.length > 0 && (
                <>Đã chọn <strong>{selectedTestCases.length}</strong> test case</>
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Hủy</Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-violet-600 hover:bg-violet-700 gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Gán Tester
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}