/**
 * HighlightsPanel - Panel hiển thị và quản lý highlights
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';

const HIGHLIGHT_COLORS = [
  { name: 'yellow', class: 'bg-yellow-200', border: 'border-yellow-400' },
  { name: 'green', class: 'bg-green-200', border: 'border-green-400' },
  { name: 'blue', class: 'bg-blue-200', border: 'border-blue-400' },
  { name: 'pink', class: 'bg-pink-200', border: 'border-pink-400' },
  { name: 'purple', class: 'bg-purple-200', border: 'border-purple-400' }
];

export default function HighlightsPanel({
  highlights,
  notes,
  onRemoveHighlight,
  onUpdateHighlightColor,
  onAddNote,
  onUpdateNote,
  onRemoveNote,
  onGoToPage,
  isOpen,
  onClose,
  isSyncing,
  isSynced
}) {
  const [activeTab, setActiveTab] = useState('highlights');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedHighlight, setSelectedHighlight] = useState(null);

  if (!isOpen) return null;

  const getColorClass = (colorName) => {
    return HIGHLIGHT_COLORS.find(c => c.name === colorName)?.class || 'bg-yellow-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">Ghi chú của tôi</h3>
            {isSyncing && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Icon.Spinner size={12} /> Đang lưu...
              </span>
            )}
            {isSynced && !isSyncing && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <Icon.Check size={12} /> Đã đồng bộ
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Icon.X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('highlights')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'highlights'
                ? 'bg-[#7CB342] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Đánh dấu ({highlights.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'notes'
                ? 'bg-[#7CB342] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Ghi chú ({notes.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'highlights' ? (
          <div className="space-y-3">
            {highlights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon.Bookmark size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Chưa có đánh dấu nào</p>
                <p className="text-xs mt-1">Chọn văn bản để đánh dấu</p>
              </div>
            ) : (
              highlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className={`p-3 rounded-xl border-l-4 ${getColorClass(highlight.color)} ${
                    HIGHLIGHT_COLORS.find(c => c.name === highlight.color)?.border || 'border-yellow-400'
                  }`}
                >
                  <p className="text-sm text-gray-800 line-clamp-3">
                    "{highlight.text}"
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => onGoToPage(highlight.pageIndex)}
                      className="text-xs text-gray-500 hover:text-[#7CB342]"
                    >
                      Trang {highlight.pageIndex + 1}
                    </button>
                    <div className="flex items-center gap-1">
                      {/* Color picker */}
                      <div className="flex gap-0.5">
                        {HIGHLIGHT_COLORS.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => onUpdateHighlightColor(highlight.id, color.name)}
                            className={`w-4 h-4 rounded-full ${color.class} ${
                              highlight.color === color.name ? 'ring-2 ring-gray-400' : ''
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => onRemoveHighlight(highlight.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Icon.Trash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Add new note */}
            <div className="p-3 bg-gray-50 rounded-xl">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Thêm ghi chú mới..."
                className="w-full bg-transparent text-sm resize-none focus:outline-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => {
                    if (newNoteText.trim()) {
                      onAddNote(newNoteText, 0);
                      setNewNoteText('');
                    }
                  }}
                  disabled={!newNoteText.trim()}
                  className="px-3 py-1 bg-[#7CB342] text-white text-sm rounded-lg disabled:opacity-50"
                >
                  Lưu
                </button>
              </div>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon.Edit size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Chưa có ghi chú nào</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm"
                >
                  {editingNoteId === note.id ? (
                    <div>
                      <textarea
                        value={editNoteText}
                        onChange={(e) => setEditNoteText(e.target.value)}
                        className="w-full text-sm p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1 text-gray-500 text-sm"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => {
                            if (editNoteText.trim() && onUpdateNote) {
                              onUpdateNote(note.id, editNoteText.trim());
                              setEditingNoteId(null);
                            }
                          }}
                          className="px-3 py-1 bg-[#7CB342] text-white text-sm rounded-lg"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-800">{note.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => onGoToPage(note.pageIndex)}
                          className="text-xs text-gray-500 hover:text-[#7CB342]"
                        >
                          Trang {note.pageIndex + 1}
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditNoteText(note.content);
                            }}
                            className="p-1 text-gray-400 hover:text-[#7CB342]"
                          >
                            <Icon.Edit size={14} />
                          </button>
                          <button
                            onClick={() => onRemoveNote(note.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Icon.Trash size={14} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Export button */}
      {highlights.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              const text = highlights.map((h, i) => 
                `${i + 1}. "${h.text}" (Trang ${h.pageIndex + 1})`
              ).join('\n');
              navigator.clipboard.writeText(text);
            }}
            className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <Icon.Copy size={16} />
            Sao chép tất cả đánh dấu
          </button>
        </div>
      )}
    </motion.div>
  );
}