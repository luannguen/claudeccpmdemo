import React, { useState } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { CARE_LEVEL_CONFIG } from "@/components/ecard";
import { SendGiftModal } from "@/components/features/gift";
import ConnectionNotesEditor from "./ConnectionNotesEditor";
import BirthdayReminderBadge from "./BirthdayReminderBadge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/NotificationToast";

export default function ConnectionCard({ connection, onUpdateCareLevel, onViewDetail }) {
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const careLevelInfo = CARE_LEVEL_CONFIG[connection.care_level];
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const updateNotesMutation = useMutation({
    mutationFn: async ({ notes, tags }) => {
      return base44.entities.UserConnection.update(connection.id, {
        notes,
        tags,
        last_interaction_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      addToast('Đã cập nhật ghi chú', 'success');
      setShowNotesEditor(false);
    },
    onError: () => {
      addToast('Không thể cập nhật', 'error');
    }
  });

  return (
    <div 
      className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewDetail?.(connection)}
    >
      {/* Avatar & Name */}
      <div className="flex items-start gap-3 mb-3">
        {connection.target_avatar ? (
          <img
            src={connection.target_avatar}
            alt={connection.target_name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7CB342] to-[#558B2F] flex items-center justify-center text-white font-bold flex-shrink-0">
            {connection.target_name?.charAt(0)?.toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{connection.target_name}</h3>
          {connection.target_title && (
            <p className="text-sm text-gray-600 truncate">{connection.target_title}</p>
          )}
          {connection.target_company && (
            <p className="text-xs text-gray-500 truncate">{connection.target_company}</p>
          )}
        </div>

        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
          careLevelInfo?.color === 'gray' ? 'bg-gray-100 text-gray-700' :
          careLevelInfo?.color === 'purple' ? 'bg-purple-100 text-purple-700' :
          careLevelInfo?.color === 'amber' ? 'bg-amber-100 text-amber-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {careLevelInfo?.name || 'Bình thường'}
        </span>
      </div>

      {/* Birthday Badge */}
      <BirthdayReminderBadge connection={connection} />

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <Icon.Gift size={14} />
          <span>{connection.gift_count || 0} quà</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon.Calendar size={14} />
          <span>{new Date(connection.connected_date).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* Tags */}
      {connection.tags && connection.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {connection.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              {tag}
            </span>
          ))}
          {connection.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{connection.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Notes Preview */}
      {connection.notes && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {connection.notes}
        </p>
      )}

      {/* Care Level Selector */}
      <select
        value={connection.care_level}
        onChange={(e) => onUpdateCareLevel(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#7CB342] mb-3"
      >
        <option value="normal">Normal</option>
        <option value="vip">VIP</option>
        <option value="premium">Premium</option>
      </select>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowGiftModal(true);
          }}
          className="px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-sm hover:from-pink-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
        >
          <Icon.Gift size={16} />
          Gửi quà
        </button>
        
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowNotesEditor(!showNotesEditor);
          }}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <Icon.Edit size={16} />
          Ghi chú
        </button>
      </div>

      {/* Notes Editor */}
      {showNotesEditor && (
        <div 
          className="mt-4 pt-4 border-t border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <ConnectionNotesEditor
            connection={connection}
            onSave={(data) => updateNotesMutation.mutate(data)}
            isSaving={updateNotesMutation.isPending}
          />
        </div>
      )}

      {/* Send Gift Modal */}
      <SendGiftModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        connection={connection}
        onSent={() => queryClient.invalidateQueries({ queryKey: ['userConnections'] })}
      />
    </div>
  );
}