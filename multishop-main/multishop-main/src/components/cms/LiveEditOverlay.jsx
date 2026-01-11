/**
 * LiveEditOverlay - Cho phép admin chỉnh sửa nội dung trực tiếp trên trang
 * 
 * Cung cấp:
 * - EditableText: Text/Textarea có thể edit inline
 * - EditableImage: Image có thể thay đổi URL
 * - LiveEditToolbar: Toolbar điều khiển chế độ edit
 * - LiveEditProvider: Context provider cho Live Edit
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit3, Save, X, Image, Check, Loader2, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthProvider";
import { usePageMutations, useSiteConfigMutation, useSiteConfig } from "@/components/hooks/useCMSPages";
import { showAdminAlert } from "@/components/AdminAlert";
import { DEFAULT_SECTION_DATA } from "@/components/cms/liveEditTypes";

// ========== EDITABLE FIELD COMPONENTS ==========

/**
 * EditableText - Text có thể edit inline
 * Sử dụng contentEditable cho trải nghiệm tự nhiên hơn
 */
export function EditableText({ 
  value, 
  onChange, 
  isEditing, 
  className = "",
  placeholder = "Nhập nội dung...",
  as: Component = "span",
  multiline = false,
  fieldName = ""
}) {
  const [localValue, setLocalValue] = useState(value || "");
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  // Không edit mode - render text bình thường
  if (!isEditing) {
    return (
      <Component 
        className={className} 
        data-editable={fieldName || undefined}
      >
        {value || placeholder}
      </Component>
    );
  }

  // Edit mode - render input/textarea
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleKeyDown = (e) => {
    // Enter to save (for single line)
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    }
    // Escape to cancel
    if (e.key === 'Escape') {
      setLocalValue(value || "");
      inputRef.current?.blur();
    }
  };

  const baseClassName = `
    ${className} 
    border-2 border-dashed border-[#7CB342] 
    bg-white/95 
    focus:border-solid focus:ring-2 focus:ring-[#7CB342]/30
    rounded-lg px-3 py-2
    transition-all duration-200
    ${isFocused ? 'shadow-lg shadow-[#7CB342]/20' : ''}
  `;

  if (multiline) {
    return (
      <Textarea
        ref={inputRef}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className={baseClassName}
        placeholder={placeholder}
        rows={4}
      />
    );
  }

  return (
    <Input
      ref={inputRef}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      className={baseClassName}
      placeholder={placeholder}
    />
  );
}

/**
 * EditableImage - Image có thể thay đổi URL
 */
export function EditableImage({ 
  src, 
  onChange, 
  isEditing, 
  className = "",
  alt = "",
  fieldName = ""
}) {
  const [showInput, setShowInput] = useState(false);
  const [localSrc, setLocalSrc] = useState(src || "");

  useEffect(() => {
    setLocalSrc(src || "");
  }, [src]);

  if (!isEditing) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className} 
        data-editable={fieldName || undefined}
      />
    );
  }

  const handleSave = () => {
    onChange(localSrc);
    setShowInput(false);
  };

  const handleCancel = () => {
    setLocalSrc(src || "");
    setShowInput(false);
  };

  return (
    <div className="relative group">
      <img src={localSrc || src} alt={alt} className={className} />
      
      {/* Overlay on hover */}
      <div className={`
        absolute inset-0 bg-black/60 
        ${showInput ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} 
        transition-opacity duration-200 
        flex items-center justify-center
        rounded-inherit
      `}>
        {showInput ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-4 shadow-2xl w-80 max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Hình Ảnh
            </label>
            <Input
              value={localSrc}
              onChange={(e) => setLocalSrc(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleSave}
                className="bg-[#7CB342] hover:bg-[#689F38] flex-1"
              >
                <Check className="w-4 h-4 mr-1" /> Lưu
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCancel}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </motion.div>
        ) : (
          <Button 
            onClick={() => setShowInput(true)}
            className="bg-white text-gray-800 hover:bg-gray-100 shadow-lg"
          >
            <Image className="w-4 h-4 mr-2" /> Đổi Ảnh
          </Button>
        )}
      </div>
    </div>
  );
}

// ========== LIVE EDIT FLOATING BUTTON ==========

/**
 * LiveEditFloatingButton - Nút floating nhỏ gọn, ẩn khi không cần
 * - Mặc định ẩn, hover góc dưới phải để hiện
 * - Khi đang edit: hiện toolbar mini
 */
export function LiveEditFloatingButton({ 
  isEditing, 
  onToggleEdit, 
  onSave, 
  onCancel,
  isSaving,
  hasChanges,
  isVisible = true
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  
  if (!isVisible) return null;

  // Khi đang edit - luôn hiện toolbar
  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-2"
      >
        <motion.div 
          className="bg-white rounded-full shadow-2xl border border-gray-200 px-4 py-2 flex items-center gap-3"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Đang sửa</span>
          </div>
          
          <div className="w-px h-5 bg-gray-200" />
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={isSaving}
            className="h-8 px-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            className="h-8 bg-[#7CB342] hover:bg-[#689F38] text-white"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Lưu
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // Không edit - hiện nút nhỏ khi hover
  return (
    <>
      {/* Hover zone - góc dưới phải */}
      <div 
        className="fixed bottom-0 right-0 w-24 h-24 z-[99]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
      <AnimatePresence>
        {isHovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={onToggleEdit}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed bottom-6 right-6 z-[100] w-12 h-12 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 group"
            title="Bật chế độ chỉnh sửa"
          >
            <Edit3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

// Backward compatible alias
export function LiveEditToolbar(props) {
  return <LiveEditFloatingButton {...props} />;
}

// ========== LIVE EDIT CONTEXT ==========

const LiveEditContext = React.createContext({
  isEditing: false,
  isAdmin: false,
  pageData: null,
  changes: {},
  updateField: () => {},
  updateSection: () => {},
  getFieldValue: () => null,
  getSectionData: () => ({}),
  updateSectionField: () => {}
});

export function useLiveEdit() {
  return React.useContext(LiveEditContext);
}

// ========== LIVE EDIT PROVIDER ==========

export function LiveEditProvider({ 
  children, 
  pageSlug,
  pageData: initialPageData,
  enabled = true,
  onSave: externalOnSave,
  sectionKeys = [] // Danh sách section keys để load data
}) {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(['admin', 'super_admin', 'manager']);
  
  const [isEditing, setIsEditing] = useState(false);
  const [pageData, setPageData] = useState(initialPageData);
  const [originalData, setOriginalData] = useState(initialPageData);
  const [changes, setChanges] = useState({});
  const [sectionChanges, setSectionChanges] = useState({});
  
  const { updatePage, isUpdating } = usePageMutations();
  const { data: siteConfig, isLoading: isLoadingConfig } = useSiteConfig();
  const { mutateAsync: saveSiteConfig, isPending: isSavingConfig } = useSiteConfigMutation();

  // Sync with initial data
  useEffect(() => {
    if (initialPageData) {
      setPageData(initialPageData);
      setOriginalData(initialPageData);
      setChanges({});
    }
  }, [initialPageData]);

  // Check for changes
  const hasChanges = useMemo(() => {
    return Object.keys(changes).length > 0 || Object.keys(sectionChanges).length > 0;
  }, [changes, sectionChanges]);

  // Update a field
  const updateField = useCallback((field, value) => {
    setPageData(prev => ({ ...prev, [field]: value }));
    setChanges(prev => ({ ...prev, [field]: value }));
  }, []);

  // Update a section by index
  const updateSection = useCallback((sectionIndex, data) => {
    setPageData(prev => {
      const sections = prev?.sections ? [...prev.sections] : [];
      sections[sectionIndex] = { ...sections[sectionIndex], ...data };
      return { ...prev, sections };
    });
    setChanges(prev => ({ 
      ...prev, 
      [`section_${sectionIndex}`]: data 
    }));
  }, []);

  // Get current field value (from changes or original)
  const getFieldValue = useCallback((field, defaultValue = "") => {
    if (changes[field] !== undefined) return changes[field];
    if (pageData?.[field] !== undefined) return pageData[field];
    return defaultValue;
  }, [changes, pageData]);

  // ========== SECTION-BASED EDITING ==========
  
  // Get section data (from changes, siteConfig, or defaults)
  const getSectionData = useCallback((sectionKey) => {
    // Check section changes first
    if (sectionChanges[sectionKey]) {
      const base = siteConfig?.[`${sectionKey}_content`] || DEFAULT_SECTION_DATA[sectionKey] || {};
      return { ...base, ...sectionChanges[sectionKey] };
    }
    // Then check site config
    const configKey = `${sectionKey}_content`;
    if (siteConfig?.[configKey]) {
      return siteConfig[configKey];
    }
    // Finally use defaults
    return DEFAULT_SECTION_DATA[sectionKey] || {};
  }, [sectionChanges, siteConfig]);

  // Update a field within a section
  const updateSectionField = useCallback((sectionKey, fieldPath, value) => {
    setSectionChanges(prev => {
      const currentChanges = prev[sectionKey] || {};
      
      // Handle nested paths like "features[0].title"
      const parts = fieldPath.split(/\.|\[|\]/).filter(Boolean);
      
      if (parts.length === 1) {
        return {
          ...prev,
          [sectionKey]: { ...currentChanges, [fieldPath]: value }
        };
      }
      
      // For nested paths, build the full updated object
      const currentData = getSectionData(sectionKey);
      const updatedData = JSON.parse(JSON.stringify(currentData)); // Deep clone
      
      let current = updatedData;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const isNumber = /^\d+$/.test(part);
        
        if (isNumber) {
          const idx = parseInt(part);
          if (!Array.isArray(current)) break;
          if (!current[idx]) current[idx] = {};
          current = current[idx];
        } else {
          if (!current[part]) current[part] = {};
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
      
      return {
        ...prev,
        [sectionKey]: updatedData
      };
    });
  }, [getSectionData]);

  // Get field value from section
  const getSectionFieldValue = useCallback((sectionKey, fieldPath, defaultValue = "") => {
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

  // Save changes
  const handleSave = async () => {
    try {
      // Save section changes to SiteConfig
      if (Object.keys(sectionChanges).length > 0) {
        const updatedConfig = { ...siteConfig };
        
        Object.entries(sectionChanges).forEach(([sectionKey, changes]) => {
          const configKey = `${sectionKey}_content`;
          const existingData = siteConfig?.[configKey] || DEFAULT_SECTION_DATA[sectionKey] || {};
          updatedConfig[configKey] = { ...existingData, ...changes };
        });
        
        await saveSiteConfig(updatedConfig);
        setSectionChanges({});
      }

      // External save handler (for custom pages like Home)
      if (externalOnSave && Object.keys(changes).length > 0) {
        await externalOnSave(changes);
      }

      // Default CMS page save
      if (pageData?.id && Object.keys(changes).length > 0) {
        const saveData = {
          title: pageData.title,
          subtitle: pageData.subtitle,
          content: pageData.content,
          sections_json: pageData.sections ? JSON.stringify(pageData.sections) : null,
          meta_title: pageData.meta_title,
          meta_description: pageData.meta_description
        };
        
        await updatePage({ id: pageData.id, data: saveData });
      }

      setOriginalData(pageData);
      setChanges({});
      setIsEditing(false);
      showAdminAlert('✅ Đã lưu thay đổi!', 'success');
    } catch (error) {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  };

  // Cancel changes
  const handleCancel = () => {
    setPageData(originalData);
    setChanges({});
    setSectionChanges({});
    setIsEditing(false);
  };

  // Don't show edit mode if not admin or not enabled
  if (!enabled || !isAdmin) {
    return <>{children}</>;
  }

  const isSaving = isUpdating || isSavingConfig;

  return (
    <LiveEditContext.Provider value={{
      isEditing,
      isAdmin,
      pageData,
      changes,
      updateField,
      updateSection,
      getFieldValue,
      // Section-based methods
      getSectionData,
      updateSectionField,
      getSectionFieldValue,
      siteConfig,
      // Enable edit mode
      startEditing: () => setIsEditing(true)
    }}>
      {/* Floating Edit Button */}
      <LiveEditFloatingButton
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
        hasChanges={hasChanges}
      />

      {/* Page content with edit indicators */}
      <div className={`${isEditing ? 'live-edit-active' : 'live-edit-ready'}`}>
        {children}
      </div>

      {/* CSS cho cả 2 mode: ready (hover hiện icon) và active (đang edit) */}
      <style>{`
        /* ===== READY MODE - Chưa edit, hover hiện icon bút ===== */
        .live-edit-ready [data-live-edit] {
          position: relative;
          cursor: default;
        }
        .live-edit-ready [data-live-edit]::after {
          content: '';
          position: absolute;
          top: 4px;
          right: 4px;
          width: 24px;
          height: 24px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237CB342' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/%3E%3Cpath d='m15 5 4 4'/%3E%3C/svg%3E") center/16px no-repeat;
          background-color: white;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          z-index: 50;
        }
        .live-edit-ready [data-live-edit]:hover::after {
          opacity: 1;
        }
        
        /* ===== ACTIVE MODE - Đang edit ===== */
        .live-edit-active [data-editable],
        .live-edit-active [data-live-edit] {
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .live-edit-active [data-editable]:hover,
        .live-edit-active [data-live-edit]:hover {
          outline: 2px dashed #7CB342;
          outline-offset: 4px;
          border-radius: 4px;
        }
        .live-edit-active [data-editable]::before,
        .live-edit-active [data-live-edit]::before {
          content: attr(data-editable) attr(data-live-edit);
          position: absolute;
          top: -28px;
          left: 0;
          background: #7CB342;
          color: white;
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
          white-space: nowrap;
          z-index: 10;
        }
        .live-edit-active [data-editable]:hover::before,
        .live-edit-active [data-live-edit]:hover::before {
          opacity: 1;
        }
        .live-edit-active .section-editable {
          position: relative;
        }
        .live-edit-active .section-editable::after {
          content: '';
          position: absolute;
          inset: 0;
          border: 2px dashed transparent;
          pointer-events: none;
          transition: border-color 0.2s;
          border-radius: 1rem;
        }
        .live-edit-active .section-editable:hover::after {
          border-color: rgba(124, 179, 66, 0.3);
        }
      `}</style>
    </LiveEditContext.Provider>
  );
}

export default LiveEditProvider;