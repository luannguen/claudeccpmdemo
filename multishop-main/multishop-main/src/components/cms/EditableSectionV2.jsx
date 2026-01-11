/**
 * EditableSectionV2 - Enhanced Editable Components with Rich Text Support
 * 
 * FIXED: Cursor jumping issue by using controlled input for active state
 * 
 * Components:
 * - EditableTextV2: Text với rich formatting (bold, color, font-size, font-family)
 * - EditableImageV2: Image editing
 * - EditableButtonV2: Button/CTA editing
 * - EditableSectionWrapper: Wrapper cho section với pencil indicator
 * - EditableArrayItem: Wrapper cho array items
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit3, Check, X, Image as ImageIcon, Upload,
  Bold, Italic, Underline, Palette, Type, AlignLeft, AlignCenter, AlignRight, RotateCcw, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLiveEditContext } from "./LiveEditContext";
import { PRESET_COLORS, FONT_SIZES, AVAILABLE_FONTS } from "./liveEditConfig";

// ========== MINI TOOLBAR ==========
function MiniToolbar({ position, onFormat, onClose, currentStyles, showRichOptions = true }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [customColor, setCustomColor] = useState('#7CB342');

  const closeAllDropdowns = () => {
    setShowColorPicker(false);
    setShowFontSize(false);
    setShowFontFamily(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 p-2 flex items-center gap-1 mini-toolbar"
      style={{
        top: Math.max(80, position.top),
        left: Math.min(Math.max(220, position.left), window.innerWidth - 220),
        transform: 'translateX(-50%)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {showRichOptions && (
        <>
          {/* Text Formatting */}
          <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
            <ToolbarButton
              icon={Bold}
              active={currentStyles?.fontWeight === 'bold' || currentStyles?.fontWeight === '700'}
              onClick={() => onFormat('fontWeight', currentStyles?.fontWeight === 'bold' ? 'normal' : 'bold')}
              title="Bold"
            />
            <ToolbarButton
              icon={Italic}
              active={currentStyles?.fontStyle === 'italic'}
              onClick={() => onFormat('fontStyle', currentStyles?.fontStyle === 'italic' ? 'normal' : 'italic')}
              title="Italic"
            />
            <ToolbarButton
              icon={Underline}
              active={currentStyles?.textDecoration?.includes('underline')}
              onClick={() => onFormat('textDecoration', currentStyles?.textDecoration?.includes('underline') ? 'none' : 'underline')}
              title="Underline"
            />
          </div>

          {/* Font Family */}
          <div className="relative border-r border-gray-200 pr-2 mr-1">
            <button
              onClick={() => {
                closeAllDropdowns();
                setShowFontFamily(!showFontFamily);
              }}
              title="Font"
              className="h-8 px-2 rounded-lg flex items-center gap-1 hover:bg-gray-100 text-gray-600 text-xs font-medium"
            >
              Aa
              <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showFontFamily && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 w-44 z-[300] max-h-60 overflow-y-auto"
                >
                  {AVAILABLE_FONTS.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => {
                        onFormat('fontFamily', font.family);
                        setShowFontFamily(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-100 transition-colors",
                        currentStyles?.fontFamily === font.family && "bg-[#7CB342] text-white hover:bg-[#689F38]"
                      )}
                      style={{ fontFamily: font.family }}
                    >
                      {font.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Font Size */}
          <div className="relative border-r border-gray-200 pr-2 mr-1">
            <ToolbarButton
              icon={Type}
              onClick={() => {
                closeAllDropdowns();
                setShowFontSize(!showFontSize);
              }}
              title="Font Size"
            />
            <AnimatePresence>
              {showFontSize && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 grid grid-cols-3 gap-1 w-40 z-[300]"
                >
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => {
                        onFormat('fontSize', size.value);
                        setShowFontSize(false);
                      }}
                      className={cn(
                        "px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors",
                        currentStyles?.fontSize === size.value && "bg-[#7CB342] text-white"
                      )}
                    >
                      {size.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Color Picker */}
          <div className="relative border-r border-gray-200 pr-2 mr-1">
            <ToolbarButton
              icon={Palette}
              onClick={() => {
                closeAllDropdowns();
                setShowColorPicker(!showColorPicker);
              }}
              title="Text Color"
              style={{ color: currentStyles?.color || '#0F0F0F' }}
            />
            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-52 z-[300]"
                >
                  <div className="grid grid-cols-5 gap-1.5 mb-3">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          onFormat('color', color);
                          setShowColorPicker(false);
                        }}
                        className={cn(
                          "w-7 h-7 rounded-md border-2 transition-transform hover:scale-110",
                          currentStyles?.color === color ? "border-[#7CB342] ring-2 ring-[#7CB342]/30" : "border-gray-200"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-10 h-8 p-0 border-0"
                    />
                    <Input
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="flex-1 h-8 text-xs"
                      placeholder="#HEX"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        onFormat('color', customColor);
                        setShowColorPicker(false);
                      }}
                      className="h-8 w-8 p-0 bg-[#7CB342]"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
            <ToolbarButton
              icon={AlignLeft}
              active={currentStyles?.textAlign === 'left'}
              onClick={() => onFormat('textAlign', 'left')}
              title="Align Left"
            />
            <ToolbarButton
              icon={AlignCenter}
              active={currentStyles?.textAlign === 'center'}
              onClick={() => onFormat('textAlign', 'center')}
              title="Align Center"
            />
            <ToolbarButton
              icon={AlignRight}
              active={currentStyles?.textAlign === 'right'}
              onClick={() => onFormat('textAlign', 'right')}
              title="Align Right"
            />
          </div>
        </>
      )}

      {/* Reset & Close */}
      <ToolbarButton
        icon={RotateCcw}
        onClick={() => onFormat('reset', null)}
        title="Reset Styles"
        className="text-gray-400 hover:text-gray-600"
      />
      <ToolbarButton
        icon={X}
        onClick={onClose}
        title="Close"
        className="text-gray-400 hover:text-red-500"
      />
    </motion.div>
  );
}

function ToolbarButton({ icon: Icon, active, onClick, title, className, style }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
        active ? "bg-[#7CB342] text-white" : "hover:bg-gray-100 text-gray-600",
        className
      )}
      style={style}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

// ========== EDITABLE TEXT V2 - FIXED CURSOR ISSUE ==========
export function EditableTextV2({
  sectionKey,
  fieldPath,
  defaultValue = "",
  className = "",
  as: Component = "span",
  placeholder = "Nhập nội dung...",
  label = "",
  multiline = false,
  richText = true
}) {
  const { 
    isEditMode, 
    getSectionFieldValue, 
    updateSectionField,
    getSectionFieldStyles,
    updateSectionFieldStyles
  } = useLiveEditContext();

  const [isActive, setIsActive] = useState(false);
  const [localValue, setLocalValue] = useState("");
  const [localStyles, setLocalStyles] = useState({});
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const elementRef = useRef(null);
  const inputRef = useRef(null);

  // Get current saved value
  const savedValue = getSectionFieldValue(sectionKey, fieldPath, defaultValue);
  const savedStyles = getSectionFieldStyles(sectionKey, fieldPath);

  // Initialize local value when entering edit mode
  useEffect(() => {
    if (isActive) {
      setLocalValue(savedValue || defaultValue || "");
      setLocalStyles(savedStyles || {});
    }
  }, [isActive]);

  // Calculate toolbar position
  const updateToolbarPosition = useCallback(() => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top - 60,
        left: rect.left + rect.width / 2
      });
    }
  }, []);

  const handleActivate = (e) => {
    if (isEditMode && !isActive) {
      e.stopPropagation();
      setLocalValue(savedValue || defaultValue || "");
      setLocalStyles(savedStyles || {});
      setIsActive(true);
      updateToolbarPosition();
      // Focus input after state update
      setTimeout(() => {
        inputRef.current?.focus();
        // Move cursor to end
        if (inputRef.current) {
          const len = inputRef.current.value?.length || 0;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 50);
    }
  };

  const handleSave = () => {
    // Save value if changed
    if (localValue !== savedValue) {
      updateSectionField(sectionKey, fieldPath, localValue);
    }
    // Save styles if changed
    if (Object.keys(localStyles).length > 0 && JSON.stringify(localStyles) !== JSON.stringify(savedStyles)) {
      updateSectionFieldStyles(sectionKey, fieldPath, localStyles);
    }
    setIsActive(false);
  };

  const handleCancel = () => {
    setLocalValue(savedValue || defaultValue || "");
    setLocalStyles(savedStyles || {});
    setIsActive(false);
  };

  const handleFormat = (property, value) => {
    if (property === 'reset') {
      setLocalStyles({});
      return;
    }
    setLocalStyles(prev => ({ ...prev, [property]: value }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
    if (e.key === 'Enter' && !e.shiftKey && !multiline) {
      e.preventDefault();
      handleSave();
    }
  };

  // Display value (saved or default)
  const displayValue = savedValue || defaultValue || placeholder;

  // Build merged styles for display
  const displayStyles = { ...savedStyles };
  const activeStyles = { ...localStyles };

  // Not in edit mode - render plain text
  if (!isEditMode) {
    return (
      <Component className={className} style={displayStyles}>
        {displayValue}
      </Component>
    );
  }

  // Edit mode but not active - show clickable element
  if (!isActive) {
    return (
      <Component
        ref={elementRef}
        onClick={handleActivate}
        className={cn(className, "cursor-pointer hover:outline hover:outline-2 hover:outline-dashed hover:outline-[#7CB342]/50 hover:outline-offset-2 transition-all")}
        style={displayStyles}
        data-live-edit={label || fieldPath}
      >
        {displayValue}
      </Component>
    );
  }

  // Active editing mode - show input
  return (
    <>
      <div ref={elementRef} className="relative inline-block w-full">
        {multiline ? (
          <Textarea
            ref={inputRef}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              // Don't blur if clicking on toolbar
              if (!e.relatedTarget?.closest('.mini-toolbar')) {
                setTimeout(handleSave, 100);
              }
            }}
            className={cn(
              className,
              "w-full min-h-[80px] resize-y bg-white border-2 border-[#7CB342] rounded-lg p-2 focus:ring-2 focus:ring-[#7CB342]/30"
            )}
            style={activeStyles}
            placeholder={placeholder}
          />
        ) : (
          <Input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              if (!e.relatedTarget?.closest('.mini-toolbar')) {
                setTimeout(handleSave, 100);
              }
            }}
            className={cn(
              "w-full bg-white border-2 border-[#7CB342] rounded-lg focus:ring-2 focus:ring-[#7CB342]/30",
              className
            )}
            style={activeStyles}
            placeholder={placeholder}
          />
        )}
      </div>

      <AnimatePresence>
        {isActive && richText && (
          <MiniToolbar
            position={toolbarPosition}
            onFormat={handleFormat}
            onClose={handleSave}
            currentStyles={localStyles}
            showRichOptions={richText}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ========== EDITABLE IMAGE V2 ==========
export function EditableImageV2({
  sectionKey,
  fieldPath,
  defaultValue = "",
  className = "",
  alt = "",
  label = "",
  aspectRatio = "auto"
}) {
  const { isEditMode, getSectionFieldValue, updateSectionField } = useLiveEditContext();
  
  const [showInput, setShowInput] = useState(false);
  const [localSrc, setLocalSrc] = useState("");
  const [imageError, setImageError] = useState(false);

  const savedSrc = getSectionFieldValue(sectionKey, fieldPath, defaultValue);

  useEffect(() => {
    setLocalSrc(savedSrc || defaultValue);
    setImageError(false);
  }, [savedSrc, defaultValue]);

  const handleSave = () => {
    if (localSrc && localSrc !== savedSrc) {
      updateSectionField(sectionKey, fieldPath, localSrc);
    }
    setShowInput(false);
  };

  const handleCancel = () => {
    setLocalSrc(savedSrc || defaultValue);
    setShowInput(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const currentSrc = showInput ? localSrc : (savedSrc || defaultValue);

  // Render image or placeholder
  const renderImage = () => {
    if (imageError || !currentSrc) {
      return (
        <div className={cn("bg-gray-100 flex items-center justify-center", className)}>
          <div className="text-center text-gray-400 p-4">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có ảnh</p>
          </div>
        </div>
      );
    }
    return (
      <img 
        src={currentSrc} 
        alt={alt} 
        className={className}
        onError={handleImageError}
      />
    );
  };

  if (!isEditMode) {
    return renderImage();
  }

  return (
    <div className="relative group" data-live-edit={label || "Hình ảnh"}>
      {renderImage()}
      
      {/* Overlay with edit button */}
      <div className={cn(
        "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200",
        showInput ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
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
              onChange={(e) => {
                setLocalSrc(e.target.value);
                setImageError(false);
              }}
              placeholder="https://example.com/image.jpg"
              className="mb-3"
              autoFocus
            />
            {localSrc && (
              <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 h-24">
                <img 
                  src={localSrc} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={() => {}}
                />
              </div>
            )}
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
            onClick={() => {
              setLocalSrc(savedSrc || defaultValue);
              setShowInput(true);
            }}
            className="bg-white text-gray-800 hover:bg-gray-100 shadow-lg"
          >
            <ImageIcon className="w-4 h-4 mr-2" /> Đổi Ảnh
          </Button>
        )}
      </div>
    </div>
  );
}

// ========== SECTION WRAPPER ==========
export function EditableSectionWrapper({ children, sectionKey, label }) {
  const { isEditMode } = useLiveEditContext();

  if (!isEditMode) {
    return children;
  }

  return (
    <div className="relative group section-editable" data-section={sectionKey}>
      {children}
      
      {/* Section indicator on hover */}
      <div className="absolute -top-3 left-4 z-50 bg-[#7CB342] text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <Edit3 className="w-3 h-3 inline mr-1" />
        {label || sectionKey}
      </div>
    </div>
  );
}

// ========== EDITABLE BUTTON V2 ==========
export function EditableButtonV2({
  sectionKey,
  fieldPath,
  defaultValue = "Button",
  className = "",
  onClick,
  label = "Nút bấm"
}) {
  const { isEditMode, getSectionFieldValue, updateSectionField } = useLiveEditContext();
  
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState("");
  const inputRef = useRef(null);

  const savedValue = getSectionFieldValue(sectionKey, fieldPath, defaultValue);

  const handleClick = (e) => {
    if (isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      setLocalValue(savedValue || defaultValue);
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      onClick?.(e);
    }
  };

  const handleSave = () => {
    if (localValue !== savedValue) {
      updateSectionField(sectionKey, fieldPath, localValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setLocalValue(savedValue || defaultValue);
      setIsEditing(false);
    }
  };

  if (!isEditMode) {
    return (
      <button className={className} onClick={onClick}>
        {savedValue || defaultValue}
      </button>
    );
  }

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-2">
        <Input
          ref={inputRef}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="h-auto py-2 px-4 min-w-[120px] text-center"
        />
      </div>
    );
  }

  return (
    <button 
      className={cn(className, "relative cursor-pointer")} 
      onClick={handleClick}
      data-live-edit={label}
    >
      {savedValue || defaultValue}
    </button>
  );
}

// ========== EDITABLE ARRAY ITEM ==========
export function EditableArrayItem({ 
  children, 
  index, 
  sectionKey, 
  onRemove,
  label = "Item"
}) {
  const { isEditMode } = useLiveEditContext();

  if (!isEditMode) {
    return children;
  }

  return (
    <div 
      className="relative group/item" 
      data-live-edit-array-item={sectionKey}
      data-live-edit-index={index + 1}
    >
      {children}
      
      {/* Remove button - show on hover */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600 z-50 shadow-lg"
          title="Xóa item"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default {
  EditableTextV2,
  EditableImageV2,
  EditableSectionWrapper,
  EditableButtonV2,
  EditableArrayItem
};