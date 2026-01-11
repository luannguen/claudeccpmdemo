import React, { useState, useCallback } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CARE_LEVEL_CONFIG } from "@/components/ecard";
import { useConnections } from "@/components/ecard";
import ConnectionCard from "./ConnectionCard";
import { ConnectionDetailModal } from "@/components/ecard";
import BulkActionsBar from "./BulkActionsBar";
import ContactExportButton from "./ContactExportButton";
import { useToast } from "@/components/NotificationToast";
import { 
  GroupFilter, 
  GroupManagerButton, 
  GroupManagerModal,
  ConnectionRecommendationsWidget 
} from "@/components/features/ecard";

export default function ConnectionsTab({ connections, isLoading }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery] = useState(''); // Search đã có ở header
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showGroupManager, setShowGroupManager] = useState(false);
  const { updateCareLevel } = useConnections();
  const { addToast } = useToast();

  // Selection handlers
  const toggleSelection = useCallback((id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    const filteredIds = connections
      .filter(conn => {
        const matchesFilter = filter === 'all' || conn.care_level === filter;
        const matchesSearch = !searchQuery || 
          conn.target_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conn.target_company?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .map(c => c.id);
    setSelectedIds(filteredIds);
  }, [connections, filter, searchQuery]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectionMode(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Icon.Spinner size={40} className="text-[#7CB342]" />
        <p className="text-gray-500 text-sm mt-3">Đang tải danh bạ...</p>
      </div>
    );
  }

  // Filter by care level, group AND search query
  const filteredConnections = connections.filter(conn => {
    const matchesFilter = filter === 'all' || conn.care_level === filter;
    const matchesGroup = !selectedGroupId || (conn.group_ids || []).includes(selectedGroupId);
    const matchesSearch = !searchQuery || 
      conn.target_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.target_company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.target_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesGroup && matchesSearch;
  });

  const stats = {
    all: connections.length,
    normal: connections.filter(c => c.care_level === 'normal').length,
    vip: connections.filter(c => c.care_level === 'vip').length,
    premium: connections.filter(c => c.care_level === 'premium').length
  };

  return (
    <div>
      {/* Connection Recommendations Widget */}
      <ConnectionRecommendationsWidget maxItems={3} />

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setSelectionMode(!selectionMode)}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-medium ${
            selectionMode 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Icon.CheckCircle size={20} />
          {selectionMode ? 'Thoát' : 'Chọn'}
        </button>

        <GroupManagerButton onClick={() => setShowGroupManager(true)} />
        
        <ContactExportButton connections={connections} />
      </div>

      {/* Group Filter */}
      <div className="mb-4">
        <GroupFilter
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
          showAll
        />
      </div>

      {/* Care Level Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-2 overflow-x-auto">
        <FilterButton
          label="Tất cả"
          count={stats.all}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <FilterButton
          label="Normal"
          count={stats.normal}
          color="gray"
          active={filter === 'normal'}
          onClick={() => setFilter('normal')}
        />
        <FilterButton
          label="VIP"
          count={stats.vip}
          color="blue"
          active={filter === 'vip'}
          onClick={() => setFilter('vip')}
        />
        <FilterButton
          label="Premium"
          count={stats.premium}
          color="purple"
          active={filter === 'premium'}
          onClick={() => setFilter('premium')}
        />
      </div>

      {/* Connections List */}
      {filteredConnections.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Icon.Users size={40} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có kết nối nào</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Quét mã QR hoặc tìm kiếm để kết nối với bạn bè và đối tác
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConnections.map(conn => (
            <div key={conn.id} className="relative">
              {selectionMode && (
                <div 
                  className="absolute top-3 left-3 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelection(conn.id);
                  }}
                >
                  <Checkbox
                    checked={selectedIds.includes(conn.id)}
                    className="h-5 w-5 bg-white shadow-md"
                  />
                </div>
              )}
              <div className={selectionMode && selectedIds.includes(conn.id) ? 'ring-2 ring-blue-500 rounded-xl' : ''}>
                <ConnectionCard
                  connection={conn}
                  onUpdateCareLevel={(newLevel) => 
                    updateCareLevel({ connectionId: conn.id, newLevel })
                  }
                  onViewDetail={selectionMode 
                    ? () => toggleSelection(conn.id)
                    : (connection) => setSelectedConnection(connection)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connection Detail Modal */}
      <ConnectionDetailModal
        isOpen={!!selectedConnection}
        onClose={() => setSelectedConnection(null)}
        connection={selectedConnection}
        onDeleted={() => setSelectedConnection(null)}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedIds={selectedIds}
        connections={connections}
        onClearSelection={clearSelection}
        onSelectAll={selectAll}
        isAllSelected={selectedIds.length === filteredConnections.length && filteredConnections.length > 0}
      />

      {/* Group Manager Modal */}
      <GroupManagerModal
        isOpen={showGroupManager}
        onClose={() => setShowGroupManager(false)}
      />
    </div>
  );
}

function FilterButton({ label, count, color = 'gray', active, onClick }) {
  // Tailwind doesn't support dynamic classes, define explicitly
  const colorClasses = {
    gray: {
      active: 'bg-gray-600 text-white',
      inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    },
    blue: {
      active: 'bg-blue-500 text-white',
      inactive: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    purple: {
      active: 'bg-purple-500 text-white',
      inactive: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    }
  };
  
  const classes = colorClasses[color] || colorClasses.gray;
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 min-h-[44px] rounded-lg font-medium transition-all whitespace-nowrap ${
        active ? classes.active : classes.inactive
      }`}
    >
      {label} ({count})
    </button>
  );
}