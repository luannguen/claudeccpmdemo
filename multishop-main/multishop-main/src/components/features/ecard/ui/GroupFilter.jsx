/**
 * GroupFilter - Filter connections by group
 * UI Layer - Presentation only
 * 
 * @module features/ecard/ui
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useConnectionGroups } from '../hooks/useConnectionGroups';
import { motion } from 'framer-motion';

export default function GroupFilter({ selectedGroupId, onSelectGroup, showAll = true }) {
  const { groups, isLoading } = useConnectionGroups();

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-8 w-20 bg-gray-100 rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {showAll && (
        <FilterButton
          label="Tất cả"
          isActive={!selectedGroupId}
          onClick={() => onSelectGroup(null)}
          color="#7CB342"
        />
      )}

      {groups.map((group, idx) => (
        <motion.div
          key={group.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <FilterButton
            label={group.name}
            count={group.member_count}
            isActive={selectedGroupId === group.id}
            onClick={() => onSelectGroup(group.id)}
            color={group.color}
            icon={group.icon}
          />
        </motion.div>
      ))}
    </div>
  );
}

function FilterButton({ label, count, isActive, onClick, color, icon }) {
  const IconComp = icon && Icon[icon] ? Icon[icon] : null;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
        isActive
          ? 'text-white shadow-sm'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      style={isActive ? { backgroundColor: color } : {}}
    >
      {IconComp && <IconComp size={14} />}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
          ({count})
        </span>
      )}
    </button>
  );
}

/**
 * Group Manager Trigger Button
 */
export function GroupManagerButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
    >
      <Icon.Settings size={14} />
      <span>Quản lý nhóm</span>
    </button>
  );
}