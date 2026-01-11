/**
 * TestProgressIndicator - Thanh progress cho test case đang test
 * Hiển thị: Steps completed, time elapsed, estimated time remaining
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function TestProgressIndicator({ testCase, onStepComplete }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);

  // Parse steps (assume steps are separated by newlines or numbers)
  const totalSteps = testCase.steps?.split('\n').filter(s => s.trim()).length || 1;
  const progress = (completedSteps / totalSteps) * 100;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const avgTimePerStep = elapsedSeconds > 0 && completedSteps > 0 
    ? Math.round(elapsedSeconds / completedSteps) 
    : 30; // Default estimate
  
  const estimatedRemaining = (totalSteps - completedSteps) * avgTimePerStep;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-200"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-violet-500" />
          Tiến độ test
        </h4>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
          {completedSteps > 0 && (
            <span className="text-violet-600">
              ~{formatTime(estimatedRemaining)} còn lại
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Bước {completedSteps} / {totalSteps}</span>
          <span className="font-medium text-violet-600">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step tracker */}
      <div className="mt-3 flex flex-wrap gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCompletedSteps(i + 1);
              if (onStepComplete) onStepComplete(i + 1);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              i < completedSteps 
                ? 'bg-green-500 text-white' 
                : i === completedSteps 
                  ? 'bg-violet-500 text-white ring-2 ring-violet-300' 
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            }`}
          >
            {i < completedSteps ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </button>
        ))}
      </div>
    </motion.div>
  );
}