import React from 'react';
import { MessageSquare } from 'lucide-react';

const TABS = [
  { id: 'details', label: 'Chi tiết', icon: null },
  { id: 'chat', label: 'Chat', icon: MessageSquare }
];

export default function OrderTabs({ activeTab, setActiveTab }) {
  return (
    <div className="border-b">
      <div className="flex gap-4 px-4 sm:px-6 pt-4">
        {TABS.map(tab => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TabButton({ tab, isActive, onClick }) {
  const Icon = tab.icon;
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium transition-colors relative flex items-center gap-2 text-sm ${
        isActive ? 'text-[#7CB342]' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {tab.label}
      {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7CB342]" />}
    </button>
  );
}