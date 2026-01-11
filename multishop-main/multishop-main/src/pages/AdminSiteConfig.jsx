/**
 * AdminSiteConfig - Trang cấu hình website
 */

import React from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import SiteConfigEditor from "@/components/admin/cms/SiteConfigEditor";

function AdminSiteConfigContent() {
  return <SiteConfigEditor />;
}

export default function AdminSiteConfig() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminSiteConfigContent />
      </AdminLayout>
    </AdminGuard>
  );
}