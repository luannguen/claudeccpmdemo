/**
 * Test Template Library
 * UI Component - Template selector cho test cases
 */

import React, { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Template definitions
const TEST_TEMPLATES = {
  core: [
    {
      id: 'auth-login',
      title: 'User Login Test',
      category: 'core',
      steps: '1. Mở trang login\n2. Nhập email và password hợp lệ\n3. Click "Đăng nhập"',
      expected: 'User được redirect về dashboard, hiển thị tên user ở header',
      tags: ['auth', 'critical']
    },
    {
      id: 'data-save',
      title: 'Save Data Test',
      category: 'core',
      steps: '1. Mở form tạo/edit\n2. Điền thông tin hợp lệ\n3. Click "Lưu"',
      expected: 'Dữ liệu được lưu, hiển thị toast success, redirect về list',
      tags: ['crud', 'basic']
    }
  ],
  admin: [
    {
      id: 'admin-create',
      title: 'Admin Create Entity Test',
      category: 'admin',
      steps: '1. Click "Thêm mới"\n2. Điền form đầy đủ\n3. Click "Tạo"',
      expected: 'Entity được tạo, hiển thị toast, reload list',
      tags: ['admin', 'crud']
    },
    {
      id: 'admin-bulk',
      title: 'Admin Bulk Actions Test',
      category: 'admin',
      steps: '1. Chọn nhiều items\n2. Click "Bulk action"\n3. Confirm action',
      expected: 'Action được thực hiện cho tất cả items đã chọn',
      tags: ['admin', 'bulk']
    }
  ],
  payment: [
    {
      id: 'payment-checkout',
      title: 'Payment Checkout Flow',
      category: 'payment',
      steps: '1. Thêm sản phẩm vào giỏ\n2. Click checkout\n3. Điền thông tin\n4. Chọn payment method\n5. Xác nhận thanh toán',
      expected: 'Order được tạo, payment được xử lý, user nhận email confirm',
      tags: ['payment', 'critical', 'e2e']
    }
  ],
  ui: [
    {
      id: 'ui-responsive',
      title: 'Responsive UI Test',
      category: 'ui',
      steps: '1. Mở page trên mobile (375px)\n2. Mở page trên tablet (768px)\n3. Mở page trên desktop (1920px)',
      expected: 'UI hiển thị đúng, không bị lỗi layout, menu hoạt động smooth',
      tags: ['ui', 'responsive']
    },
    {
      id: 'ui-animation',
      title: 'Animation & Interaction Test',
      category: 'ui',
      steps: '1. Hover các buttons\n2. Click các interactive elements\n3. Scroll page',
      expected: 'Animation smooth, không lag, transitions mượt mà',
      tags: ['ui', 'animation']
    }
  ],
  integration: [
    {
      id: 'api-integration',
      title: 'External API Integration Test',
      category: 'integration',
      steps: '1. Trigger API call\n2. Check loading state\n3. Verify response',
      expected: 'API call thành công, data được hiển thị đúng, error handling hoạt động',
      tags: ['api', 'integration']
    }
  ]
};

export default function TestTemplateLibrary({ isOpen, onClose, onSelectTemplate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Flatten all templates
  const allTemplates = useMemo(() => {
    return Object.values(TEST_TEMPLATES).flat();
  }, []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(t => {
      const matchSearch = !searchQuery || 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
      
      return matchSearch && matchCategory;
    });
  }, [allTemplates, searchQuery, selectedCategory]);

  const handleSelect = (template) => {
    onSelectTemplate({
      title: template.title,
      steps: template.steps,
      expected: template.expected,
      status: 'pending'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon.TestTube size={24} className="text-violet-600" />
            Test Template Library
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Search & Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Icon.Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm template..."
                className="pl-10"
              />
            </div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList>
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="core">Core</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
                <TabsTrigger value="ui">UI/UX</TabsTrigger>
                <TabsTrigger value="integration">API</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 gap-4 max-h-[60vh] overflow-auto">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    {template.title}
                    <Button 
                      size="sm" 
                      onClick={() => handleSelect(template)}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      <Icon.Plus size={16} className="mr-1" />
                      Chọn
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium text-gray-700 mb-1">Bước thực hiện:</p>
                    <p className="text-gray-600 text-xs whitespace-pre-line line-clamp-3">
                      {template.steps}
                    </p>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium text-gray-700 mb-1">Kết quả mong đợi:</p>
                    <p className="text-gray-600 text-xs line-clamp-2">
                      {template.expected}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Icon.TestTube size={48} className="mx-auto mb-3 opacity-30" />
              <p>Không tìm thấy template phù hợp</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}