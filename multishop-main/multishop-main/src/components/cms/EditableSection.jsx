/**
 * EditableSection - Wrapper component cho phép edit nội dung section
 * 
 * Sử dụng:
 * <EditableSection sectionKey="hero" isEditing={isEditing}>
 *   {(data, updateField) => (
 *     <div>
 *       <EditableField field="title" data={data} updateField={updateField} />
 *     </div>
 *   )}
 * </EditableSection>
 */

import React from "react";
import { motion } from "framer-motion";
import { Edit3, Check, X, Image, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ========== EDITABLE FIELD INLINE ==========
export function EditableFieldInline({
  value,
  onChange,
  isEditing,
  className = "",
  as: Component = "span",
  multiline = false,
  placeholder = "Nhập nội dung...",
  label = "" // Label để hiện khi hover
}) {
  const [localValue, setLocalValue] = React.useState(value || "");
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  if (!isEditing) {
    // Thêm data-live-edit để hiện icon bút khi hover (chỉ khi có label)
    return (
      <Component 
        className={className} 
        data-live-edit={label || undefined}
      >
        {value || placeholder}
      </Component>
    );
  }

  const handleBlur = () => {
    setIsFocused(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value || "");
      inputRef.current?.blur();
    }
  };

  const editClassName = cn(
    className,
    "border-2 border-dashed border-[#7CB342] bg-white/95",
    "focus:border-solid focus:ring-2 focus:ring-[#7CB342]/30",
    "rounded-lg px-3 py-2 transition-all duration-200",
    isFocused && "shadow-lg shadow-[#7CB342]/20"
  );

  if (multiline) {
    return (
      <Textarea
        ref={inputRef}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        className={editClassName}
        placeholder={placeholder}
        rows={4}
      />
    );
  }

  return (
    <Input
      ref={inputRef}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onFocus={() => setIsFocused(true)}
      onKeyDown={handleKeyDown}
      className={editClassName}
      placeholder={placeholder}
    />
  );
}

// ========== EDITABLE IMAGE INLINE ==========
export function EditableImageInline({
  src,
  onChange,
  isEditing,
  className = "",
  alt = "",
  label = "" // Label để hiện khi hover
}) {
  const [showInput, setShowInput] = React.useState(false);
  const [localSrc, setLocalSrc] = React.useState(src || "");

  React.useEffect(() => {
    setLocalSrc(src || "");
  }, [src]);

  if (!isEditing) {
    return (
      <div className="relative" data-live-edit={label || "Hình ảnh"}>
        <img src={src} alt={alt} className={className} />
      </div>
    );
  }

  const handleSave = () => {
    onChange(localSrc);
    setShowInput(false);
  };

  return (
    <div className="relative group">
      <img src={localSrc || src} alt={alt} className={className} />
      
      <div className={cn(
        "absolute inset-0 bg-black/60 flex items-center justify-center rounded-inherit",
        showInput ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        "transition-opacity duration-200"
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
                onClick={() => {
                  setLocalSrc(src || "");
                  setShowInput(false);
                }}
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

// ========== SECTION EDIT INDICATOR ==========
export function SectionEditIndicator({ label, isEditing, children }) {
  if (!isEditing) return children;

  return (
    <div className="relative group">
      {/* Edit indicator badge */}
      <div className="absolute -top-3 left-4 z-50 bg-[#7CB342] text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Edit3 className="w-3 h-3 inline mr-1" />
        {label}
      </div>
      
      {/* Content with hover border */}
      <div className="border-2 border-transparent group-hover:border-dashed group-hover:border-[#7CB342]/50 rounded-xl transition-all duration-200">
        {children}
      </div>
    </div>
  );
}

// ========== ARRAY FIELD EDITOR ==========
export function ArrayFieldEditor({
  items = [],
  onChange,
  renderItem,
  newItemTemplate = {},
  addLabel = "Thêm mới",
  className = ""
}) {
  const handleAdd = () => {
    const newItem = { 
      ...newItemTemplate, 
      id: Date.now() 
    };
    onChange([...items, newItem]);
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index, updatedItem) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    onChange(newItems);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <div key={item.id || index} className="relative group">
          {renderItem(item, index, (updates) => handleUpdate(index, { ...item, ...updates }))}
          
          {/* Delete button */}
          <button
            onClick={() => handleRemove(index)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      
      {/* Add button */}
      <Button
        variant="outline"
        onClick={handleAdd}
        className="w-full border-dashed border-[#7CB342] text-[#7CB342] hover:bg-[#7CB342]/10"
      >
        <Plus className="w-4 h-4 mr-2" /> {addLabel}
      </Button>
    </div>
  );
}

// ========== EXPORT ==========
export default {
  EditableFieldInline,
  EditableImageInline,
  SectionEditIndicator,
  ArrayFieldEditor
};