/**
 * Admin Handbook - Sổ Tay Hướng Dẫn Admin
 * 
 * Document đầy đủ về Loyalty & Referral System
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createPageUrl } from '@/utils';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import ReferralHandbook from '@/components/handbook/ReferralHandbook';
import LoyaltyHandbook from '@/components/handbook/LoyaltyHandbook';
import OrderHandbook from '@/components/handbook/OrderHandbook';
import SystemHandbook from '@/components/handbook/SystemHandbook';
import PreOrderHandbook from '@/components/handbook/PreOrderHandbook';
import SaasMultishopHandbook from '@/components/handbook/SaasMultishopHandbook';
import { CATEGORY_CONFIG } from '@/components/hooks/useDesignDocs';

function AdminHandbookContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Icon.FileText size={32} className="text-blue-600" />
            Sổ Tay Admin
          </h1>
          <p className="text-gray-500 mt-1">Hướng dẫn đầy đủ về hệ thống</p>
        </div>
      </div>

      {/* Quick Search */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="relative">
            <Icon.Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm hướng dẫn, khái niệm, thuật ngữ..."
              className="pl-10 bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">
            <Icon.Home size={16} className="mr-2" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="design">
            <Icon.FileText size={16} className="mr-2" />
            Design System
          </TabsTrigger>
          <TabsTrigger value="saas">
            <Icon.Store size={16} className="mr-2" />
            SaaS Multi-Shop
          </TabsTrigger>
          <TabsTrigger value="referral">
            <Icon.Gift size={16} className="mr-2" />
            Referral
          </TabsTrigger>
          <TabsTrigger value="loyalty">
            <Icon.Star size={16} className="mr-2" />
            Loyalty
          </TabsTrigger>
          <TabsTrigger value="preorder">
            <Icon.Package size={16} className="mr-2" />
            Pre-Order
          </TabsTrigger>
          <TabsTrigger value="order">
            <Icon.ShoppingCart size={16} className="mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="system">
            <Icon.Settings size={16} className="mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-violet-300" onClick={() => setActiveTab('design')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon.FileText size={24} className="text-violet-600" />
                  Design System Package
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Quản lý UI/UX rules, design tokens, component specs, patterns
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>10 Document Categories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>CRUD Interface</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>Version Control</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-indigo-300" onClick={() => setActiveTab('saas')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon.Store size={24} className="text-indigo-600" />
                  SaaS Multi-Shop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Hệ thống SaaS Multi-tenant: Commission, Billing, Isolation, Usage, Marketplace
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>5 Phases Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>24 Files Created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>100% Automated</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('referral')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon.Gift size={24} className="text-amber-500" />
                  Hệ Thống Giới Thiệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Quản lý CTV, tính hoa hồng tự động, hệ thống Người Gieo Hạt 7 cấp bậc
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>Commission Tiers (1-3%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>Seeder Ranks (7 cấp)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>Fraud Detection</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('loyalty')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon.Star size={24} className="text-violet-500" />
                  Hệ Thống Loyalty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Tích điểm thưởng, 4 hạng thành viên, quyền lợi đặc biệt
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>4 Tiers: Đồng → Bạch Kim</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>Points Earn & Redeem</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>Auto Expiration</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('preorder')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon.Package size={24} className="text-green-500" />
                  Hệ Thống Bán Trước
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Escrow, Dispute, Fulfillment, Auto Compensation, Analytics
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>10 Entities mới</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>7 Services</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>Complete workflow</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('order')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon.ShoppingCart size={24} className="text-blue-500" />
                  Quản Lý Đơn Hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Workflow đơn hàng, COD, payment integration
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('system')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon.Settings size={24} className="text-blue-500" />
                  Cài Đặt Hệ Thống
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Email templates, notifications, security, permissions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <Card className="mt-6 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
            <CardHeader>
              <CardTitle className="text-lg">🚀 Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">1. Kích hoạt Referral</h4>
                <p className="text-sm text-gray-600">Admin Settings → Referral → Enable Program</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. Duyệt CTV mới</h4>
                <p className="text-sm text-gray-600">Referral Members → Pending → Approve</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">3. Xem analytics</h4>
                <p className="text-sm text-gray-600">Dashboards → Referral/Loyalty tabs</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design System */}
        <TabsContent value="design" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon.FileText size={24} className="text-violet-600" />
                Design System Documentation Package
                <Badge className="bg-violet-100 text-violet-700">ADMIN-F11</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                Hệ thống quản lý tài liệu thiết kế toàn diện - UI/UX rules, design tokens, component specs, và các quy ước đặt tên.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                  <div key={key} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon.FileText size={16} className="text-violet-600" />
                      <h4 className="font-medium">{cfg.label}</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {key === 'rules' && 'Mobile-first, typography, spacing, color, accessibility'}
                      {key === 'tokens' && 'Spacing scale, color palette, fonts, shadows, z-index'}
                      {key === 'components' && 'Props, states, variants của từng component'}
                      {key === 'patterns' && 'Product Card, List/Grid, Modal, Bottom Nav'}
                      {key === 'flows' && 'Browse→Cart, Search→Filter, Checkout flow'}
                      {key === 'architecture' && 'Content priority, placement rules'}
                      {key === 'states' && 'Loading, Empty, Error, Success, Disabled'}
                      {key === 'mapping' && 'Field mapping, display priority, missing data'}
                      {key === 'naming' && 'Components, variants, tokens, files'}
                      {key === 'changelog' && 'Version tracking, breaking changes'}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3">Tính năng:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>CRUD đầy đủ: Tạo, sửa, xóa, nhân bản document</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>Markdown editor với preview real-time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>Version control & changelog tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>Filter theo category, status, tags</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon.CheckCircle size={16} className="text-green-500" />
                    <span>Export & print document</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-end">
                <a href={createPageUrl("AdminDesignSystem")}>
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    <Icon.ArrowRight size={16} className="mr-2" />
                    Mở Design System Docs
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SaaS Multi-Shop */}
        <TabsContent value="saas" className="mt-6">
          <SaasMultishopHandbook searchQuery={search} />
        </TabsContent>

        {/* Referral */}
        <TabsContent value="referral" className="mt-6">
          <ReferralHandbook searchQuery={search} />
        </TabsContent>

        {/* Loyalty */}
        <TabsContent value="loyalty" className="mt-6">
          <LoyaltyHandbook searchQuery={search} />
        </TabsContent>

        {/* Pre-Order */}
        <TabsContent value="preorder" className="mt-6">
          <PreOrderHandbook searchQuery={search} />
        </TabsContent>

        {/* Order */}
        <TabsContent value="order" className="mt-6">
          <OrderHandbook searchQuery={search} />
        </TabsContent>

        {/* System */}
        <TabsContent value="system" className="mt-6">
          <SystemHandbook searchQuery={search} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminHandbook() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHandbookContent />
      </AdminLayout>
    </AdminGuard>
  );
}