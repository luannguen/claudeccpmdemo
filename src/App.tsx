import { Routes, Route, Navigate } from 'react-router-dom';
import ProductPage from "@/features/products/ProductPage";
import { AdminLayout } from './features/admin/AdminLayout';
import { RoleManagement } from './features/admin/RoleManagement';
import { UserManagement } from './features/admin/UserManagement';
import { PermissionManagement } from './features/admin/PermissionManagement';

import PricingPage from './features/client/PricingPage';
import RegisterPage from './features/client/RegisterPage';
import ClientDashboard from './features/client/ClientDashboard';

function App() {
  return (
    <Routes>
      {/* Public Store */}
      <Route path="/" element={<ProductPage />} />

      {/* SaaS Client Routes */}
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/client/dashboard" element={<ClientDashboard />} />

      {/* Admin Area */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<div className="p-4"><h1>Dashboard (Coming Soon)</h1></div>} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="permissions" element={<PermissionManagement />} />
        {/* Placeholder for other routes */}
        <Route path="*" element={<div>Page not found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
