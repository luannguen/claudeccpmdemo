import React from "react";
import { motion } from "framer-motion";
import { 
  Mail, Phone, MapPin, Calendar, Crown, Shield,
  CheckCircle, Clock, ExternalLink, Edit
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import moment from "moment";

const planColors = {
  free: "bg-gray-100 text-gray-700",
  starter: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
  enterprise: "bg-amber-100 text-amber-700"
};

const statusColors = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  suspended: "bg-red-100 text-red-700",
  trial: "bg-blue-100 text-blue-700"
};

export default function ShopInfoCard({ tenant, onEdit }) {
  if (!tenant) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      {/* Header Banner */}
      <div className={`h-3 ${
        tenant.status === 'active' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
        tenant.status === 'suspended' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
        'bg-gradient-to-r from-gray-400 to-gray-500'
      }`} />

      <div className="p-6">
        {/* Shop Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {tenant.organization_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{tenant.organization_name}</h2>
              {tenant.onboarding_completed && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2">/{tenant.slug}</p>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[tenant.status] || statusColors.inactive}`}>
                {tenant.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${planColors[tenant.subscription_plan] || planColors.free}`}>
                {tenant.subscription_plan?.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-[#7CB342] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>

        {/* Owner Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            Thông Tin Owner
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Tên</p>
              <p className="font-medium text-gray-900">{tenant.owner_name}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{tenant.owner_email}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Điện thoại</p>
              <p className="font-medium text-gray-900">{tenant.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Địa chỉ</p>
              <p className="font-medium text-gray-900">{tenant.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-500 text-sm">Loại hình</span>
            <span className="font-medium text-gray-900 text-sm capitalize">{tenant.business_type || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-500 text-sm">Lĩnh vực</span>
            <span className="font-medium text-gray-900 text-sm capitalize">{tenant.industry || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-500 text-sm">Commission Rate</span>
            <span className="font-bold text-orange-600">{tenant.commission_rate || 3}%</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-500 text-sm">Onboarding</span>
            <span className={`font-medium ${tenant.onboarding_completed ? 'text-green-600' : 'text-orange-600'}`}>
              {tenant.onboarding_completed ? '✅ Hoàn tất' : `⏳ Step ${tenant.onboarding_step}/4`}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-500 text-sm">Ngày tham gia</span>
            <span className="font-medium text-gray-900 text-sm">
              {moment(tenant.created_date).format('DD/MM/YYYY')}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link
            to={createPageUrl(`ShopPublicStorefront?slug=${tenant.slug}`)}
            target="_blank"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#7CB342] text-white rounded-xl hover:bg-[#689F38] transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Xem Shop
          </Link>
        </div>
      </div>
    </motion.div>
  );
}