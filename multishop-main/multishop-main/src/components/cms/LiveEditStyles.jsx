/**
 * LiveEditStyles - Global CSS cho Live Edit System
 * 
 * Provides:
 * - Edit mode visual indicators
 * - Pencil icon on hover
 * - Editable area highlights
 * - Link blocking overlay
 */

import React from "react";

export default function LiveEditStyles({ isEditMode }) {
  return (
    <style>{`
      /* ============================================
         LIVE EDIT SYSTEM V3 STYLES
         ============================================ */

      /* === BASE STYLES - Always applied for admin === */
      
      /* Ready mode - Show subtle indicator on hover only */
      .live-edit-mode-ready [data-live-edit] {
        position: relative;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      /* Pencil icon on hover - positioned better */
      .live-edit-mode-ready [data-live-edit]::after {
        content: '';
        position: absolute;
        top: -6px;
        right: -6px;
        width: 24px;
        height: 24px;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%237CB342' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/%3E%3Cpath d='m15 5 4 4'/%3E%3C/svg%3E") center/14px no-repeat;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.25);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
        transform: scale(0.8);
        z-index: 100;
      }
      
      .live-edit-mode-ready [data-live-edit]:hover::after {
        opacity: 1;
        transform: scale(1);
      }
      
      .live-edit-mode-ready [data-live-edit]:hover {
        outline: 2px dashed rgba(124, 179, 66, 0.6);
        outline-offset: 4px;
        border-radius: 4px;
      }

      /* === ACTIVE EDIT MODE === */
      
      /* Visual indicator banner */
      .live-edit-mode-active::before {
        content: '✏️ Click vào text để sửa nội dung';
        position: fixed;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #7CB342 0%, #558B2F 100%);
        color: white;
        padding: 10px 24px;
        border-radius: 24px;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(124, 179, 66, 0.5);
        animation: slideDown 0.3s ease;
      }
      
      @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      
      /* Editable elements in active mode */
      .live-edit-mode-active [data-live-edit] {
        position: relative;
        cursor: pointer;
        transition: all 0.2s ease;
        border-radius: 4px;
        outline: 2px dashed rgba(124, 179, 66, 0.4);
        outline-offset: 3px;
        background-color: rgba(124, 179, 66, 0.02);
      }
      
      .live-edit-mode-active [data-live-edit]:hover {
        outline-color: #7CB342;
        outline-style: solid;
        background-color: rgba(124, 179, 66, 0.08);
      }
      
      /* Label tooltip on hover - only for non-input elements */
      .live-edit-mode-active [data-live-edit]:not(input):not(textarea)::before {
        content: attr(data-live-edit);
        position: absolute;
        top: -24px;
        left: 0;
        background: #7CB342;
        color: white;
        font-size: 10px;
        font-weight: 500;
        padding: 2px 8px;
        border-radius: 4px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
        z-index: 100;
      }
      
      .live-edit-mode-active [data-live-edit]:not(input):not(textarea):hover::before {
        opacity: 1;
      }
      
      /* Editing state - currently being edited */
      .live-edit-mode-active [data-live-edit].live-edit-editing {
        outline: 2px solid #7CB342 !important;
        outline-offset: 4px;
        background-color: rgba(124, 179, 66, 0.08) !important;
        box-shadow: 0 0 0 4px rgba(124, 179, 66, 0.15);
      }
      
      /* Section wrapper styling */
      .live-edit-mode-active .section-editable {
        position: relative;
        border: 2px dashed transparent;
        border-radius: 12px;
        transition: border-color 0.2s;
      }
      
      .live-edit-mode-active .section-editable:hover {
        border-color: rgba(124, 179, 66, 0.3);
      }

      /* === BLOCK NAVIGATION IN EDIT MODE === */
      
      .live-edit-mode-active a[href],
      .live-edit-mode-active [role="link"],
      .live-edit-mode-active button[type="submit"] {
        pointer-events: auto;
      }
      
      .live-edit-mode-active a[href]:not([data-live-edit-allow]) {
        position: relative;
      }
      
      /* Show "blocked" indicator on links */
      .live-edit-mode-active a[href]:not([data-live-edit-allow]):hover::after {
        content: '🔒 Click bị chặn trong chế độ sửa';
        position: absolute;
        bottom: -28px;
        left: 50%;
        transform: translateX(-50%);
        background: #374151;
        color: white;
        font-size: 10px;
        padding: 4px 8px;
        border-radius: 4px;
        white-space: nowrap;
        z-index: 100;
      }

      /* === BUTTON/CTA EDIT INDICATOR === */
      
      .live-edit-mode-active button[data-live-edit],
      .live-edit-mode-active [role="button"][data-live-edit] {
        outline: 2px dashed rgba(255, 152, 0, 0.6) !important;
      }
      
      .live-edit-mode-active button[data-live-edit]:hover,
      .live-edit-mode-active [role="button"][data-live-edit]:hover {
        outline-color: #FF9800 !important;
        outline-style: solid !important;
      }

      /* === ARRAY ITEM INDICATORS === */
      
      .live-edit-mode-active [data-live-edit-array-item] {
        position: relative;
        outline: 1px dashed rgba(33, 150, 243, 0.4);
        outline-offset: 4px;
        border-radius: 8px;
        transition: all 0.2s;
      }
      
      .live-edit-mode-active [data-live-edit-array-item]:hover {
        outline-color: #2196F3;
        outline-style: solid;
        background-color: rgba(33, 150, 243, 0.03);
      }
      
      /* Array item index badge */
      .live-edit-mode-active [data-live-edit-array-item]::before {
        content: attr(data-live-edit-index);
        position: absolute;
        top: -8px;
        left: -8px;
        width: 20px;
        height: 20px;
        background: #2196F3;
        color: white;
        font-size: 10px;
        font-weight: 600;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 50;
      }
      
      .live-edit-mode-active [data-live-edit-array-item]:hover::before {
        opacity: 1;
      }

      /* === MINI TOOLBAR STYLES === */
      
      .mini-toolbar {
        font-family: system-ui, -apple-system, sans-serif;
      }
      
      .mini-toolbar button {
        font-family: inherit;
      }

      /* === ANIMATIONS === */
      
      @keyframes editPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(124, 179, 66, 0.4); }
        50% { box-shadow: 0 0 0 8px rgba(124, 179, 66, 0); }
      }
      
      .live-edit-mode-active [data-live-edit]:focus {
        animation: editPulse 1.5s infinite;
      }
    `}</style>
  );
}