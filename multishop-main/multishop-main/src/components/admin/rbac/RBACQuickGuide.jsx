/**
 * RBACQuickGuide - Hướng dẫn nhanh roles và use cases
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/AnimatedIcon.jsx";

const ROLE_USE_CASES = [
  {
    role: 'admin',
    level: 100,
    color: '#DC2626',
    title: 'Super Admin',
    useCase: 'Owner/Founder - Toàn quyền',
    permissions: 'Tất cả (*)',
    icon: 'Crown'
  },
  {
    role: 'system_admin',
    level: 95,
    color: '#7C3AED',
    title: 'Quản Lý Hệ Thống',
    useCase: 'IT Manager - Quản lý hệ thống, settings, security',
    permissions: 'system.*, settings.*, users.view/update',
    icon: 'Shield'
  },
  {
    role: 'hr_manager',
    level: 90,
    color: '#EC4899',
    title: 'Quản Lý Nhân Sự',
    useCase: 'HR - Quản lý users, roles, permissions',
    permissions: 'users.*, settings.view',
    icon: 'Users'
  },
  {
    role: 'sales_manager',
    level: 85,
    color: '#F59E0B',
    title: 'Quản Lý Bán Hàng',
    useCase: 'Sales Director - Đơn hàng, khách hàng, reports',
    permissions: 'orders.*, customers.*, reports.*, bookings.*',
    icon: 'TrendingUp'
  },
  {
    role: 'content_manager',
    level: 80,
    color: '#06B6D4',
    title: 'Quản Lý Nội Dung',
    useCase: 'Content Director - CMS, community, marketing',
    permissions: 'cms.*, community.manage, books.manage',
    icon: 'FileText'
  },
  {
    role: 'test_manager',
    level: 75,
    color: '#8B5CF6',
    title: 'Quản Lý Test',
    useCase: 'QA Lead - Quản lý features, testers, testing',
    permissions: 'features.*, testers.manage',
    icon: 'TestTube'
  },
  {
    role: 'community_manager',
    level: 70,
    color: '#10B981',
    title: 'Quản Lý Cộng Đồng',
    useCase: 'Community Manager - Kiểm duyệt, moderate',
    permissions: 'community.*, reviews.approve',
    icon: 'MessageCircle'
  },
  {
    role: 'ui_manager',
    level: 65,
    color: '#3B82F6',
    title: 'Quản Lý Giao Diện',
    useCase: 'UI/UX Manager - CMS structure, pages',
    permissions: 'cms.manage, settings.view',
    icon: 'Layout'
  },
  {
    role: 'loyalty_manager',
    level: 60,
    color: '#F97316',
    title: 'Quản Lý Loyalty',
    useCase: 'Loyalty Manager - Chương trình loyalty',
    permissions: 'loyalty.*, customers.view',
    icon: 'Award'
  },
  {
    role: 'booking_manager',
    level: 55,
    color: '#14B8A6',
    title: 'Quản Lý Lịch Hẹn',
    useCase: 'Booking Coordinator - Quản lý bookings',
    permissions: 'bookings.*, customers.view',
    icon: 'Calendar'
  },
  {
    role: 'staff',
    level: 50,
    color: '#2563EB',
    title: 'Nhân Viên Bán Hàng',
    useCase: 'Staff - Xử lý đơn hàng, sản phẩm',
    permissions: 'products.view/update, orders.view/update',
    icon: 'User'
  },
  {
    role: 'tester',
    level: 45,
    color: '#A855F7',
    title: 'Nhân Viên Test',
    useCase: 'Tester - Chỉ xem và test (READ ONLY)',
    permissions: 'features.view, testers.view (không create/edit/delete)',
    icon: 'Bug',
    highlight: true
  },
  {
    role: 'accountant',
    level: 40,
    color: '#059669',
    title: 'Kế Toán',
    useCase: 'Accountant - Xem báo cáo, đơn hàng',
    permissions: 'reports.*, orders.view',
    icon: 'Wallet'
  },
  {
    role: 'content_editor',
    level: 30,
    color: '#0EA5E9',
    title: 'Biên Tập Viên',
    useCase: 'Content Editor - Tạo/sửa nội dung',
    permissions: 'cms.view/create/update',
    icon: 'Pencil'
  }
];

export default function RBACQuickGuide() {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Info className="text-violet-600" />
            Hướng Dẫn Roles & Use Cases
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ROLE_USE_CASES.map((r) => (
            <div 
              key={r.role}
              className={`p-4 rounded-lg border ${
                r.highlight ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Badge 
                    className="text-xs font-mono"
                    style={{ backgroundColor: r.color, color: 'white' }}
                  >
                    L{r.level}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{r.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{r.useCase}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="font-medium">Permissions:</span> {r.permissions}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Icon.AlertCircle className="text-orange-600 mt-1" />
            <div>
              <h4 className="font-bold text-orange-900 mb-2">⚠️ Lưu Ý Quan Trọng</h4>
              <ul className="space-y-1 text-sm text-orange-800">
                <li>• <strong>Tester role</strong>: Chỉ xem và submit test results - KHÔNG được sửa/xóa features</li>
                <li>• <strong>Test Manager</strong>: Full quyền features & testers - phù hợp cho QA Lead</li>
                <li>• <strong>Admin role</strong>: Chỉ owner - đừng assign cho ai khác</li>
                <li>• Mỗi role có level → role cao hơn có thể quản lý role thấp hơn</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}