/**
 * Admin Navigation Configuration
 * Define navigation items với required permissions
 */

import {
  LayoutDashboard, Package, ShoppingCart, Users, TrendingUp,
  FileText, MessageSquare, Mail, Settings, Box, Tag, Wallet, Bell, PackageX, Calendar,
  Gift, MessageCircle, CircleX, CreditCard, BarChart3, Zap, Award, Store, DollarSign, Crown,
  TestTube, Book, Layers
} from "lucide-react";
import { createPageUrl } from "@/utils";

/**
 * Navigation configuration với permission requirements
 * module: tên module trong RBAC
 * permission: permission cụ thể cần có (default: module.view)
 */
export const ADMIN_NAV_CONFIG = [
  // ========== TỔNG QUAN ==========
  {
    title: "TỔNG QUAN",
    items: [
      { 
        name: "Dashboard", 
        icon: LayoutDashboard, 
        url: createPageUrl("AdminDashboard"),
        module: "dashboard",
        permission: "dashboard.view"
      }
    ]
  },
  // ========== KINH DOANH ==========
  {
    title: "KINH DOANH",
    items: [
      { 
        name: "Đơn Hàng", 
        icon: ShoppingCart, 
        url: createPageUrl("AdminOrders"),
        module: "orders",
        permission: "orders.view"
      },
      { 
        name: "Trả Hàng", 
        icon: PackageX, 
        url: createPageUrl("AdminReturns"),
        module: "orders",
        permission: "orders.view"
      },
      { 
        name: "Thanh Toán", 
        icon: Wallet,
        module: "orders",
        permission: "orders.view",
        subItems: [
          { name: "Xác Minh", url: createPageUrl("AdminPaymentVerification"), permission: "orders.approve" },
          { name: "Phương Thức", url: createPageUrl("AdminPaymentMethods"), permission: "settings.view" },
          { name: "Gateway", url: createPageUrl("AdminPaymentGatewaySetup"), permission: "settings.manage" },
          { name: "Phân Tích", url: createPageUrl("AdminPaymentAnalytics"), permission: "reports.view" }
        ]
      }
    ]
  },
  // ========== SẢN PHẨM & KHO ==========
  {
    title: "SẢN PHẨM & KHO",
    items: [
      { 
        name: "Sản Phẩm", 
        icon: Package, 
        url: createPageUrl("AdminProducts"),
        module: "products",
        permission: "products.view"
      },
      { 
        name: "Danh Mục", 
        icon: Tag, 
        url: createPageUrl("AdminCategories"),
        module: "products",
        permission: "products.view"
      },
      { 
        name: "Kho Hàng", 
        icon: Box, 
        url: createPageUrl("AdminInventory"),
        module: "inventory",
        permission: "inventory.view"
      },
      { 
        name: "Bán Trước", 
        icon: Calendar,
        module: "products",
        permission: "products.view",
        subItems: [
          { name: "Phiên Bán Trước", url: createPageUrl("AdminPreOrders"), permission: "products.view" },
          { name: "Quản Lý Lot", url: createPageUrl("AdminProductLots"), permission: "products.manage" }
        ]
      }
    ]
  },
  // ========== KHÁCH HÀNG ==========
  {
    title: "KHÁCH HÀNG",
    items: [
      { 
        name: "Khách Hàng", 
        icon: Users, 
        url: createPageUrl("AdminCustomers"),
        module: "customers",
        permission: "customers.view"
      },
      { 
        name: "Giới Thiệu", 
        icon: Gift,
        module: "referrals",
        permission: "referrals.view",
        subItems: [
          { name: "Tổng Quan", url: createPageUrl("AdminReferrals"), permission: "referrals.view" },
          { name: "Thành Viên", url: createPageUrl("AdminReferralMembers"), permission: "referrals.view" },
          { name: "Cài Đặt", url: createPageUrl("AdminReferralSettings"), permission: "referrals.manage" }
        ]
      },
      { 
        name: "E-Card", 
        icon: CreditCard, 
        url: createPageUrl("AdminEcards"),
        module: "customers",
        permission: "customers.view"
      },
      { 
        name: "Giỏ Bỏ Quên", 
        icon: ShoppingCart, 
        url: createPageUrl("AdminAbandonedCarts"),
        module: "customers",
        permission: "customers.view"
      }
    ]
  },
  // ========== NỘI DUNG ==========
  {
    title: "NỘI DUNG",
    items: [
      { 
        name: "CMS", 
        icon: FileText,
        module: "cms",
        permission: "cms.view",
        subItems: [
          { name: "Quản Lý CMS", url: createPageUrl("AdminCMS"), permission: "cms.view" },
          { name: "Homepage Frames", url: createPageUrl("AdminHomeFrames"), permission: "cms.manage", badge: "New" },
          { name: "Trang", url: createPageUrl("AdminPages"), permission: "cms.view" },
          { name: "Cấu Hình Site", url: createPageUrl("AdminSiteConfig"), permission: "cms.manage" }
        ]
      },
      { 
        name: "Bài Viết", 
        icon: FileText, 
        url: createPageUrl("AdminPosts"),
        module: "cms",
        permission: "cms.view"
      },
      { 
        name: "Cộng Đồng", 
        icon: MessageSquare,
        module: "community",
        permission: "community.view",
        subItems: [
          { name: "Bài Viết", url: createPageUrl("AdminCommunity"), permission: "community.view" },
          { name: "Sách Cộng Đồng", url: createPageUrl("AdminCommunityBooks"), permission: "books.view" }
        ]
      },
      { 
        name: "Đánh Giá", 
        icon: Award, 
        url: createPageUrl("AdminReviews"),
        module: "reviews",
        permission: "reviews.view"
      }
    ]
  },
  // ========== TRUYỀN THÔNG ==========
  {
    title: "TRUYỀN THÔNG",
    items: [
      { 
        name: "Tin Nhắn", 
        icon: Mail, 
        url: createPageUrl("AdminMessages"),
        module: "notifications",
        permission: "notifications.view"
      },
      { 
        name: "Thông Báo", 
        icon: Bell, 
        url: createPageUrl("AdminNotifications"),
        module: "notifications",
        permission: "notifications.view"
      },
      { 
        name: "Email", 
        icon: Mail,
        module: "notifications",
        permission: "notifications.view",
        subItems: [
          { name: "Newsletter", url: createPageUrl("AdminNewsletter"), permission: "notifications.view" },
          { name: "Templates", url: createPageUrl("AdminEmailTemplates"), permission: "notifications.manage" },
          { name: "Test Email", url: createPageUrl("AdminEmailTest"), permission: "notifications.manage" }
        ]
      }
    ]
  },
  // ========== BÁO CÁO ==========
  {
    title: "BÁO CÁO",
    items: [
      { 
        name: "Tổng Quan", 
        icon: BarChart3, 
        url: createPageUrl("AdminReports"),
        module: "reports",
        permission: "reports.view"
      },
      { 
        name: "Insights", 
        icon: TrendingUp, 
        url: createPageUrl("AdminCustomerInsights"),
        module: "reports",
        permission: "reports.view"
      },
      { 
        name: "Activity Logs", 
        icon: FileText, 
        url: createPageUrl("AdminActivityLogs"),
        module: "system",
        permission: "system.view"
      }
    ]
  },
  // ========== TESTING & DEVELOPMENT ==========
  {
    title: "TESTING & DEVELOPMENT",
    items: [
      { 
        name: "Feature Control Tower", 
        icon: Zap, 
        url: createPageUrl("AdminFeatureRegistry"),
        module: "features",
        permission: "features.view",
        badge: "New"
      },
      { 
        name: "Feature Testing", 
        icon: TestTube, 
        url: createPageUrl("Features"),
        module: "features",
        permission: "features.view"
      },
      { 
        name: "Testers", 
        icon: TestTube, 
        url: createPageUrl("AdminTesters"),
        module: "testers",
        permission: "testers.view"
      },
      { 
        name: "Feedback", 
        icon: MessageCircle, 
        url: createPageUrl("AdminFeedback"),
        module: "system",
        permission: "system.view"
      }
    ]
  },
  // ========== HỆ THỐNG ==========
  {
    title: "HỆ THỐNG",
    items: [
      { 
        name: "Hủy Pre-Order", 
        icon: CircleX, 
        url: createPageUrl("AdminPreOrderCancellations"),
        module: "orders",
        permission: "orders.view"
      },
      { 
        name: "Sổ Tay Admin", 
        icon: Book, 
        url: createPageUrl("AdminHandbook"),
        module: "system",
        permission: "system.view"
      },
      { 
        name: "Design System", 
        icon: FileText, 
        url: createPageUrl("AdminDesignSystem"),
        module: "system",
        permission: "system.view",
        badge: "New"
      },
      { 
        name: "Cài Đặt", 
        icon: Settings, 
        url: createPageUrl("AdminSettings"),
        module: "settings",
        permission: "settings.view"
      }
    ]
  }
];

/**
 * Super Admin navigation - only for admin/super_admin roles
 */
export const SUPER_ADMIN_NAV_CONFIG = {
  title: "SUPER ADMIN",
  items: [
    { name: "Platform Overview", icon: Crown, url: createPageUrl("SuperAdminDashboard") },
    { 
      name: "Shops", 
      icon: Store, 
      subItems: [
        { name: "All Shops", url: createPageUrl("SuperAdminTenants") },
        { name: "Approvals", url: createPageUrl("SuperAdminApprovals"), badge: "New" },
      ]
    },
    { name: "Catalog Products", icon: Package, url: createPageUrl("SuperAdminProducts") },
    { name: "Analytics", icon: BarChart3, url: createPageUrl("SuperAdminAnalytics") },
    { name: "Commissions", icon: DollarSign, url: createPageUrl("SuperAdminCommissions") },
    { name: "Pricing Rules", icon: Zap, url: createPageUrl("SuperAdminPricingRules") },
    { name: "Config", icon: Settings, url: createPageUrl("SuperAdminConfig") }
  ]
};

export default {
  ADMIN_NAV_CONFIG,
  SUPER_ADMIN_NAV_CONFIG
};