/**
 * EditableArrayV2 - Editable Array Components
 * 
 * Cho phép thêm/sửa/xóa items trong arrays như:
 * - Commitments list
 * - Specialties tags
 * - Features list
 * - Any string[] or object[]
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, GripVertical, Check, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLiveEditContext } from "./LiveEditContext";

// ========== EDITABLE STRING ARRAY ==========
export function EditableStringArray({
  sectionKey,
  fieldPath,
  defaultValue = [],
  className = "",
  itemClassName = "",
  renderItem,
  placeholder = "Thêm mục mới...",
  label = "Danh sách",
  addLabel = "Thêm mới"
}) {
  const { isEditMode, getSectionFieldValue, updateSectionField } = useLiveEditContext();
  
  const [localItems, setLocalItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  // Get saved value
  const savedItems = getSectionFieldValue(sectionKey, fieldPath, defaultValue) || [];

  // Sync local with saved
  useEffect(() => {
    if (isEditing) {
      setLocalItems([...savedItems]);
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setLocalItems([...savedItems]);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      const updated = [...localItems, newItem.trim()];
      setLocalItems(updated);
      setNewItem("");
      inputRef.current?.focus();
    }
  };

  const handleRemoveItem = (index) => {
    const updated = localItems.filter((_, i) => i !== index);
    setLocalItems(updated);
  };

  const handleEditItem = (index) => {
    setEditingIndex(index);
    setEditValue(localItems[index]);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const handleSaveItemEdit = () => {
    if (editValue.trim() && editingIndex >= 0) {
      const updated = [...localItems];
      updated[editingIndex] = editValue.trim();
      setLocalItems(updated);
    }
    setEditingIndex(-1);
    setEditValue("");
  };

  const handleSave = () => {
    updateSectionField(sectionKey, fieldPath, localItems);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalItems([...savedItems]);
    setIsEditing(false);
    setNewItem("");
    setEditingIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Not in edit mode - render normal list
  if (!isEditMode) {
    return (
      <ul className={className}>
        {savedItems.map((item, idx) => (
          <li key={idx} className={itemClassName}>
            {renderItem ? renderItem(item, idx) : item}
          </li>
        ))}
      </ul>
    );
  }

  // Edit mode but not active
  if (!isEditing) {
    return (
      <div 
        className={cn("group relative cursor-pointer", className)}
        onClick={handleStartEdit}
        data-live-edit={label}
      >
        <ul>
          {savedItems.map((item, idx) => (
            <li key={idx} className={itemClassName}>
              {renderItem ? renderItem(item, idx) : item}
            </li>
          ))}
        </ul>
        
        {/* Edit indicator */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#7CB342] text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg transition-opacity">
          <Edit3 className="w-3 h-3" />
        </div>
      </div>
    );
  }

  // Active editing mode
  return (
    <div className="bg-white border-2 border-[#7CB342] rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-700 text-sm">{label}</h4>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-[#7CB342] hover:bg-[#689F38]">
            <Check className="w-3 h-3 mr-1" /> Lưu
          </Button>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
        <AnimatePresence>
          {localItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 group/item"
            >
              <GripVertical className="w-4 h-4 text-gray-300 cursor-move" />
              
              {editingIndex === idx ? (
                <Input
                  ref={editInputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveItemEdit();
                    if (e.key === 'Escape') setEditingIndex(-1);
                  }}
                  onBlur={handleSaveItemEdit}
                  className="flex-1 h-8 text-sm"
                />
              ) : (
                <span 
                  className="flex-1 text-sm cursor-pointer hover:text-[#7CB342]"
                  onClick={() => handleEditItem(idx)}
                >
                  {item}
                </span>
              )}
              
              <button
                onClick={() => handleRemoveItem(idx)}
                className="w-6 h-6 rounded-full bg-red-100 text-red-500 opacity-0 group-hover/item:opacity-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add new item */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 text-sm"
        />
        <Button 
          size="sm" 
          onClick={handleAddItem}
          disabled={!newItem.trim()}
          className="bg-[#7CB342] hover:bg-[#689F38]"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ========== EDITABLE TAG ARRAY ==========
export function EditableTagArray({
  sectionKey,
  fieldPath,
  defaultValue = [],
  className = "",
  tagClassName = "bg-[#7CB342]/10 text-[#7CB342] px-3 py-1 rounded-full text-xs font-medium",
  label = "Tags"
}) {
  const { isEditMode, getSectionFieldValue, updateSectionField } = useLiveEditContext();
  
  const [isEditing, setIsEditing] = useState(false);
  const [localTags, setLocalTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const inputRef = useRef(null);

  const savedTags = getSectionFieldValue(sectionKey, fieldPath, defaultValue) || [];

  const handleStartEdit = () => {
    setLocalTags([...savedTags]);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !localTags.includes(newTag.trim())) {
      setLocalTags([...localTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (index) => {
    setLocalTags(localTags.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    updateSectionField(sectionKey, fieldPath, localTags);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalTags([]);
    setIsEditing(false);
    setNewTag("");
  };

  // Not in edit mode
  if (!isEditMode) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {savedTags.map((tag, idx) => (
          <span key={idx} className={tagClassName}>{tag}</span>
        ))}
      </div>
    );
  }

  // Edit mode but not active
  if (!isEditing) {
    return (
      <div 
        className={cn("flex flex-wrap gap-2 relative group cursor-pointer", className)}
        onClick={handleStartEdit}
        data-live-edit={label}
      >
        {savedTags.map((tag, idx) => (
          <span key={idx} className={tagClassName}>{tag}</span>
        ))}
        {savedTags.length === 0 && (
          <span className="text-gray-400 text-sm italic">Click để thêm tags</span>
        )}
        
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#7CB342] text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg transition-opacity">
          <Edit3 className="w-3 h-3" />
        </div>
      </div>
    );
  }

  // Active editing
  return (
    <div className="bg-white border-2 border-[#7CB342] rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-700 text-sm">{label}</h4>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleCancel}>Hủy</Button>
          <Button size="sm" onClick={handleSave} className="bg-[#7CB342]">
            <Check className="w-3 h-3 mr-1" /> Lưu
          </Button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <AnimatePresence>
          {localTags.map((tag, idx) => (
            <motion.span
              key={tag}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={cn(tagClassName, "pr-1 flex items-center gap-1")}
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(idx)}
                className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-2 h-2" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }
            if (e.key === 'Escape') handleCancel();
          }}
          placeholder="Nhập tag mới..."
          className="flex-1 text-sm"
        />
        <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()} className="bg-[#7CB342]">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default { EditableStringArray, EditableTagArray };