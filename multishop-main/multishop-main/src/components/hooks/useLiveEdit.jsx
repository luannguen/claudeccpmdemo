/**
 * useLiveEdit Hook
 * 
 * Hook để quản lý Live Edit cho các trang custom (không dùng CMS).
 * Tuân thủ kiến trúc 3 lớp theo AI-CODING-RULES.
 */

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useSiteConfigMutation, useSiteConfig } from "@/components/hooks/useCMSPages";
import { showAdminAlert } from "@/components/AdminAlert";

/**
 * Hook quản lý Live Edit state cho các section tùy chỉnh
 * 
 * @param {string} sectionKey - Key để lưu vào SiteConfig (vd: 'hero', 'why_choose_us')
 * @param {Object} defaultData - Data mặc định nếu chưa có trong config
 */
export function useLiveEditSection(sectionKey, defaultData = {}) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['admin', 'super_admin', 'manager']);
  
  const { data: siteConfig, isLoading: isLoadingConfig } = useSiteConfig();
  const { mutateAsync: saveSiteConfig, isPending: isSaving } = useSiteConfigMutation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState(defaultData);
  const [originalData, setOriginalData] = useState(defaultData);
  const [hasChanges, setHasChanges] = useState(false);

  // Load data from site config
  useEffect(() => {
    if (siteConfig) {
      const sectionData = siteConfig[`${sectionKey}_config`] || 
                          siteConfig[sectionKey] || 
                          defaultData;
      setLocalData(sectionData);
      setOriginalData(sectionData);
    }
  }, [siteConfig, sectionKey, defaultData]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(localData) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [localData, originalData]);

  // Update a field
  const updateField = useCallback((field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Update nested field (e.g., "slides[0].title")
  const updateNestedField = useCallback((path, value) => {
    setLocalData(prev => {
      const result = { ...prev };
      const parts = path.split('.');
      let current = result;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const match = part.match(/^(\w+)\[(\d+)\]$/);
        
        if (match) {
          const [, arrayName, index] = match;
          if (!current[arrayName]) current[arrayName] = [];
          if (!current[arrayName][index]) current[arrayName][index] = {};
          current = current[arrayName][index];
        } else {
          if (!current[part]) current[part] = {};
          current = current[part];
        }
      }
      
      const lastPart = parts[parts.length - 1];
      current[lastPart] = value;
      
      return result;
    });
  }, []);

  // Save changes to SiteConfig
  const handleSave = useCallback(async () => {
    try {
      await saveSiteConfig({
        ...siteConfig,
        [`${sectionKey}_config`]: localData
      });
      setOriginalData(localData);
      setIsEditing(false);
      showAdminAlert('✅ Đã lưu thay đổi!', 'success');
    } catch (error) {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  }, [saveSiteConfig, siteConfig, sectionKey, localData]);

  // Cancel changes
  const handleCancel = useCallback(() => {
    setLocalData(originalData);
    setIsEditing(false);
  }, [originalData]);

  // Start editing
  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  return {
    // State
    isAdmin,
    isEditing,
    isLoading: isLoadingConfig,
    isSaving,
    hasChanges,
    data: localData,
    
    // Actions
    updateField,
    updateNestedField,
    startEditing,
    save: handleSave,
    cancel: handleCancel,
    setIsEditing
  };
}

/**
 * Hook tổng hợp cho Home page với nhiều sections
 */
export function useHomeLiveEdit() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['admin', 'super_admin', 'manager']);
  
  const { data: siteConfig, isLoading } = useSiteConfig();
  const { mutateAsync: saveSiteConfig, isPending: isSaving } = useSiteConfigMutation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [changes, setChanges] = useState({});

  // Check if there are changes
  const hasChanges = Object.keys(changes).length > 0;

  // Update a section field
  const updateSectionField = useCallback((sectionKey, field, value) => {
    setChanges(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value
      }
    }));
  }, []);

  // Get current value (from changes or config)
  const getFieldValue = useCallback((sectionKey, field, defaultValue = "") => {
    // Check changes first
    if (changes[sectionKey]?.[field] !== undefined) {
      return changes[sectionKey][field];
    }
    // Then check site config
    const configKey = `${sectionKey}_config`;
    if (siteConfig?.[configKey]?.[field] !== undefined) {
      return siteConfig[configKey][field];
    }
    if (siteConfig?.[sectionKey]?.[field] !== undefined) {
      return siteConfig[sectionKey][field];
    }
    return defaultValue;
  }, [changes, siteConfig]);

  // Save all changes
  const handleSave = useCallback(async () => {
    try {
      const updatedConfig = { ...siteConfig };
      
      // Merge changes into config
      Object.entries(changes).forEach(([sectionKey, sectionChanges]) => {
        const configKey = `${sectionKey}_config`;
        updatedConfig[configKey] = {
          ...updatedConfig[configKey],
          ...sectionChanges
        };
      });
      
      await saveSiteConfig(updatedConfig);
      setChanges({});
      setIsEditing(false);
      showAdminAlert('✅ Đã lưu tất cả thay đổi!', 'success');
    } catch (error) {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  }, [saveSiteConfig, siteConfig, changes]);

  // Cancel all changes
  const handleCancel = useCallback(() => {
    setChanges({});
    setIsEditing(false);
  }, []);

  return {
    isAdmin,
    isEditing,
    isLoading,
    isSaving,
    hasChanges,
    changes,
    siteConfig,
    
    // Actions
    updateSectionField,
    getFieldValue,
    startEditing: () => setIsEditing(true),
    save: handleSave,
    cancel: handleCancel,
    setIsEditing
  };
}

export default useLiveEditSection;