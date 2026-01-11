/**
 * Action Renderer for Chatbot
 * 
 * Renders action buttons
 */

import React, { memo } from 'react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Phone, 
  MapPin, 
  Package, 
  HelpCircle,
  ChevronRight
} from 'lucide-react';

const ACTION_ICONS = {
  'add_to_cart': ShoppingCart,
  'view_detail': ChevronRight,
  'view_all': ChevronRight,
  'view_all_orders': Package,
  'track_order': Package,
  'contact_support': Phone,
  'view_address': MapPin,
  'help': HelpCircle
};

const ACTION_PAGES = {
  'view_all': 'Services',
  'view_detail': 'ProductDetail',
  'view_all_orders': 'MyOrders',
  'track_order': 'MyOrders',
  'contact_support': 'Contact'
};

function ActionButton({ action, onAction }) {
  const Icon = ACTION_ICONS[action.type] || ChevronRight;
  const pageName = ACTION_PAGES[action.type];
  
  // Handle suggestion type - just text, trigger as prompt
  if (action.type === 'suggestion') {
    return (
      <button
        type="button"
        onClick={() => onAction?.({ type: 'send_prompt', prompt: action.label })}
        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-[#7CB342] hover:text-white transition-colors cursor-pointer"
      >
        {action.label}
      </button>
    );
  }

  if (pageName) {
    return (
      <Link
        to={createPageUrl(pageName)}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#7CB342] text-white text-sm rounded-lg hover:bg-[#5a8f31] transition-colors"
      >
        <Icon className="w-4 h-4" />
        {action.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onAction?.(action)}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#7CB342] text-white text-sm rounded-lg hover:bg-[#5a8f31] transition-colors cursor-pointer"
    >
      <Icon className="w-4 h-4" />
      {action.label}
    </button>
  );
}

function ActionRenderer({ actions, onAction }) {
  if (!actions?.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {actions.map((action, i) => (
        <ActionButton 
          key={i} 
          action={action}
          onAction={onAction}
        />
      ))}
    </div>
  );
}

export default memo(ActionRenderer);