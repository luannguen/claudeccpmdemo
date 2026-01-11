/**
 * Breadcrumb Component
 * Consistent breadcrumb navigation across the app
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label - Display text
 * @property {string} [href] - Link URL
 * @property {string} [page] - Page name for createPageUrl
 */

/**
 * @typedef {Object} BreadcrumbProps
 * @property {BreadcrumbItem[]} items - Breadcrumb items
 * @property {boolean} [showHome] - Show home link
 * @property {string} [className] - Additional classes
 */

export function Breadcrumb({ 
  items = [],
  showHome = true,
  className = ''
}) {
  const allItems = showHome 
    ? [{ label: 'Trang chủ', page: 'Home' }, ...items]
    : items;

  return (
    <nav className={`flex items-center text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const href = item.href || (item.page ? createPageUrl(item.page) : null);

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              )}
              
              {isLast || !href ? (
                <span className={`${isLast ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                  {index === 0 && showHome ? (
                    <Home className="w-4 h-4 inline mr-1" />
                  ) : null}
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={href}
                  className="text-gray-500 hover:text-green-600 transition-colors"
                >
                  {index === 0 && showHome ? (
                    <Home className="w-4 h-4 inline mr-1" />
                  ) : null}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Simple breadcrumb for detail pages
 */
export function DetailBreadcrumb({ 
  parentLabel,
  parentPage,
  currentLabel
}) {
  return (
    <Breadcrumb
      items={[
        { label: parentLabel, page: parentPage },
        { label: currentLabel }
      ]}
    />
  );
}

/**
 * Admin breadcrumb
 */
export function AdminBreadcrumb({ items = [] }) {
  return (
    <Breadcrumb
      items={[
        { label: 'Dashboard', page: 'AdminDashboard' },
        ...items
      ]}
      showHome={false}
    />
  );
}

export default Breadcrumb;