/**
 * TestTimeline - Timeline hoạt động test theo thời gian (UI Layer)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function TestTimeline({ dailyStats }) {
  if (!dailyStats || dailyStats.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-violet-500" />
          Hoạt Động 7 Ngày Qua
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dailyStats.map((day, i) => (
            <div key={day.date} className="flex items-center gap-3">
              <div className="text-right w-16">
                <p className="text-xs font-medium text-gray-600">
                  {format(new Date(day.date), 'dd/MM', { locale: vi })}
                </p>
                <p className="text-xs text-gray-400">
                  {format(new Date(day.date), 'EEE', { locale: vi })}
                </p>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="flex h-full">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${(day.passed / day.total) * 100}%` }}
                      />
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(day.failed / day.total) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-8 text-right">
                    {day.total}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    {day.passed}
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle className="w-3 h-3" />
                    {day.failed}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}