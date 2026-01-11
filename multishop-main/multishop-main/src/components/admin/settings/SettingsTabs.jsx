import React from "react";
import { Settings, Users, Shield, Lock, Bell, Database, Star, Brain } from "lucide-react";

const iconMap = {
  Settings,
  Users,
  Shield,
  Lock,
  Bell,
  Database,
  Star,
  Brain
};

const tabs = [
  { id: 'general', name: 'Tổng Quan', icon: 'Settings' },
  { id: 'widget', name: 'Review Widget', icon: 'Star' },
  { id: 'users', name: 'Người Dùng', icon: 'Users' },
  { id: 'rbac', name: 'Phân Quyền RBAC', icon: 'Shield' },
  { id: 'security', name: 'Bảo Mật', icon: 'Lock' },
  { id: 'notifications', name: 'Thông Báo', icon: 'Bell' },
  { id: 'ai', name: 'AI Personalization', icon: 'Brain' },
  { id: 'system', name: 'Hệ Thống', icon: 'Database' }
];

export default function SettingsTabs({ activeTab, setActiveTab }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
      {/* Mobile: Vertical list */}
      <div className="block md:hidden p-2">
        <div className="grid grid-cols-2 gap-2">
          {tabs.map((tab) => {
            const Icon = iconMap[tab.icon];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl font-medium transition-all text-sm ${
                  activeTab === tab.id
                    ? 'bg-[#7CB342] text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Desktop: Horizontal tabs */}
      <div className="hidden md:flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
        <style>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        {tabs.map((tab) => {
          const Icon = iconMap[tab.icon];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'text-[#7CB342] border-b-2 border-[#7CB342] bg-[#7CB342]/5'
                  : 'text-gray-600 hover:text-[#7CB342] hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}