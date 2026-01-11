/**
 * InviteErrorState - Display detailed error states for invite
 * 
 * Handles: INVALID, EXPIRED, USED, SELF, ERROR states
 */

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/AnimatedIcon";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { ErrorMessages, ActionConfig, InviteStatus } from "../domain/inviteDecisionTree";

const colorMap = {
  red: {
    bg: 'from-red-50 to-orange-50',
    iconBg: 'bg-red-100',
    iconText: 'text-red-500'
  },
  orange: {
    bg: 'from-orange-50 to-amber-50',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-500'
  },
  amber: {
    bg: 'from-amber-50 to-yellow-50',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-500'
  },
  blue: {
    bg: 'from-blue-50 to-indigo-50',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-500'
  },
  green: {
    bg: 'from-green-50 to-emerald-50',
    iconBg: 'bg-green-100',
    iconText: 'text-green-500'
  }
};

const IconMap = {
  AlertCircle: Icon.AlertCircle,
  Clock: Icon.Clock,
  CheckCircle: Icon.CheckCircle,
  Info: Icon.Info,
  AlertTriangle: Icon.AlertTriangle
};

export default function InviteErrorState({ 
  status, 
  inviterProfile,
  onAction 
}) {
  const navigate = useNavigate();
  const errorConfig = ErrorMessages[status];
  
  if (!errorConfig) return null;
  
  const colors = colorMap[errorConfig.color] || colorMap.red;
  const IconComponent = IconMap[errorConfig.icon] || Icon.AlertCircle;
  
  const handleAction = (action) => {
    switch (action) {
      case 'go_home':
        navigate(createPageUrl('Home'));
        break;
      case 'view_my_ecard':
        navigate(createPageUrl('MyEcard'));
        break;
      case 'request_new':
        // Could open a modal or contact flow
        if (inviterProfile?.email) {
          window.location.href = `mailto:${inviterProfile.email}?subject=Yêu cầu mã kết nối mới`;
        }
        break;
      default:
        onAction?.(action);
    }
  };
  
  // Get actions based on status
  const getActions = () => {
    switch (status) {
      case InviteStatus.INVALID:
        return ['go_home'];
      case InviteStatus.EXPIRED:
        return ['request_new', 'go_home'];
      case InviteStatus.USED:
        return ['view_my_ecard', 'go_home'];
      case InviteStatus.SELF:
        return ['view_my_ecard'];
      case InviteStatus.ERROR:
        return ['go_home'];
      default:
        return ['go_home'];
    }
  };
  
  const actions = getActions();

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${colors.bg} p-4`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className={`w-20 h-20 ${colors.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}
        >
          <IconComponent size={40} className={colors.iconText} />
        </motion.div>
        
        {/* Title & Description */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {errorConfig.title}
        </h1>
        <p className="text-gray-600 mb-6">
          {errorConfig.description}
        </p>
        
        {/* Inviter info (if available and relevant) */}
        {inviterProfile && status === InviteStatus.EXPIRED && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-3">
            {inviterProfile.profile_image_url ? (
              <img
                src={inviterProfile.profile_image_url}
                alt={inviterProfile.display_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-[#7CB342] rounded-full flex items-center justify-center text-white font-bold">
                {inviterProfile.display_name?.charAt(0)}
              </div>
            )}
            <div className="text-left">
              <p className="font-semibold text-gray-900">{inviterProfile.display_name}</p>
              <p className="text-sm text-gray-600">Người gửi lời mời</p>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="space-y-3">
          {actions.map((actionKey, index) => {
            const action = ActionConfig[actionKey];
            if (!action) return null;
            
            const ActionIcon = Icon[action.icon] || Icon.ChevronRight;
            
            return (
              <Button
                key={actionKey}
                onClick={() => handleAction(actionKey)}
                variant={index === 0 ? 'default' : 'outline'}
                className={`w-full ${index === 0 ? 'bg-[#7CB342] hover:bg-[#689F38]' : ''}`}
              >
                <ActionIcon size={18} className="mr-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
        
        {/* Help text for expired */}
        {status === InviteStatus.EXPIRED && (
          <p className="mt-4 text-xs text-gray-500">
            Mã mời có thời hạn 7 ngày kể từ khi tạo
          </p>
        )}
      </motion.div>
    </div>
  );
}