
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  UserPlus, Mail, Shield, Trash2, X, CheckCircle,
  Clock, Ban, Search, Filter, MoreVertical, Crown,
  AlertCircle, Copy, Send
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TenantGuard from "@/components/TenantGuard";

const ROLES = [
  { key: 'owner', label: 'Chủ Sở Hữu', color: 'purple', description: 'Toàn quyền quản lý' },
  { key: 'admin', label: 'Quản Trị Viên', color: 'blue', description: 'Quản lý hầu hết tính năng' },
  { key: 'manager', label: 'Quản Lý', color: 'green', description: 'Quản lý đơn hàng & sản phẩm' },
  { key: 'staff', label: 'Nhân Viên', color: 'orange', description: 'Xem và xử lý đơn hàng' },
  { key: 'viewer', label: 'Người Xem', color: 'gray', description: 'Chỉ xem thông tin' }
];

function InviteUserModal({ isOpen, onClose, tenantId, onInvite }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('staff');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleInvite = async () => {
    if (!email || !name) return;
    
    setIsSending(true);
    try {
      await onInvite({ email, name, role });
      setEmail('');
      setName('');
      setRole('staff');
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-[#0F0F0F]">
            Mời Thành Viên Mới
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai Trò *
            </label>
            <div className="space-y-2">
              {ROLES.filter(r => r.key !== 'owner').map((roleOption) => (
                <div
                  key={roleOption.key}
                  onClick={() => setRole(roleOption.key)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    role === roleOption.key
                      ? 'border-[#7CB342] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{roleOption.label}</p>
                      <p className="text-sm text-gray-600">{roleOption.description}</p>
                    </div>
                    {role === roleOption.key && (
                      <CheckCircle className="w-6 h-6 text-[#7CB342]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-800">
              💌 Email mời sẽ được gửi đến địa chỉ này với hướng dẫn tham gia
            </p>
          </div>

          <button
            onClick={handleInvite}
            disabled={!email || !name || isSending}
            className="w-full bg-[#7CB342] text-white py-4 rounded-xl font-medium hover:bg-[#FF9800] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Gửi Lời Mời
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function TenantUsers() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(location.search);
  const tenantId = urlParams.get('tenant');
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Fetch tenant data
  const { data: tenant } = useQuery({
    queryKey: ['tenant-users-info', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('No tenant ID');
      const tenants = await base44.entities.Tenant.list('-created_date', 100);
      return tenants.find(t => t.id === tenantId);
    },
    enabled: !!tenantId
  });

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['tenant-users', tenantId],
    queryFn: async () => {
      const allUsers = await base44.entities.TenantUser.list('-created_date', 500);
      return allUsers.filter(u => u.tenant_id === tenantId);
    },
    enabled: !!tenantId
  });

  const createUserMutation = useMutation({
    mutationFn: (userData) => base44.entities.TenantUser.create(userData),
    onSuccess: () => {
      queryClient.invalidateQueries(['tenant-users']);
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TenantUser.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tenant-users']);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => base44.entities.TenantUser.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tenant-users']);
    }
  });

  const handleInviteUser = async ({ email, name, role }) => {
    try {
      // Create tenant user
      await createUserMutation.mutateAsync({
        tenant_id: tenantId,
        user_email: email,
        user_name: name,
        tenant_role: role,
        invitation_status: 'pending',
        invited_by: tenant?.owner_email,
        invited_at: new Date().toISOString(),
        status: 'active'
      });

      // Send invitation email
      await base44.integrations.Core.SendEmail({
        from_name: 'Zero Farm Platform',
        to: email,
        subject: `Mời tham gia ${tenant?.organization_name} trên Zero Farm`,
        body: `
Xin chào ${name},

Bạn đã được mời tham gia đội ngũ của ${tenant?.organization_name} trên nền tảng Zero Farm với vai trò ${ROLES.find(r => r.key === role)?.label}.

Để bắt đầu, vui lòng truy cập:
https://zerofarm.vn/tenant/${tenant?.slug}

Nếu bạn chưa có tài khoản, hệ thống sẽ hướng dẫn bạn tạo tài khoản.

Chúc bạn làm việc hiệu quả!
Zero Farm Team
        `
      });

      alert('Đã gửi lời mời thành công! 📧');
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        data: { tenant_role: newRole }
      });
    } catch (error) {
      alert('Có lỗi xảy ra.');
    }
  };

  const handleRemoveUser = async (userId) => {
    const confirm = window.confirm('Bạn có chắc muốn xóa thành viên này?');
    if (!confirm) return;

    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (error) {
      alert('Có lỗi xảy ra.');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.tenant_role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    const roleObj = ROLES.find(r => r.key === role);
    return roleObj?.color || 'gray';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <X className="w-4 h-4 text-red-600" />;
      default: return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#0F0F0F]">
                Quản Lý Nhân Viên
              </h1>
              <p className="text-gray-600">Mời và quản lý thành viên trong đội ngũ</p>
            </div>
            <button
              onClick={() => navigate(createPageUrl(`TenantDashboard?tenant=${tenantId}`))}
              className="text-gray-600 hover:text-[#7CB342] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Tổng thành viên</p>
            <p className="text-3xl font-bold text-[#0F0F0F]">{users.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              Giới hạn: {tenant.limits?.max_users || 2}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 shadow-lg border border-green-200">
            <p className="text-sm text-green-700 mb-1">Đang hoạt động</p>
            <p className="text-3xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 shadow-lg border border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">Chờ chấp nhận</p>
            <p className="text-3xl font-bold text-yellow-600">
              {users.filter(u => u.invitation_status === 'pending').length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 shadow-lg border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Quản trị viên</p>
            <p className="text-3xl font-bold text-purple-600">
              {users.filter(u => ['owner', 'admin'].includes(u.tenant_role)).length}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            >
              <option value="all">Tất cả vai trò</option>
              {ROLES.map(role => (
                <option key={role.key} value={role.key}>{role.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowInviteModal(true)}
              disabled={users.length >= (tenant.limits?.max_users || 2)}
              className="bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <UserPlus className="w-5 h-5" />
              Mời Thành Viên
            </button>
          </div>

          {users.length >= (tenant.limits?.max_users || 2) && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800">
                Bạn đã đạt giới hạn số người dùng. Nâng cấp gói để thêm nhiều thành viên hơn.
              </p>
            </div>
          )}
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || roleFilter !== 'all' ? 'Không tìm thấy thành viên' : 'Chưa có thành viên nào'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {user.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(user.invitation_status)}
                    {user.tenant_role === 'owner' && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 mb-1">{user.user_name}</h3>
                <p className="text-sm text-gray-600 mb-4 truncate">{user.user_email}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${getRoleColor(user.tenant_role)}-100 text-${getRoleColor(user.tenant_role)}-700`}>
                    {ROLES.find(r => r.key === user.tenant_role)?.label}
                  </span>
                  <span className={`text-xs ${
                    user.status === 'active' ? 'text-green-600' :
                    user.status === 'inactive' ? 'text-gray-500' :
                    'text-red-600'
                  }`}>
                    {user.status === 'active' ? 'Hoạt động' :
                     user.status === 'inactive' ? 'Không hoạt động' : 'Tạm khóa'}
                  </span>
                </div>

                {user.invited_at && (
                  <p className="text-xs text-gray-400 mb-4">
                    Mời lúc: {new Date(user.invited_at).toLocaleDateString('vi-VN')}
                  </p>
                )}

                {user.tenant_role !== 'owner' && (
                  <div className="flex gap-2">
                    <select
                      value={user.tenant_role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
                    >
                      {ROLES.filter(r => r.key !== 'owner').map(role => (
                        <option key={role.key} value={role.key}>{role.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa thành viên"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        tenantId={tenantId}
        onInvite={handleInviteUser}
      />
    </div>
  );
}

export default function TenantUsersPage() {
  return (
    <TenantGuard requireTenantId={true}>
      <TenantUsers />
    </TenantGuard>
  );
}
