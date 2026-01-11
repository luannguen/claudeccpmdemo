import { Routes, Route, Navigate } from 'react-router-dom';
import ProductPage from "@/features/products/ProductPage";
import { AdminLayout } from './features/admin/AdminLayout';
import { RoleManagement } from './features/admin/RoleManagement';
import { UserManagement } from './features/admin/UserManagement';

function App() {
  return (
    <Routes>
      {/* Public Store */}
      <Route path="/" element={<ProductPage />} />

      {/* Admin Area */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<div className="p-4"><h1>Dashboard (Coming Soon)</h1></div>} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="users" element={<UserManagement />} />
        {/* Placeholder for other routes */}
        <Route path="*" element={<div>Page not found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
