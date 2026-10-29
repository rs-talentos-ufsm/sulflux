import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminUsersPage from './pages/users/AdminUsersPage';
import AdminLoginPage from './pages/login/AdminLoginPage';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
