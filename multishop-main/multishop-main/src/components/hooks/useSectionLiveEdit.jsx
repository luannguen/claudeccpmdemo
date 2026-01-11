/**
 * useSectionLiveEdit Hook
 * 
 * Hook mạnh mẽ để quản lý Live Edit cho các section.
 * Hỗ trợ nested fields, arrays, và auto-save.
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useSiteConfigMutation, useSiteConfig } from "@/components/hooks/useCMSPages";
import { showAdminAlert } from "@/components/AdminAlert";
import { DEFAULT_SECTION_DATA } from "@/components/cms/liveEditTypes";

/**
 * Hook quản lý Live Edit cho một section cụ thể
 * 
 * @param {string} sectionKey - Key của section (hero, why_choose_us, etc.)
 */
export function useSectionLiveEdit(sectionKey) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['admin', 'super_admin', 'manager']);
  
  const { data: siteConfig, isLoading: isLoadingConfig } = useSiteConfig();
  const { mutateAsync: saveSiteConfig, isPending: isSaving } = useSiteConfigMutation();
  
  const [localData, setLocalData] = useState({});
  const [originalData, setOriginalData] = useState({});

  // Load data from site config or use defaults
  useEffect(() => {
    if (siteConfig) {
      const configKey = `${sectionKey}_content`;
      const savedData = siteConfig[configKey] || DEFAULT_SECTION_DATA[sectionKey] || {};
      setLocalData(savedData);
      setOriginalData(savedData);
    } else if (!isLoadingConfig) {
      // Use defaults when no config
      const defaults = DEFAULT_SECTION_DATA[sectionKey] || {};
      setLocalData(defaults);
      setOriginalData(defaults);
    }
  }, [siteConfig, sectionKey, isLoadingConfig]);

  // Check for changes
  const hasChanges = useMemo(() => {
    return JSON.stringify(localData) !== JSON.stringify(originalData);
  }, [localData, originalData]);

  // Update a simple field
  const updateField = useCallback((fieldPath, value) => {
    setLocalData(prev => {
      const result = { ...prev };
      
      // Handle nested paths like "features[0].title"
      const parts = fieldPath.split(/\.|\[|\]/).filter(Boolean);
      let current = result;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const isNumber = /^\d+$/.test(part);
        
        if (isNumber) {
          const index = parseInt(part);
          if (!Array.isArray(current)) current = [];
          if (!current[index]) current[index] = {};
          current = current[index];
        } else {
          if (current[part] === undefined) {
            // Check if next part is a number to determine type
            const nextPart = parts[i + 1];
            const nextIsNumber = /^\d+$/.test(nextPart);
            current[part] = nextIsNumber ? [] : {};
          }
          current = current[part];
        }
      }
      
      const lastPart = parts[parts.length - 1];
      const isLastNumber = /^\d+$/.test(lastPart);
      
      if (isLastNumber) {
        current[parseInt(lastPart)] = value;
      } else {
        current[lastPart] = value;
      }
      
      return { ...result };
    });
  }, []);

  // Get field value with nested path support
  const getFieldValue = useCallback((fieldPath, defaultValue = "") => {
    const parts = fieldPath.split(/\.|\[|\]/).filter(Boolean);
    let current = localData;
    
    for (const part of parts) {
      const isNumber = /^\d+$/.test(part);
      
      if (isNumber) {
        if (!Array.isArray(current)) return defaultValue;
        current = current[parseInt(part)];
      } else {
        if (current === undefined || current === null) return defaultValue;
        current = current[part];
      }
      
      if (current === undefined || current === null) return defaultValue;
    }
    
    return current ?? defaultValue;
  }, [localData]);

  // Add item to array
  const addArrayItem = useCallback((arrayPath, newItem) => {
    setLocalData(prev => {
      const result = { ...prev };
      const parts = arrayPath.split('.');
      let current = result;
      
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      
      const lastPart = parts[parts.length - 1];
      if (!Array.isArray(current[lastPart])) {
        current[lastPart] = [];
      }
      current[lastPart] = [...current[lastPart], newItem];
      
      return { ...result };
    });
  }, []);

  // Remove item from array
  const removeArrayItem = useCallback((arrayPath, index) => {
    setLocalData(prev => {
      const result = { ...prev };
      const parts = arrayPath.split('.');
      let current = result;
      
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      
      const lastPart = parts[parts.length - 1];
      if (Array.isArray(current[lastPart])) {
        current[lastPart] = current[lastPart].filter((_, i) => i !== index);
      }
      
      return { ...result };
    });
  }, []);

  // Save changes
  const save = useCallback(async () => {
    try {
      const configKey = `${sectionKey}_content`;
      await saveSiteConfig({
        ...siteConfig,
        [configKey]: localData
      });
      setOriginalData(localData);
      return true;
    } catch (error) {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
      return false;
    }
  }, [saveSiteConfig, siteConfig, sectionKey, localData]);

  // Cancel changes
  const cancel = useCallback(() => {
    setLocalData(originalData);
  }, [originalData]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    const defaults = DEFAULT_SECTION_DATA[sectionKey] || {};
    setLocalData(defaults);
  }, [sectionKey]);

  return {
    // State
    isAdmin,
    isLoading: isLoadingConfig,
    isSaving,
    hasChanges,
    data: localData,
    
    // Field operations
    updateField,
    getFieldValue,
    addArrayItem,
    removeArrayItem,
    
    // Actions
    save,
    cancel,
    resetToDefaults,
    setData: setLocalData
  };
}

/**
 * Hook tổng hợp để quản lý Live Edit cho toàn bộ trang
 * Hỗ trợ nhiều sections cùng lúc
 */
export function usePageLiveEdit(sectionKeys = []) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['admin', 'super_admin', 'manager']);
  
  const { data: siteConfig, isLoading: isLoadingConfig } = useSiteConfig();
  const { mutateAsync: saveSiteConfig, isPending: isSaving } = useSiteConfigMutation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [changes, setChanges] = useState({});

  // Check for any changes
  const hasChanges = useMemo(() => {
    return Object.keys(changes).length > 0;
  }, [changes]);

  // Get current section data
  const getSectionData = useCallback((sectionKey) => {
    // Check changes first
    if (changes[sectionKey]) {
      return { ...DEFAULT_SECTION_DATA[sectionKey], ...changes[sectionKey] };
    }
    // Then check site config
    const configKey = `${sectionKey}_content`;
    if (siteConfig?.[configKey]) {
      return siteConfig[configKey];
    }
    // Finally use defaults
    return DEFAULT_SECTION_DATA[sectionKey] || {};
  }, [changes, siteConfig]);

  // Update a field in a section
  const updateField = useCallback((sectionKey, fieldPath, value) => {
    setChanges(prev => {
      const sectionChanges = { ...prev[sectionKey] };
      
      // Handle nested paths
      const parts = fieldPath.split(/\.|\[|\]/).filter(Boolean);
      
      if (parts.length === 1) {
        sectionChanges[fieldPath] = value;
      } else {
        // For nested paths, we need to merge with existing data
        const currentData = getSectionData(sectionKey);
        const updatedData = { ...currentData };
        
        let current = updatedData;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          const isNumber = /^\d+$/.test(part);
          
          if (isNumber) {
            const idx = parseInt(part);
            if (!Array.isArray(current)) current = [];
            current[idx] = { ...current[idx] };
            current = current[idx];
          } else {
            current[part] = { ...current[part] };
            current = current[part];
          }
        }
        
        const lastPart = parts[parts.length - 1];
        current[lastPart] = value;
        
        return { ...prev, [sectionKey]: updatedData };
      }
      
      return { ...prev, [sectionKey]: sectionChanges };
    });
  }, [getSectionData]);

  // Get field value
  const getFieldValue = useCallback((sectionKey, fieldPath, defaultValue = "") => {
    const sectionData = getSectionData(sectionKey);
    
    const parts = fieldPath.split(/\.|\[|\]/).filter(Boolean);
    let current = sectionData;
    
    for (const part of parts) {
      if (current === undefined || current === null) return defaultValue;
      const isNumber = /^\d+$/.test(part);
      current = isNumber ? current[parseInt(part)] : current[part];
    }
    
    return current ?? defaultValue;
  }, [getSectionData]);

  // Save all changes
  const save = useCallback(async () => {
    try {
      const updatedConfig = { ...siteConfig };
      
      // Merge all section changes
      Object.entries(changes).forEach(([sectionKey, sectionChanges]) => {
        const configKey = `${sectionKey}_content`;
        const existingData = siteConfig?.[configKey] || DEFAULT_SECTION_DATA[sectionKey] || {};
        updatedConfig[configKey] = { ...existingData, ...sectionChanges };
      });
      
      await saveSiteConfig(updatedConfig);
      setChanges({});
      setIsEditing(false);
      showAdminAlert('✅ Đã lưu tất cả thay đổi!', 'success');
      return true;
    } catch (error) {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
      return false;
    }
  }, [saveSiteConfig, siteConfig, changes]);

  // Cancel all changes
  const cancel = useCallback(() => {
    setChanges({});
    setIsEditing(false);
  }, []);

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
    changes,
    
    // Actions
    getSectionData,
    updateField,
    getFieldValue,
    save,
    cancel,
    startEditing,
    setIsEditing
  };
}

export default useSectionLiveEdit;