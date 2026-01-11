/**
 * AdminCMS - Trang quản lý CMS tổng hợp
 * 
 * Features:
 * - Sections management (visibility, content)
 * - Banners management
 * - Partners management
 * - Promotions/Campaigns
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Layout, Image, Users, Tag, Settings, FileText,
  ChevronRight, Layers, Building2, Megaphone
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Import CMS managers
import SectionManager from "@/components/admin/cms/SectionManager";
import BannerManager from "@/components/admin/cms/BannerManager";
import PartnerManager from "@/components/admin/cms/PartnerManager";
import SiteConfigEditor from "@/components/admin/cms/SiteConfigEditor";

const CMS_TABS = [
  { 
    id: 'sections', 
    label: 'Sections', 
    icon: Layers,
    description: 'Quản lý các section của trang' 
  },
  { 
    id: 'banners', 
    label: 'Banners', 
    icon: Image,
    description: 'Quản lý banners & khuyến mãi' 
  },
  { 
    id: 'partners', 
    label: 'Đối Tác', 
    icon: Building2,
    description: 'Quản lý đối tác thương hiệu' 
  },
  { 
    id: 'config', 
    label: 'Cấu Hình', 
    icon: Settings,
    description: 'Cấu hình website' 
  }
];

const PAGE_OPTIONS = [
  { value: 'home', label: 'Trang Chủ' },
  { value: 'team', label: 'Đội Ngũ' },
  { value: 'contact', label: 'Liên Hệ' }
];

function AdminCMSContent() {
  const [activeTab, setActiveTab] = useState('sections');
  const [selectedPage, setSelectedPage] = useState('home');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Nội Dung CMS</h1>
          <p className="text-gray-600 mt-1">
            Quản lý sections, banners, đối tác và cấu hình website
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CMS_TABS.map((tab, idx) => {
          const Icon = tab.icon;
          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  activeTab === tab.id ? 'ring-2 ring-[#7CB342] bg-[#7CB342]/5' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activeTab === tab.id ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{tab.label}</h3>
                      <p className="text-xs text-gray-500">{tab.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="hidden">
          {CMS_TABS.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>

        {/* Sections Tab */}
        <TabsContent value="sections" className="mt-0">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quản Lý Sections</CardTitle>
                  <CardDescription>
                    Ẩn/hiện và chỉnh sửa các sections của trang
                  </CardDescription>
                </div>
                
                {/* Page selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Trang:</span>
                  <div className="flex border rounded-lg overflow-hidden">
                    {PAGE_OPTIONS.map(page => (
                      <button
                        key={page.value}
                        onClick={() => setSelectedPage(page.value)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          selectedPage === page.value
                            ? 'bg-[#7CB342] text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {page.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SectionManager page={selectedPage} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banners Tab */}
        <TabsContent value="banners" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <BannerManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <PartnerManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <SiteConfigEditor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminCMS() {
  return (
    <AdminGuard requiredModule="cms" requiredPermission="cms.view">
      <AdminLayout>
        <AdminCMSContent />
      </AdminLayout>
    </AdminGuard>
  );
}