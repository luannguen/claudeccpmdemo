import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const alertConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    iconColor: 'text-green-600'
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-600'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    iconColor: 'text-yellow-600'
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-600'
  }
};

/**
 * Enhanced Admin Alert Component
 * Usage: showAdminAlert('Thành công!', 'success')
 */
export function showAdminAlert(message, type = 'success', duration = 3000) {
  const config = alertConfig[type] || alertConfig.info;
  const Icon = config.icon;

  const alertContainer = document.getElementById('admin-alert-container') || createAlertContainer();
  
  const alertId = `alert-${Date.now()}`;
  const alertDiv = document.createElement('div');
  alertDiv.id = alertId;
  alertDiv.className = 'alert-item';
  
  const alertHTML = `
    <div class="flex items-center gap-3 ${config.bg} ${config.border} border-2 rounded-xl p-4 shadow-lg backdrop-blur-sm">
      <div class="flex-shrink-0 ${config.iconColor}">
        ${Icon === CheckCircle ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' : 
           Icon === AlertCircle ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' :
           Icon === AlertTriangle ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' :
           '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'}
      </div>
      <p class="${config.text} font-medium text-sm flex-1">${message}</p>
      <button onclick="document.getElementById('${alertId}').remove()" class="flex-shrink-0 w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors ${config.text}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `;
  
  alertDiv.innerHTML = alertHTML;
  alertContainer.appendChild(alertDiv);

  // Auto remove
  setTimeout(() => {
    alertDiv.style.animation = 'slideOut 0.3s ease-out forwards';
    setTimeout(() => alertDiv.remove(), 300);
  }, duration);
}

function createAlertContainer() {
  const container = document.createElement('div');
  container.id = 'admin-alert-container';
  container.className = 'fixed top-6 right-6 z-[9999] space-y-3 max-w-md';
  document.body.appendChild(container);

  // Add animations
  if (!document.getElementById('alert-animations')) {
    const style = document.createElement('style');
    style.id = 'alert-animations';
    style.innerHTML = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      .alert-item {
        animation: slideIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
  }

  return container;
}

export default showAdminAlert;