/**
 * System Handbook Component
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SystemHandbook({ searchQuery }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Settings size={24} className="text-blue-600" />
            Cài Đặt Hệ Thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hướng dẫn email templates, notifications, security (đang phát triển...)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}