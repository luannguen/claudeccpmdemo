/**
 * SaasMultishopHandbook.jsx
 * Sổ tay hướng dẫn đầy đủ về hệ thống SaaS Multi-Shop
 * 
 * Created: 2025-01-19
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SaasMultishopHandbook({ searchQuery = '' }) {
  const sections = [
    { id: 'overview', title: 'Tổng Quan', icon: 'Home' },
    { id: 'commission', title: 'Commission', icon: 'DollarSign' },
    { id: 'billing', title: 'Billing', icon: 'CreditCard' },
    { id: 'isolation', title: 'Tenant Isolation', icon: 'Shield' },
    { id: 'usage', title: 'Usage Limits', icon: 'BarChart' },
    { id: 'marketplace', title: 'Marketplace', icon: 'Store' },
    { id: 'workflow', title: 'Workflows', icon: 'Zap' },
    { id: 'terms', title: 'Thuật Ngữ', icon: 'FileText' }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2">
          {sections.map(section => (
            <TabsTrigger key={section.id} value={section.id} className="text-xs">
              {section.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon.Home className="text-blue-600" />
                Tổng Quan Hệ Thống SaaS Multi-Shop
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-bold text-gray-900">🎯 Mục Đích</h3>
                <p>
                  Hệ thống SaaS Multi-Shop cho phép nhiều shop/tenant hoạt động độc lập trên cùng một nền tảng,
                  với quản lý commission, billing, usage limits tự động.
                </p>

                <h3 className="text-lg font-bold text-gray-900 mt-6">🏗️ Kiến Trúc 5 Trụ Cột</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 not-prose">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <Icon.DollarSign className="text-green-600 mb-2" size={32} />
                    <h4 className="font-bold text-green-900">1. Commission Processing</h4>
                    <p className="text-sm text-green-700 mt-2">
                      Tự động tính hoa hồng mỗi đơn hàng, settlement hàng tháng
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <Icon.CreditCard className="text-blue-600 mb-2" size={32} />
                    <h4 className="font-bold text-blue-900">2. Billing Automation</h4>
                    <p className="text-sm text-blue-700 mt-2">
                      Invoice tự động, email reminders, suspend quá hạn
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <Icon.Shield className="text-purple-600 mb-2" size={32} />
                    <h4 className="font-bold text-purple-900">3. Tenant Isolation</h4>
                    <p className="text-sm text-purple-700 mt-2">
                      Mỗi shop chỉ thấy data của mình, bảo mật tuyệt đối
                    </p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <Icon.BarChart className="text-orange-600 mb-2" size={32} />
                    <h4 className="font-bold text-orange-900">4. Usage Enforcement</h4>
                    <p className="text-sm text-orange-700 mt-2">
                      Giới hạn theo plan, upgrade flow tự động
                    </p>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                    <Icon.Store className="text-indigo-600 mb-2" size={32} />
                    <h4 className="font-bold text-indigo-900">5. Marketplace</h4>
                    <p className="text-sm text-indigo-700 mt-2">
                      Buyer browse, compare, chọn shop mua hàng
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mt-6">📊 Entities Chính</h3>
                <ul className="space-y-2">
                  <li><Badge>Tenant</Badge> - Thông tin shop/tổ chức</li>
                  <li><Badge>TenantUser</Badge> - Phân quyền user trong shop</li>
                  <li><Badge>Subscription</Badge> - Gói dịch vụ hiện tại</li>
                  <li><Badge>SubscriptionPlan</Badge> - Định nghĩa các gói</li>
                  <li><Badge>Invoice</Badge> - Hóa đơn thanh toán</li>
                  <li><Badge>Commission</Badge> - Hoa hồng từ đơn hàng</li>
                  <li><Badge>ShopProduct</Badge> - Sản phẩm của shop</li>
                  <li><Badge>Order</Badge> - Đơn hàng (có shop_id)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMMISSION */}
        <TabsContent value="commission" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon.DollarSign className="text-green-600" />
                Hệ Thống Commission (Hoa Hồng)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-bold">💡 Commission Là Gì?</h3>
                <p>
                  <strong>Commission</strong> là phần phần trăm doanh thu mà platform giữ lại từ mỗi đơn hàng của shop.
                  Ví dụ: Đơn 1,000,000đ, commission 3% → Platform giữ 30,000đ, shop nhận 970,000đ.
                </p>

                <h3 className="text-lg font-bold mt-6">⚙️ Cách Hoạt Động</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 my-4">
                  <ol className="space-y-3">
                    <li>
                      <strong>1. Đơn hoàn tất</strong>
                      <br />
                      <code className="text-sm bg-white px-2 py-1 rounded">Order.status = 'completed'</code>
                    </li>
                    <li>
                      <strong>2. Tự động tính commission</strong>
                      <br />
                      Backend function <code>calculateOrderCommission</code> được trigger
                    </li>
                    <li>
                      <strong>3. Tạo Commission record</strong>
                      <br />
                      Lưu vào entity <Badge>Commission</Badge> với status = 'calculated'
                    </li>
                    <li>
                      <strong>4. Cập nhật số liệu</strong>
                      <br />
                      • Order.commission_total, shop_revenue<br />
                      • Tenant.pending_commission
                    </li>
                    <li>
                      <strong>5. Settlement cuối tháng</strong>
                      <br />
                      Function <code>processMonthlyCommissionSettlement</code> chạy ngày 1:<br />
                      • Approve tất cả commission<br />
                      • Cập nhật Tenant.total_commission_paid<br />
                      • Gửi email thông báo
                    </li>
                  </ol>
                </div>

                <h3 className="text-lg font-bold mt-6">📐 Commission Rate</h3>
                <table className="min-w-full border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border px-4 py-2">Nguồn</th>
                      <th className="border px-4 py-2">Ưu tiên</th>
                      <th className="border px-4 py-2">Mô tả</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2"><code>Tenant.custom_commission_rate</code></td>
                      <td className="border px-4 py-2 text-center">🥇 Cao nhất</td>
                      <td className="border px-4 py-2">Shop có deal đặc biệt</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2"><code>PlatformConfig.default_commission_rate</code></td>
                      <td className="border px-4 py-2 text-center">🥈 Thứ 2</td>
                      <td className="border px-4 py-2">Rate chung platform</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">Hardcoded 3%</td>
                      <td className="border px-4 py-2 text-center">🥉 Fallback</td>
                      <td className="border px-4 py-2">Mặc định hệ thống</td>
                    </tr>
                  </tbody>
                </table>

                <h3 className="text-lg font-bold mt-6">🔍 Xem Commission</h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Super Admin:</strong>
                    <br />
                    <code>SuperAdminCommissions</code> → Xem tất cả commission, approve, mark paid
                  </li>
                  <li>
                    <strong>Shop Owner:</strong>
                    <br />
                    <code>ShopCommissionReport</code> → Xem commission bị trừ từng đơn
                  </li>
                </ul>

                <h3 className="text-lg font-bold mt-6">🛠️ Functions & Services</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="font-medium mb-2">Backend Functions:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><code>calculateOrderCommission</code> - Tính commission cho 1 đơn</li>
                    <li><code>processMonthlyCommissionSettlement</code> - Settlement cuối tháng</li>
                  </ul>
                  
                  <p className="font-medium mt-4 mb-2">Services:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><code>CommissionService.js</code> - 15 methods (calculate, approve, list, analytics...)</li>
                  </ul>

                  <p className="font-medium mt-4 mb-2">Hooks:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><code>useCommission.js</code> - React Query hooks (list, approve, paid...)</li>
                    <li><code>useAdminCommissions</code> - Combined hook cho admin</li>
                  </ul>
                </div>

                <h3 className="text-lg font-bold mt-6">📝 Ví Dụ Thực Tế</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="font-medium">Scenario: Đơn hàng 5,000,000đ hoàn tất</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <p>• Shop A có commission_rate = 4%</p>
                    <p>• Commission = 5,000,000 × 4% = <strong>200,000đ</strong></p>
                    <p>• Shop nhận = 5,000,000 - 200,000 = <strong>4,800,000đ</strong></p>
                    <p>• Commission record tạo với status = 'calculated'</p>
                    <p>• Tenant.pending_commission += 200,000đ</p>
                    <p>• Cuối tháng: auto-approve → status = 'approved'</p>
                    <p>• Khi thanh toán → status = 'paid'</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BILLING */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon.CreditCard className="text-blue-600" />
                Hệ Thống Billing & Invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-bold">💳 Billing Là Gì?</h3>
                <p>
                  <strong>Billing</strong> là quá trình tính phí subscription hàng tháng/quý/năm cho shop.
                  Mỗi shop trả phí theo gói đã chọn (Free, Starter, Pro, Enterprise).
                </p>

                <h3 className="text-lg font-bold mt-6">📋 Subscription Plans</h3>
                <div className="grid md:grid-cols-4 gap-4 not-prose">
                  <div className="bg-gray-50 border rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Free</h4>
                    <p className="text-2xl font-bold text-gray-600">0đ/tháng</p>
                    <ul className="text-xs mt-3 space-y-1 text-gray-600">
                      <li>• 50 sản phẩm</li>
                      <li>• 100 đơn/tháng</li>
                      <li>• Email support</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-bold text-blue-900 mb-2">Starter</h4>
                    <p className="text-2xl font-bold text-blue-600">199K/tháng</p>
                    <ul className="text-xs mt-3 space-y-1 text-blue-700">
                      <li>• 200 sản phẩm</li>
                      <li>• 500 đơn/tháng</li>
                      <li>• Priority support</li>
                      <li>• Custom domain</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <h4 className="font-bold text-purple-900 mb-2">Pro</h4>
                    <p className="text-2xl font-bold text-purple-600">499K/tháng</p>
                    <ul className="text-xs mt-3 space-y-1 text-purple-700">
                      <li>• 1000 sản phẩm</li>
                      <li>• 2000 đơn/tháng</li>
                      <li>• API access</li>
                      <li>• White label</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <h4 className="font-bold text-orange-900 mb-2">Enterprise</h4>
                    <p className="text-2xl font-bold text-orange-600">1.5M/tháng</p>
                    <ul className="text-xs mt-3 space-y-1 text-orange-700">
                      <li>• Unlimited</li>
                      <li>• Dedicated support</li>
                      <li>• SLA</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-lg font-bold mt-6">🔄 Invoice Workflow</h3>
                <div className="bg-gray-50 border rounded-xl p-4">
                  <ol className="space-y-3">
                    <li>
                      <strong>Ngày 1 hàng tháng:</strong>
                      <br />
                      <code>generateMonthlyInvoices</code> chạy tự động
                      <br />
                      → Tạo Invoice cho tất cả subscription active
                    </li>
                    <li>
                      <strong>Due date = Invoice date + 7 ngày</strong>
                      <br />
                      Shop có 7 ngày để thanh toán
                    </li>
                    <li>
                      <strong>Email reminders:</strong>
                      <br />
                      <code>sendBillingReminders</code> chạy daily
                      <br />
                      → Gửi nhắc ở ngày 7, 3, 1 trước due date
                    </li>
                    <li>
                      <strong>Sau due date + 3 ngày:</strong>
                      <br />
                      Invoice.status = 'overdue'
                    </li>
                    <li>
                      <strong>Sau due date + 7 ngày:</strong>
                      <br />
                      <code>suspendExpiredTenants</code> tự động suspend shop
                    </li>
                  </ol>
                </div>

                <h3 className="text-lg font-bold mt-6">📈 Invoice Status Flow</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-gray-100 text-gray-700">draft</Badge>
                  <span>→</span>
                  <Badge className="bg-blue-100 text-blue-700">sent</Badge>
                  <span>→</span>
                  <Badge className="bg-green-100 text-green-700">paid</Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <Badge className="bg-blue-100 text-blue-700">sent</Badge>
                  <span>→</span>
                  <Badge className="bg-red-100 text-red-700">overdue</Badge>
                  <span>→</span>
                  <span className="text-red-600 font-medium">Suspend</span>
                </div>

                <h3 className="text-lg font-bold mt-6">🎛️ Admin Actions</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="font-medium mb-3">SuperAdminBilling page có thể:</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Icon.Play size={16} className="inline mr-2 text-blue-600" />
                      <strong>Generate Invoices</strong> - Tạo invoice thủ công
                    </li>
                    <li>
                      <Icon.Send size={16} className="inline mr-2 text-blue-600" />
                      <strong>Send Reminders</strong> - Gửi email nhắc thủ công
                    </li>
                    <li>
                      <Icon.RefreshCw size={16} className="inline mr-2 text-blue-600" />
                      <strong>Process Renewals</strong> - Renew/suspend thủ công
                    </li>
                    <li>
                      <Icon.CheckCircle size={16} className="inline mr-2 text-green-600" />
                      <strong>Mark as Paid</strong> - Đánh dấu đã thanh toán
                    </li>
                  </ul>
                </div>

                <h3 className="text-lg font-bold mt-6">📊 Analytics</h3>
                <div className="grid md:grid-cols-3 gap-4 not-prose">
                  <div className="bg-green-50 border rounded-xl p-3">
                    <p className="text-xs text-green-700 mb-1">MRR</p>
                    <p className="text-sm text-green-900">Monthly Recurring Revenue</p>
                  </div>
                  <div className="bg-blue-50 border rounded-xl p-3">
                    <p className="text-xs text-blue-700 mb-1">ARR</p>
                    <p className="text-sm text-blue-900">Annual Recurring Revenue = MRR × 12</p>
                  </div>
                  <div className="bg-purple-50 border rounded-xl p-3">
                    <p className="text-xs text-purple-700 mb-1">ARPU</p>
                    <p className="text-sm text-purple-900">Average Revenue Per User</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TENANT ISOLATION */}
        <TabsContent value="isolation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon.Shield className="text-purple-600" />
                Tenant Data Isolation (Cách Ly Dữ Liệu)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-bold">🔒 Isolation Là Gì?</h3>
                <p>
                  <strong>Tenant Isolation</strong> đảm bảo mỗi shop chỉ thấy và thao tác được dữ liệu của chính mình.
                  Shop A không thể xem/sửa/xóa dữ liệu của Shop B.
                </p>

                <h3 className="text-lg font-bold mt-6">🏗️ Cách Thực Hiện</h3>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="font-medium mb-3">1. Tenant Context</p>
                  <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
{`const { tenantId, tenantScope } = useTenantScope();
// tenantScope = { shop_id: "tenant_xyz" }`}
                  </pre>

                  <p className="font-medium mt-4 mb-3">2. Auto-Filter Queries</p>
                  <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
{`// Hook tự động inject shop_id filter
const { data: orders } = useTenantOrders();
// → Chỉ lấy orders có shop_id = current tenant

// Tương tự:
useTenantProducts() → ShopProduct filtered by shop_id
useTenantCustomers() → Customer filtered by shop_id
useTenantCommissions() → Commission filtered by shop_id`}
                  </pre>

                  <p className="font-medium mt-4 mb-3">3. Backend Validation</p>
                  <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
{`const { valid, error } = validateAccess(resourceTenantId);
if (!valid) {
  return failure('Cross-tenant access denied', ErrorCodes.FORBIDDEN);
}`}
                  </pre>
                </div>

                <h3 className="text-lg font-bold mt-6">👁️ SuperAdmin View As</h3>
                <p>
                  SuperAdmin có thể <strong>switchTenant</strong> để xem dữ liệu như shop khác (debugging):
                </p>
                <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`const { switchTenant, clearScope } = useTenantScopeContext();

// View as shop XYZ
switchTenant('tenant_xyz');

// Return to admin view
clearScope();`}
                </pre>

                <h3 className="text-lg font-bold mt-6">✅ Security Checklist</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Icon.CheckCircle size={16} className="text-green-600 mt-1" />
                    <span>Tất cả queries đều filter by <code>shop_id</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon.CheckCircle size={16} className="text-green-600 mt-1" />
                    <span>Backend functions validate tenant access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon.CheckCircle size={16} className="text-green-600 mt-1" />
                    <span>URL có <code>?tenant=xxx</code> parameter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon.CheckCircle size={16} className="text-green-600 mt-1" />
                    <span>TenantGuard bảo vệ routes</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* USAGE LIMITS */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon.BarChart className="text-orange-600" />
                Usage Limits & Enforcement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-bold">📊 Usage Metering Là Gì?</h3>
                <p>
                  Hệ thống theo dõi số lượng resources mà shop đang dùng (products, orders, customers...)
                  và <strong>ngăn chặn</strong> khi vượt giới hạn theo plan.
                </p>

                <h3 className="text-lg font-bold mt-6">🔢 Giới Hạn Theo Plan</h3>
                <table className="min-w-full border text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border px-2 py-1">Resource</th>
                      <th className="border px-2 py-1">Free</th>
                      <th className="border px-2 py-1">Starter</th>
                      <th className="border px-2 py-1">Pro</th>
                      <th className="border px-2 py-1">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-2 py-1">Products</td>
                      <td className="border px-2 py-1 text-center">50</td>
                      <td className="border px-2 py-1 text-center">200</td>
                      <td className="border px-2 py-1 text-center">1000</td>
                      <td className="border px-2 py-1 text-center">∞</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1">Orders/month</td>
                      <td className="border px-2 py-1 text-center">100</td>
                      <td className="border px-2 py-1 text-center">500</td>
                      <td className="border px-2 py-1 text-center">2000</td>
                      <td className="border px-2 py-1 text-center">∞</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1">Customers</td>
                      <td className="border px-2 py-1 text-center">200</td>
                      <td className="border px-2 py-1 text-center">1000</td>
                      <td className="border px-2 py-1 text-center">5000</td>
                      <td className="border px-2 py-1 text-center">∞</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1">Users</td>
                      <td className="border px-2 py-1 text-center">1</td>
                      <td className="border px-2 py-1 text-center">3</td>
                      <td className="border px-2 py-1 text-center">10</td>
                      <td className="border px-2 py-1 text-center">∞</td>
                    </tr>
                  </tbody>
                </table>

                <h3 className="text-lg font-bold mt-6">🚦 Enforcement Flow</h3>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <ol className="space-y-3 text-sm">
                    <li>
                      <strong>Check trước khi tạo:</strong>
                      <pre className="bg-white p-2 rounded text-xs mt-1">{`const { canCreate, remaining } = useProductLimit();
if (!canCreate) {
  // Hiện UpgradePromptModal
  return;
}`}</pre>
                    </li>
                    <li>
                      <strong>Warning khi gần limit (80%):</strong>
                      <pre className="bg-white p-2 rounded text-xs mt-1">{`if (isNearLimit) {
  addToast(\`Còn \${remaining} sản phẩm\`, 'warning');
}`}</pre>
                    </li>
                    <li>
                      <strong>Block khi đạt limit (100%):</strong>
                      <pre className="bg-white p-2 rounded text-xs mt-1">{`if (isAtLimit) {
  throw new Error('Đã đạt giới hạn. Vui lòng nâng cấp gói.');
}`}</pre>
                    </li>
                  </ol>
                </div>

                <h3 className="text-lg font-bold mt-6">🔄 Daily Usage Update</h3>
                <p>
                  Function <code>updateTenantUsage</code> chạy mỗi ngày lúc 00:30:
                </p>
                <ul className="space-y-1 text-sm">
                  <li>• Đếm lại products, customers thực tế</li>
                  <li>• Reset orders_per_month_count đầu tháng</li>
                  <li>• Update Tenant.usage object</li>
                </ul>

                <h3 className="text-lg font-bold mt-6">💎 Upgrade Prompt</h3>
                <p>
                  Component <code>UpgradePromptModal</code> hiển thị khi user đạt limit:
                </p>
                <ul className="space-y-1 text-sm">
                  <li>• So sánh plan hiện tại vs plan đề xuất</li>
                  <li>• Highlight features mới unlock</li>
                  <li>• CTA "Nâng cấp ngay"</li>
                  <li>• Show price difference</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MARKETPLACE */}
        <TabsContent value="marketplace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon.Store className="text-indigo-600" />
                Marketplace - Browse & Compare Shops
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-bold">🛍️ Marketplace Là Gì?</h3>
                <p>
                  <strong>Marketplace</strong> là nơi buyer (người mua) browse tất cả shops đang active,
                  xem thông tin, so sánh, và chọn shop để mua hàng.
                </p>

                <h3 className="text-lg font-bold mt-6">🔍 Shop Discovery</h3>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <p className="font-medium mb-3">Buyer có thể:</p>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Search</strong> theo tên shop, địa điểm</li>
                    <li>• <strong>Filter</strong> theo business type, industry</li>
                    <li>• <strong>Sort</strong> by rating, products count, newest</li>
                    <li>• Xem <strong>featured shops</strong> (nổi bật)</li>
                    <li>• Switch grid/list view</li>
                  </ul>
                </div>

                <h3 className="text-lg font-bold mt-6">🏪 Shop Storefront</h3>
                <p>
                  Mỗi shop có storefront riêng tại <code>/shop/:slug</code>:
                </p>
                <ul className="space-y-1 text-sm">
                  <li>• Banner, logo, about</li>
                  <li>• Products grid</li>
                  <li>• Shop ratings & reviews</li>
                  <li>• Contact button</li>
                </ul>

                <h3 className="text-lg font-bold mt-6">⭐ Shop Rating System</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="font-medium mb-3">Metrics được hiển thị:</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>Average Rating:</strong> 1-5 sao từ reviews
                    </li>
                    <li>
                      <strong>Satisfaction Rate:</strong> % khách hài lòng
                    </li>
                    <li>
                      <strong>Response Rate:</strong> % phản hồi tin nhắn
                    </li>
                    <li>
                      <strong>On-time Rate:</strong> % giao đúng hẹn
                    </li>
                  </ul>
                </div>

                <h3 className="text-lg font-bold mt-6">🎨 Components</h3>
                <div className="grid md:grid-cols-2 gap-3 not-prose text-sm">
                  <div className="bg-white border rounded-lg p-3">
                    <code className="text-blue-600">ShopCard</code>
                    <p className="text-gray-600 mt-1">Card hiển thị shop (default/compact)</p>
                  </div>
                  <div className="bg-white border rounded-lg p-3">
                    <code className="text-blue-600">ShopFilter</code>
                    <p className="text-gray-600 mt-1">Search, filter, sort shops</p>
                  </div>
                  <div className="bg-white border rounded-lg p-3">
                    <code className="text-blue-600">ShopRatingWidget</code>
                    <p className="text-gray-600 mt-1">Rating breakdown, stats</p>
                  </div>
                  <div className="bg-white border rounded-lg p-3">
                    <code className="text-blue-600">useMarketplace</code>
                    <p className="text-gray-600 mt-1">Hook browse shops, filters</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WORKFLOWS */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon.Zap className="text-yellow-600" />
                Workflows & Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-bold">🔄 Automated Workflows</h3>
                
                <div className="space-y-6">
                  {/* Commission Workflow */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h4 className="font-bold text-green-900 mb-3">💰 Commission Workflow</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-green-700">1</Badge>
                        <span>Order completed → Trigger <code>calculateOrderCommission</code></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-green-700">2</Badge>
                        <span>Create Commission record (status: calculated)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-green-700">3</Badge>
                        <span>Update Order (commission_total, shop_revenue)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-green-700">4</Badge>
                        <span>Update Tenant (pending_commission)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-green-700">5</Badge>
                        <span>Ngày 1 hàng tháng: Settlement → status: approved</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-green-700">6</Badge>
                        <span>Admin mark paid → status: paid</span>
                      </div>
                    </div>
                  </div>

                  {/* Billing Workflow */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-bold text-blue-900 mb-3">💳 Billing Workflow</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-blue-700">Day 1</Badge>
                        <span>Generate invoices → Send emails</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-blue-700">Day 7-</Badge>
                        <span>Send reminder email (7 days before due)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-blue-700">Day 3-</Badge>
                        <span>Send reminder email (3 days before)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-blue-700">Day 1-</Badge>
                        <span>Send final reminder (1 day before)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-red-700">Due+3</Badge>
                        <span>Invoice → overdue</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-red-700">Due+7</Badge>
                        <span>Suspend tenant → Send notice</span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Update Workflow */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <h4 className="font-bold text-orange-900 mb-3">📊 Usage Update Workflow</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-orange-700">00:30</Badge>
                        <span>Daily: <code>updateTenantUsage</code> recalculate all counts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-orange-700">Month 1</Badge>
                        <span>Reset orders_per_month_count = 0</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white text-orange-700">Real-time</Badge>
                        <span>Check limits before create (product, order...)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold mt-6">⏱️ Scheduled Jobs</h3>
                <table className="min-w-full border text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border px-2 py-1">Function</th>
                      <th className="border px-2 py-1">Schedule</th>
                      <th className="border px-2 py-1">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-2 py-1"><code>updateTenantUsage</code></td>
                      <td className="border px-2 py-1">Daily 00:30</td>
                      <td className="border px-2 py-1">Recalculate usage counts</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1"><code>generateMonthlyInvoices</code></td>
                      <td className="border px-2 py-1">Day 1 00:00</td>
                      <td className="border px-2 py-1">Generate invoices</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1"><code>sendBillingReminders</code></td>
                      <td className="border px-2 py-1">Daily 09:00</td>
                      <td className="border px-2 py-1">Send reminders</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1"><code>processSubscriptionRenewal</code></td>
                      <td className="border px-2 py-1">Daily 01:00</td>
                      <td className="border px-2 py-1">Renew/suspend</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1"><code>suspendExpiredTenants</code></td>
                      <td className="border px-2 py-1">Daily 02:00</td>
                      <td className="border px-2 py-1">Suspend overdue</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1"><code>processMonthlyCommissionSettlement</code></td>
                      <td className="border px-2 py-1">Day 1 00:00</td>
                      <td className="border px-2 py-1">Approve commissions</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TERMS */}
        <TabsContent value="terms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon.FileText className="text-gray-700" />
                Thuật Ngữ & Khái Niệm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    term: 'Tenant',
                    definition: 'Một shop/tổ chức trên platform. Mỗi tenant có data riêng, subscription riêng, không nhìn thấy data của tenant khác.'
                  },
                  {
                    term: 'Multi-tenancy',
                    definition: 'Kiến trúc cho phép nhiều tenant dùng chung 1 hệ thống nhưng data cách ly hoàn toàn.'
                  },
                  {
                    term: 'Commission',
                    definition: 'Phần phần trăm (%) doanh thu mà platform giữ lại từ đơn hàng. Ví dụ: 3% commission của đơn 1M = 30K.'
                  },
                  {
                    term: 'Commission Rate',
                    definition: 'Tỷ lệ % commission. Có thể custom per tenant hoặc dùng rate chung.'
                  },
                  {
                    term: 'Settlement',
                    definition: 'Quá trình thanh toán/đối soát commission cuối tháng. Approve tất cả commission đã tính.'
                  },
                  {
                    term: 'Invoice',
                    definition: 'Hóa đơn thanh toán subscription hàng tháng. Gồm plan fee + tax.'
                  },
                  {
                    term: 'Subscription',
                    definition: 'Gói dịch vụ đang dùng (free/starter/pro/enterprise). Có period start/end, billing cycle.'
                  },
                  {
                    term: 'Billing Cycle',
                    definition: 'Chu kỳ thanh toán: monthly (hàng tháng), quarterly (hàng quý), yearly (hàng năm).'
                  },
                  {
                    term: 'Usage Metering',
                    definition: 'Đo lường việc shop dùng bao nhiêu resources (products, orders, storage...). Để enforce limits.'
                  },
                  {
                    term: 'Tenant Scope',
                    definition: 'Context hiện tại của tenant nào đang active. Dùng để filter queries theo shop_id.'
                  },
                  {
                    term: 'MRR (Monthly Recurring Revenue)',
                    definition: 'Doanh thu định kỳ hàng tháng từ subscription. Chỉ số quan trọng cho SaaS.'
                  },
                  {
                    term: 'ARR (Annual Recurring Revenue)',
                    definition: 'Doanh thu định kỳ hàng năm = MRR × 12.'
                  },
                  {
                    term: 'ARPU (Average Revenue Per User)',
                    definition: 'Doanh thu trung bình mỗi user = MRR / số user active.'
                  },
                  {
                    term: 'Churn Rate',
                    definition: 'Tỷ lệ % user hủy subscription. Churn cao = mất khách nhiều.'
                  },
                  {
                    term: 'Overdue',
                    definition: 'Invoice quá hạn thanh toán. Sau 7 ngày overdue → auto suspend.'
                  },
                  {
                    term: 'Grace Period',
                    definition: 'Thời gian ân hạn (3-7 ngày) trước khi suspend tenant quá hạn.'
                  },
                  {
                    term: 'Shop Storefront',
                    definition: 'Trang web công khai của shop, hiển thị products, about, reviews.'
                  },
                  {
                    term: 'Featured Shop',
                    definition: 'Shop nổi bật được highlight ở marketplace (do admin set).'
                  },
                  {
                    term: 'Tenant Slug',
                    definition: 'URL-friendly identifier của shop. VD: "nong-trai-organic" thay vì ID.'
                  },
                  {
                    term: 'SuperAdmin',
                    definition: 'Quản trị viên cao nhất, xem tất cả tenants, analytics, config platform.'
                  },
                  {
                    term: 'View As Tenant',
                    definition: 'Chức năng của SuperAdmin xem hệ thống như 1 tenant cụ thể (debugging).'
                  }
                ].map(({ term, definition }) => (
                  <div key={term} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-bold text-gray-900">{term}</h4>
                    <p className="text-sm text-gray-600 mt-1">{definition}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Reference Card */}
      <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
        <CardHeader>
          <CardTitle className="text-lg">⚡ Quick Reference - Thao Tác Thường Dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-bold mb-2">📊 Xem Commission</h4>
              <p className="text-gray-600">SuperAdminCommissions → Filter by shop/status</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">✅ Approve Commission</h4>
              <p className="text-gray-600">Select commissions → Bulk Approve</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">💳 Generate Invoices</h4>
              <p className="text-gray-600">SuperAdminBilling → Generate Invoices button</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">📧 Send Reminders</h4>
              <p className="text-gray-600">SuperAdminBilling → Send Reminders button</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">🔄 Process Renewals</h4>
              <p className="text-gray-600">SuperAdminBilling → Process Renewals button</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">🏪 View Shop Data</h4>
              <p className="text-gray-600">Add <code>?tenant=xxx</code> to URL</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">📈 Check Usage</h4>
              <p className="text-gray-600">Tenant entity → usage object</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">🚫 Suspend Tenant</h4>
              <p className="text-gray-600">Auto after 7 days overdue, or manual</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">⭐ Set Featured</h4>
              <p className="text-gray-600">Tenant.is_featured = true</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Architecture Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>🏗️ Sơ Đồ Kiến Trúc</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────┐
│                      MARKETPLACE LAYER                       │
│  (Buyer browse shops, compare, choose)                      │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      TENANT LAYER                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Shop A    │  │  Shop B    │  │  Shop C    │            │
│  │            │  │            │  │            │            │
│  │ Products   │  │ Products   │  │ Products   │            │
│  │ Orders     │  │ Orders     │  │ Orders     │            │
│  │ Customers  │  │ Customers  │  │ Customers  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│       │                │                │                    │
│       └────────────────┴────────────────┘                    │
│                        ▼                                     │
│              [ TENANT ISOLATION ]                            │
│         (Auto-filter by shop_id)                             │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PLATFORM LAYER                            │
│  • Commission Processing                                    │
│  • Billing Automation                                       │
│  • Usage Enforcement                                        │
│  • Analytics & Reporting                                    │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SCHEDULED JOBS                             │
│  00:00 - Generate invoices, commission settlement          │
│  00:30 - Update usage counts                               │
│  01:00 - Process renewals                                  │
│  02:00 - Suspend expired tenants                           │
│  09:00 - Send billing reminders                            │
└─────────────────────────────────────────────────────────────┘`}
          </pre>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-green-300 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">✅ Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-bold text-green-900">Commission:</h4>
              <ul className="space-y-1 text-green-800">
                <li>• Kiểm tra commission rate trước khi approve shop</li>
                <li>• Review commission monthly trước settlement</li>
                <li>• Track pending_commission của từng shop</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-green-900">Billing:</h4>
              <ul className="space-y-1 text-green-800">
                <li>• Theo dõi overdue invoices hàng ngày</li>
                <li>• Contact shop trước khi suspend</li>
                <li>• Check payment status sau reminder</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-green-900">Isolation:</h4>
              <ul className="space-y-1 text-green-800">
                <li>• Luôn check tenant context trước thao tác</li>
                <li>• Validate shop_id trong backend functions</li>
                <li>• Dùng useTenantScope() cho queries</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-green-900">Usage:</h4>
              <ul className="space-y-1 text-green-800">
                <li>• Monitor shops gần limit (80%)</li>
                <li>• Suggest upgrade proactively</li>
                <li>• Review usage trends monthly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}