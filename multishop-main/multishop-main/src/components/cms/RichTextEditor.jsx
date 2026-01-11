/**
 * RichTextEditor - Inline Rich Text Editor cho Live Edit
 * 
 * Hỗ trợ:
 * - Bold, Italic, Underline
 * - Màu chữ, màu nền
 * - Font size
 * - Text alignment
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Palette, Type, X, Check, Pipette, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Preset colors
const PRESET_COLORS = [
  '#0F0F0F', '#374151', '#6B7280', '#9CA3AF', '#FFFFFF',
  '#7CB342', '#558B2F', '#33691E', // Greens
  '#FF9800', '#F57C00', '#E65100', // Oranges
  '#2196F3', '#1976D2', '#0D47A1', // Blues
  '#E91E63', '#C2185B', '#880E4F', // Pinks
  '#9C27B0', '#7B1FA2', '#4A148C', // Purples
];

// Font sizes
const FONT_SIZES = [
  { label: 'XS', value: '0.75rem' },
  { label: 'S', value: '0.875rem' },
  { label: 'M', value: '1rem' },
  { label: 'L', value: '1.125rem' },
  { label: 'XL', value: '1.25rem' },
  { label: '2XL', value: '1.5rem' },
  { label: '3XL', value: '1.875rem' },
  { label: '4XL', value: '2.25rem' },
  { label: '5XL', value: '3rem' },
];

/**
 * Mini Toolbar xuất hiện khi edit
 */
function MiniToolbar({ position, onFormat, onClose, currentStyles }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [customColor, setCustomColor] = useState('#7CB342');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="fixed z-[200] bg-white rounded-xl shadow-2xl border border-gray-200 p-2 flex items-center gap-1"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Text Formatting */}
      <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
        <ToolbarButton
          icon={Bold}
          active={currentStyles?.fontWeight === 'bold'}
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

      {/* Font Size */}
      <div className="relative border-r border-gray-200 pr-2 mr-1">
        <ToolbarButton
          icon={Type}
          onClick={() => {
            setShowFontSize(!showFontSize);
            setShowColorPicker(false);
          }}
          title="Font Size"
        />
        <AnimatePresence>
          {showFontSize && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 grid grid-cols-3 gap-1 w-40"
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
            setShowColorPicker(!showColorPicker);
            setShowFontSize(false);
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
              className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-48"
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

/**
 * RichTextEditable - Component chính cho inline rich text editing
 */
export function RichTextEditable({
  value,
  onChange,
  isEditing,
  className = "",
  as: Component = "span",
  placeholder = "Nhập nội dung...",
  label = "",
  styles = {}, // Custom styles from CMS
  onStyleChange // Callback khi thay đổi styles
}) {
  const [isActive, setIsActive] = useState(false);
  const [localValue, setLocalValue] = useState(value || "");
  const [localStyles, setLocalStyles] = useState(styles || {});
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const elementRef = useRef(null);

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  useEffect(() => {
    setLocalStyles(styles || {});
  }, [styles]);

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

  const handleClick = () => {
    if (isEditing) {
      setIsActive(true);
      updateToolbarPosition();
    }
  };

  const handleBlur = () => {
    // Delay để cho phép click vào toolbar
    setTimeout(() => {
      if (!document.activeElement?.closest('.mini-toolbar')) {
        setIsActive(false);
        if (localValue !== value) {
          onChange?.(localValue);
        }
        if (JSON.stringify(localStyles) !== JSON.stringify(styles)) {
          onStyleChange?.(localStyles);
        }
      }
    }, 200);
  };

  const handleFormat = (property, formatValue) => {
    if (property === 'reset') {
      setLocalStyles({});
      onStyleChange?.({});
      return;
    }
    
    const newStyles = { ...localStyles, [property]: formatValue };
    setLocalStyles(newStyles);
    onStyleChange?.(newStyles);
  };

  const handleInput = (e) => {
    setLocalValue(e.target.innerText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setLocalValue(value || "");
      setLocalStyles(styles || {});
      setIsActive(false);
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      elementRef.current?.blur();
    }
  };

  // Merge default and custom styles
  const mergedStyles = {
    ...localStyles,
    outline: isActive ? '2px dashed #7CB342' : 'none',
    outlineOffset: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  };

  if (!isEditing) {
    return (
      <Component 
        className={className} 
        style={styles}
        data-live-edit={label || undefined}
      >
        {value || placeholder}
      </Component>
    );
  }

  return (
    <>
      <Component
        ref={elementRef}
        contentEditable
        suppressContentEditableWarning
        onClick={handleClick}
        onBlur={handleBlur}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={cn(className, "cursor-text")}
        style={mergedStyles}
        data-live-edit={label || undefined}
      >
        {localValue || placeholder}
      </Component>

      <AnimatePresence>
        {isActive && (
          <MiniToolbar
            position={toolbarPosition}
            onFormat={handleFormat}
            onClose={() => setIsActive(false)}
            currentStyles={localStyles}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default RichTextEditable;