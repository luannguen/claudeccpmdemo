import React, { useState, useMemo } from "react";
import { Plus, Shield, Edit, Search, Grid3X3, List, Table2, Eye, Users, UserCog, Filter, X, ChevronDown } from "lucide-react";
import { useRoleList } from "@/components/hooks/useRBAC";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_ADMIN_ROLES, ROLE_NAME_MAP, normalizeRole } from "@/components/hooks/useRBACPermissions";

// Fallback roles khi chưa có dữ liệu từ DB
const FALLBACK_ROLES = [
  { name: 'admin', display_name: 'Quản Trị Viên', description: 'Toàn quyền quản lý hệ thống', color: '#DC2626' },
  { name: 'manager', display_name: 'Quản Lý', description: 'Quản lý sản phẩm, đơn hàng, khách hàng', color: '#7C3AED' },
  { name: 'staff', display_name: 'Nhân Viên', description: 'Xử lý đơn hàng và sản phẩm', color: '#2563EB' },
  { name: 'accountant', display_name: 'Kế Toán', description: 'Xem báo cáo và đơn hàng', color: '#059669' },
  { name: 'user', display_name: 'Người Dùng', description: 'Khách hàng thông thường', color: '#6B7280' }
];

// Use ALL_ADMIN_ROLES from RBAC - includes all admin-level roles
const ADMIN_ROLES = ALL_ADMIN_ROLES;

export default function UsersSettings({ users, isLoading, currentUser, onAddUser, onEditUser }) {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'client'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid' | 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Lấy roles từ RBAC
  const { data: dbRoles = [], isLoading: isLoadingRoles } = useRoleList();
  const roles = dbRoles.length > 0 ? dbRoles : FALLBACK_ROLES;

  // Helper để lấy role info
  const getRoleInfo = (roleName) => {
    const role = roles.find(r => r.name === roleName);
    return role || { display_name: roleName, color: '#6B7280', description: '' };
  };

  // Helper để lấy all roles của user (hỗ trợ multi-role) VÀ normalize display_name → name
  const getUserRoles = (user) => {
    let rawRoles = [];
    if (user?.custom_roles && Array.isArray(user.custom_roles) && user.custom_roles.length > 0) {
      rawRoles = user.custom_roles;
    } else if (user?.custom_role) {
      rawRoles = [user.custom_role];
    } else if (user?.role) {
      rawRoles = [user.role];
    } else {
      rawRoles = ['user'];
    }
    // Normalize: convert display_name → name (e.g. "Quản Lý Hệ Thống" → "system_admin")
    return rawRoles.map(r => normalizeRole(r));
  };

  // Phân loại users (hỗ trợ multi-role) - normalize trước khi check
  const { adminUsers, clientUsers } = useMemo(() => {
    const admin = [];
    const client = [];
    
    (users || []).forEach(user => {
      const userRoles = getUserRoles(user);
      // User là admin nếu có BẤT KỲ admin role nào (đã normalize)
      const hasAdminRole = userRoles.some(r => ADMIN_ROLES.includes(r));
      if (hasAdminRole) {
        admin.push(user);
      } else {
        client.push(user);
      }
    });
    
    return { adminUsers: admin, clientUsers: client };
  }, [users]);

  // Filter users based on search and role (hỗ trợ multi-role)
  const filteredUsers = useMemo(() => {
    const sourceUsers = activeTab === 'admin' ? adminUsers : clientUsers;
    
    return sourceUsers.filter(user => {
      const matchSearch = !searchTerm || 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const userRoles = getUserRoles(user);
      // Match nếu user có role được filter
      const matchRole = roleFilter === 'all' || userRoles.includes(roleFilter);
      
      return matchSearch && matchRole;
    });
  }, [activeTab, adminUsers, clientUsers, searchTerm, roleFilter]);

  // Stats (hỗ trợ multi-role - đếm user có role, không phải unique)
  const stats = useMemo(() => ({
    totalAdmin: adminUsers.length,
    totalClient: clientUsers.length,
    byRole: roles.reduce((acc, role) => {
      acc[role.name] = (users || []).filter(u => getUserRoles(u).includes(role.name)).length;
      return acc;
    }, {})
  }), [adminUsers, clientUsers, users, roles]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-[#0F0F0F]">Quản Lý Người Dùng</h3>
          <p className="text-sm text-gray-600">
            {stats.totalAdmin} admin • {stats.totalClient} người dùng thường
          </p>
        </div>
        <Button onClick={onAddUser} className="bg-[#7CB342] hover:bg-[#689F38]">
          <Plus className="w-4 h-4 mr-2" />
          Mời Người Dùng
        </Button>
      </div>

      {/* Tabs: Admin vs Client Users */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            <span>Quản Trị ({stats.totalAdmin})</span>
          </TabsTrigger>
          <TabsTrigger value="client" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Người Dùng ({stats.totalClient})</span>
          </TabsTrigger>
        </TabsList>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, email..."
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                {(activeTab === 'admin' ? roles.filter(r => ADMIN_ROLES.includes(r.name)) : roles.filter(r => !ADMIN_ROLES.includes(r.name) || r.name === 'user')).map(role => (
                  <SelectItem key={role.name} value={role.name}>
                    {role.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 ${viewMode === 'table' ? 'bg-[#7CB342] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Table2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-[#7CB342] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-[#7CB342] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || roleFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tìm: "{searchTerm}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
              </Badge>
            )}
            {roleFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Vai trò: {getRoleInfo(roleFilter).display_name}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setRoleFilter('all')} />
              </Badge>
            )}
          </div>
        )}

        {/* Content */}
        <TabsContent value="admin" className="mt-0">
          <UsersList 
            users={filteredUsers}
            viewMode={viewMode}
            isLoading={isLoading}
            currentUser={currentUser}
            getRoleInfo={getRoleInfo}
            onEdit={onEditUser}
            onViewDetail={setSelectedUser}
          />
        </TabsContent>
        
        <TabsContent value="client" className="mt-0">
          <UsersList 
            users={filteredUsers}
            viewMode={viewMode}
            isLoading={isLoading}
            currentUser={currentUser}
            getRoleInfo={getRoleInfo}
            onEdit={onEditUser}
            onViewDetail={setSelectedUser}
          />
        </TabsContent>
      </Tabs>

      {/* Role Legend */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 md:p-4 rounded-xl">
        <h4 className="font-bold text-blue-900 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
          <Shield className="w-4 h-4 md:w-5 md:h-5" />
          Phân Quyền Hệ Thống
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 text-xs md:text-sm">
          {roles.map(role => (
            <div key={role.name} className="flex items-start gap-2">
              <div 
                className="w-2 h-2 rounded-full mt-1 flex-shrink-0" 
                style={{ backgroundColor: role.color || '#6B7280' }}
              />
              <div className="min-w-0">
                <span className="font-semibold text-blue-900">{role.display_name}:</span>
                <span className="text-blue-700 ml-1">{role.description}</span>
                <span className="text-blue-500 ml-1">({stats.byRole[role.name] || 0})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Detail Modal */}
      <UserDetailModal 
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        getRoleInfo={getRoleInfo}
        onEdit={onEditUser}
        currentUser={currentUser}
      />
    </div>
  );
}

// Helper để lấy roles của user (normalize display_name → name)
const getUserRolesLocal = (user) => {
  let rawRoles = [];
  if (user?.custom_roles && Array.isArray(user.custom_roles) && user.custom_roles.length > 0) {
    rawRoles = user.custom_roles;
  } else if (user?.custom_role) {
    rawRoles = [user.custom_role];
  } else if (user?.role) {
    rawRoles = [user.role];
  } else {
    rawRoles = ['user'];
  }
  // Normalize: convert display_name → name
  return rawRoles.map(r => ROLE_NAME_MAP[r] || r);
};

// ========== UsersList Component ==========
function UsersList({ users, viewMode, isLoading, currentUser, getRoleInfo, onEdit, onViewDetail }) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Không tìm thấy người dùng nào</p>
      </div>
    );
  }

  // Table View
  if (viewMode === 'table') {
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Người Dùng</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Email</th>
                <th className="text-center p-4 text-sm font-medium text-gray-600">Vai Trò</th>
                <th className="text-center p-4 text-sm font-medium text-gray-600">Ngày Tạo</th>
                <th className="text-center p-4 text-sm font-medium text-gray-600">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const userRoles = getUserRolesLocal(user);
                const primaryRole = getRoleInfo(userRoles[0]);
                return (
                  <tr 
                    key={user.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onViewDetail(user)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                          style={{ backgroundColor: primaryRole.color }}
                        >
                          {user.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{user.full_name}</p>
                          {user.id === currentUser?.id && (
                            <span className="text-xs text-[#7CB342]">(Bạn)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{user.email}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {userRoles.map((roleName, idx) => {
                          const roleInfo = getRoleInfo(roleName);
                          return (
                            <span 
                              key={roleName}
                              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: `${roleInfo.color}20`, color: roleInfo.color }}
                            >
                              {roleInfo.display_name}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-center text-sm text-gray-600">
                      {new Date(user.created_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onViewDetail(user)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(user)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                          disabled={user.id === currentUser?.id}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const userRoles = getUserRolesLocal(user);
          const primaryRole = getRoleInfo(userRoles[0]);
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onViewDetail(user)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: primaryRole.color }}
                >
                  {user.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{user.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {userRoles.map(roleName => {
                  const roleInfo = getRoleInfo(roleName);
                  return (
                    <span 
                      key={roleName}
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${roleInfo.color}20`, color: roleInfo.color }}
                    >
                      {roleInfo.display_name}
                    </span>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(user.created_date).toLocaleDateString('vi-VN')}
                </span>
                {userRoles.length > 1 && (
                  <span className="text-xs text-blue-500">{userRoles.length} vai trò</span>
                )}
              </div>
              
              {user.id === currentUser?.id && (
                <Badge className="mt-2 bg-green-100 text-green-700">Tài khoản của bạn</Badge>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-2">
      {users.map((user) => {
        const userRoles = getUserRolesLocal(user);
        const primaryRole = getRoleInfo(userRoles[0]);
        return (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-3 hover:bg-gray-50 cursor-pointer"
            onClick={() => onViewDetail(user)}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ backgroundColor: primaryRole.color }}
            >
              {user.full_name?.charAt(0)?.toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{user.full_name}</p>
                {user.id === currentUser?.id && (
                  <Badge variant="outline" className="text-xs">Bạn</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
            
            <div className="flex flex-wrap gap-1 flex-shrink-0 max-w-[200px]">
              {userRoles.map(roleName => {
                const roleInfo = getRoleInfo(roleName);
                return (
                  <span 
                    key={roleName}
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${roleInfo.color}20`, color: roleInfo.color }}
                  >
                    {roleInfo.display_name}
                  </span>
                );
              })}
            </div>
            
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onViewDetail(user)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(user)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                disabled={user.id === currentUser?.id}
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ========== UserDetailModal Component ==========
function UserDetailModal({ user, isOpen, onClose, getRoleInfo, onEdit, currentUser }) {
  if (!user) return null;
  
  const userRoles = getUserRolesLocal(user);
  const primaryRole = getRoleInfo(userRoles[0]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi Tiết Người Dùng</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
              style={{ backgroundColor: primaryRole.color }}
            >
              {user.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold">{user.full_name}</h3>
              <p className="text-gray-500">{user.email}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {userRoles.map(roleName => {
                  const roleInfo = getRoleInfo(roleName);
                  return (
                    <span 
                      key={roleName}
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${roleInfo.color}20`, color: roleInfo.color }}
                    >
                      {roleInfo.display_name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 mb-1">ID</p>
              <p className="font-mono text-xs">{user.id}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 mb-1">Ngày tạo</p>
              <p className="font-medium">{new Date(user.created_date).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 mb-1">Role gốc (System)</p>
              <p className="font-medium">{user.role}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 mb-1">Số vai trò gán</p>
              <p className="font-medium">{userRoles.length} vai trò</p>
            </div>
          </div>

          {/* Roles & Permissions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-900 font-medium mb-2">Quyền hạn (Union từ {userRoles.length} vai trò)</p>
            <div className="space-y-2">
              {userRoles.map(roleName => {
                const roleInfo = getRoleInfo(roleName);
                return (
                  <div key={roleName} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: roleInfo.color }}
                    />
                    <span className="font-medium" style={{ color: roleInfo.color }}>
                      {roleInfo.display_name}:
                    </span>
                    <span className="text-blue-700">{roleInfo.description}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Đóng
            </Button>
            <Button 
              onClick={() => { onClose(); onEdit(user); }}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={user.id === currentUser?.id}
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}