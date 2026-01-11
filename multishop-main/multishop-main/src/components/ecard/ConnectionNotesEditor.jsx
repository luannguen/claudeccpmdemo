/**
 * ConnectionNotesEditor - Edit notes và tags cho connection
 * UI Component
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';

export default function ConnectionNotesEditor({ connection, onSave, isSaving }) {
  const [notes, setNotes] = useState(connection.notes || '');
  const [tags, setTags] = useState(connection.tags || []);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    if (tags.includes(newTag.trim())) return;
    
    const updatedTags = [...tags, newTag.trim()];
    setTags(updatedTags);
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = () => {
    onSave({ notes, tags });
  };

  return (
    <div className="space-y-4">
      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Icon.FileText size={16} />
          Ghi chú
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ghi chú về contact này..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#7CB342]"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Icon.Tag size={16} />
          Tags
        </label>
        
        {/* Tag Input */}
        <form onSubmit={handleAddTag} className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Thêm tag..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#689F38] transition-colors"
          >
            <Icon.Plus size={16} />
          </button>
        </form>

        {/* Tag List */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-blue-900"
              >
                <Icon.X size={12} />
              </button>
            </span>
          ))}
        </div>

        {tags.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">
            Chưa có tag nào
          </p>
        )}
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full px-4 py-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#689F38] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <Icon.Spinner size={18} />
            Đang lưu...
          </>
        ) : (
          <>
            <Icon.Save size={18} />
            Lưu thay đổi
          </>
        )}
      </button>
    </div>
  );
}