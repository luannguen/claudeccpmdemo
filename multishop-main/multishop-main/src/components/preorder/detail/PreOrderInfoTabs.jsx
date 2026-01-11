/**
 * PreOrderInfoTabs - Tab navigation cho thông tin preorder
 * Progressive disclosure pattern - tránh nhồi nhét
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Info, FileText, Shield, Clock, TrendingUp, 
  MessageCircle, Bell, MapPin, ChevronDown, ChevronUp
} from 'lucide-react';

// Tab components
import PreOrderOverviewTab from './tabs/PreOrderOverviewTab';
import PreOrderDetailsTab from './tabs/PreOrderDetailsTab';
import PreOrderPolicyTab from './tabs/PreOrderPolicyTab';

const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: Info },
  { id: 'details', label: 'Chi tiết', icon: FileText },
  { id: 'policy', label: 'Chính sách', icon: Shield },
];

export default function PreOrderInfoTabs({ lot, preOrder, product, displayName, daysUntilHarvest, priceIncrease }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Tab navigation */}
      <div className="flex border-b bg-gray-50/50">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 text-sm font-medium transition-all relative
                ${isActive 
                  ? 'text-[#7CB342] bg-white' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7CB342]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-4 md:p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <PreOrderOverviewTab 
              lot={lot} 
              preOrder={preOrder}
              daysUntilHarvest={daysUntilHarvest}
              priceIncrease={priceIncrease}
            />
          )}
          {activeTab === 'details' && (
            <PreOrderDetailsTab 
              lot={lot} 
              preOrder={preOrder}
              product={product}
              displayName={displayName}
            />
          )}
          {activeTab === 'policy' && (
            <PreOrderPolicyTab lot={lot} />
          )}
        </motion.div>
      </div>
    </div>
  );
}