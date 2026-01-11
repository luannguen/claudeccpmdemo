/**
 * LiveEditContext - Global Context cho Live Edit System
 * 
 * Quản lý:
 * - Trạng thái edit mode (enabled/disabled)
 * - Section content data
 * - Save/Cancel changes
 * - Style management
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useSiteConfig, useSiteConfigMutation } from "@/components/hooks/useCMSPages";
import { showAdminAlert } from "@/components/AdminAlert";
import { DEFAULT_SECTION_DATA } from "@/components/cms/liveEditTypes";

// ========== CONTEXT ==========
const LiveEditContext = createContext({
  isEditMode: false,
  isAdmin: false,
  enableEditMode: () => {},
  disableEditMode: () => {},
  toggleEditMode: () => {},
  
  // Section data management
  getSectionData: () => ({}),
  getSectionFieldValue: () => null,
  updateSectionField: () => {},
  
  // Style management
  getSectionFieldStyles: () => ({}),
  updateSectionFieldStyles: () => {},
  
  // Changes tracking
  hasChanges: false,
  saveChanges: () => {},
  cancelChanges: () => {},
  isSaving: false
});

export function useLiveEditContext() {
  return useContext(LiveEditContext);
}

// Alias for backward compatibility
export function useLiveEdit() {
  const ctx = useContext(LiveEditContext);
  return {
    isEditing: ctx.isEditMode,
    isAdmin: ctx.isAdmin,
    getSectionData: ctx.getSectionData,
    getSectionFieldValue: ctx.getSectionFieldValue,
    updateSectionField: ctx.updateSectionField,
    getSectionFieldStyles: ctx.getSectionFieldStyles,
    updateSectionFieldStyles: ctx.updateSectionFieldStyles,
    hasChanges: ctx.hasChanges,
    saveChanges: ctx.saveChanges,
    cancelChanges: ctx.cancelChanges,
    isSaving: ctx.isSaving,
    startEditing: ctx.enableEditMode
  };
}

// ========== PROVIDER ==========
export function LiveEditContextProvider({ children }) {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole?.(['admin', 'super_admin', 'manager']) || false;
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({}); // { sectionKey: { fieldPath: value } }
  const [pendingStyleChanges, setPendingStyleChanges] = useState({}); // { sectionKey: { fieldPath: styles } }
  
  const { data: siteConfig, isLoading: isLoadingConfig, error: configError } = useSiteConfig();
  const { mutateAsync: saveSiteConfig, isPending: isSaving } = useSiteConfigMutation();
  
  // Log config error for debugging
  if (configError) {
    console.warn('⚠️ LiveEditContext: SiteConfig error:', configError);
  }

  // Check if there are any pending changes
  const hasChanges = useMemo(() => {
    return Object.keys(pendingChanges).length > 0 || Object.keys(pendingStyleChanges).length > 0;
  }, [pendingChanges, pendingStyleChanges]);

  // Enable/Disable edit mode
  const enableEditMode = useCallback(() => {
    if (isAdmin) {
      setIsEditMode(true);
    }
  }, [isAdmin]);

  const disableEditMode = useCallback(() => {
    setIsEditMode(false);
  }, []);

  const toggleEditMode = useCallback(() => {
    if (isAdmin) {
      setIsEditMode(prev => !prev);
    }
  }, [isAdmin]);

  // Get section data (merged: defaults < siteConfig < pendingChanges)
  const getSectionData = useCallback((sectionKey) => {
    const defaults = DEFAULT_SECTION_DATA[sectionKey] || {};
    const configKey = `${sectionKey}_content`;
    // Safe access - siteConfig might be null/undefined
    const safeConfig = siteConfig && typeof siteConfig === 'object' ? siteConfig : {};
    const saved = safeConfig[configKey] || {};
    const pending = pendingChanges[sectionKey] || {};
    
    return { ...defaults, ...saved, ...pending };
  }, [siteConfig, pendingChanges]);

  // Get specific field value from section
  const getSectionFieldValue = useCallback((sectionKey, fieldPath, defaultValue = "") => {
    // Check pending changes first
    if (pendingChanges[sectionKey]?.[fieldPath] !== undefined) {
      return pendingChanges[sectionKey][fieldPath];
    }
    
    // Then check siteConfig - safe access
    const configKey = `${sectionKey}_content`;
    const safeConfig = siteConfig && typeof siteConfig === 'object' ? siteConfig : {};
    const sectionData = safeConfig[configKey];
    
    if (sectionData) {
      // Handle nested paths like "features[0].title"
      const parts = fieldPath.split(/\.|\[|\]/).filter(Boolean);
      let value = sectionData;
      
      for (const part of parts) {
        if (value === undefined || value === null) break;
        const isNumber = /^\d+$/.test(part);
        value = isNumber ? value[parseInt(part)] : value[part];
      }
      
      if (value !== undefined) return value;
    }
    
    // Finally use defaults
    const defaults = DEFAULT_SECTION_DATA[sectionKey];
    if (defaults) {
      const parts = fieldPath.split(/\.|\[|\]/).filter(Boolean);
      let value = defaults;
      
      for (const part of parts) {
        if (value === undefined || value === null) break;
        const isNumber = /^\d+$/.test(part);
        value = isNumber ? value[parseInt(part)] : value[part];
      }
      
      if (value !== undefined) return value;
    }
    
    return defaultValue;
  }, [siteConfig, pendingChanges]);

  // Update field value in section
  const updateSectionField = useCallback((sectionKey, fieldPath, value) => {
    setPendingChanges(prev => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] || {}),
        [fieldPath]: value
      }
    }));
  }, []);

  // Get field styles
  const getSectionFieldStyles = useCallback((sectionKey, fieldPath) => {
    // Check pending style changes first
    if (pendingStyleChanges[sectionKey]?.[fieldPath]) {
      return pendingStyleChanges[sectionKey][fieldPath];
    }
    
    // Then check siteConfig - safe access
    const safeConfig = siteConfig && typeof siteConfig === 'object' ? siteConfig : {};
    const styleKey = `${sectionKey}_styles`;
    const savedStyles = safeConfig[styleKey]?.[fieldPath];
    
    return savedStyles || {};
  }, [siteConfig, pendingStyleChanges]);

  // Update field styles
  const updateSectionFieldStyles = useCallback((sectionKey, fieldPath, styles) => {
    setPendingStyleChanges(prev => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] || {}),
        [fieldPath]: styles
      }
    }));
  }, []);

  // Save all changes
  const saveChanges = useCallback(async () => {
    try {
      const safeConfig = siteConfig && typeof siteConfig === 'object' ? siteConfig : {};
      const updatedConfig = { ...safeConfig };
      
      // Merge content changes - deep merge for nested fields
              Object.entries(pendingChanges).forEach(([sectionKey, changes]) => {
                const configKey = `${sectionKey}_content`;
                const existingData = safeConfig[configKey] || DEFAULT_SECTION_DATA[sectionKey] || {};

                // Deep merge changes
                const mergedData = JSON.parse(JSON.stringify(existingData)); // Deep clone
                Object.entries(changes).forEach(([fieldPath, value]) => {
                  // Handle nested paths like "features[0].title" or "commitments"
                  const parts = fieldPath.split(/\.|\[|\]/).filter(Boolean);

                  if (parts.length === 1) {
                    mergedData[fieldPath] = value;
                  } else {
                    // Deep set for nested paths
                    let current = mergedData;
                    for (let i = 0; i < parts.length - 1; i++) {
                      const part = parts[i];
                      const isNumber = /^\d+$/.test(part);
                      const idx = isNumber ? parseInt(part) : part;

                      if (current[idx] === undefined) {
                        current[idx] = /^\d+$/.test(parts[i + 1]) ? [] : {};
                      } else if (typeof current[idx] !== 'object') {
                        current[idx] = /^\d+$/.test(parts[i + 1]) ? [] : {};
                      }
                      current = current[idx];
                    }

                    const lastPart = parts[parts.length - 1];
                    const isLastNumber = /^\d+$/.test(lastPart);
                    current[isLastNumber ? parseInt(lastPart) : lastPart] = value;
                  }
                });

                updatedConfig[configKey] = mergedData;
              });
      
      // Merge style changes
      Object.entries(pendingStyleChanges).forEach(([sectionKey, styles]) => {
        const styleKey = `${sectionKey}_styles`;
        const existingStyles = safeConfig[styleKey] || {};
        updatedConfig[styleKey] = { ...existingStyles, ...styles };
      });
      
      console.log('💾 Saving config:', updatedConfig);
      await saveSiteConfig(updatedConfig);
      
      setPendingChanges({});
      setPendingStyleChanges({});
      setIsEditMode(false);
      
      showAdminAlert('✅ Đã lưu thay đổi!', 'success');
    } catch (error) {
      console.error('❌ Save error:', error);
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  }, [siteConfig, pendingChanges, pendingStyleChanges, saveSiteConfig]);

  // Cancel all changes
  const cancelChanges = useCallback(() => {
    setPendingChanges({});
    setPendingStyleChanges({});
    setIsEditMode(false);
  }, []);

  const value = {
    isEditMode,
    isAdmin,
    enableEditMode,
    disableEditMode,
    toggleEditMode,
    getSectionData,
    getSectionFieldValue,
    updateSectionField,
    getSectionFieldStyles,
    updateSectionFieldStyles,
    hasChanges,
    saveChanges,
    cancelChanges,
    isSaving
  };

  return (
    <LiveEditContext.Provider value={value}>
      {children}
    </LiveEditContext.Provider>
  );
}

export default LiveEditContextProvider;