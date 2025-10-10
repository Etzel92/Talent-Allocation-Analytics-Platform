import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../features/auth/Login';
import Employees from '../features/employees/Employees';
import Analytics from '../features/analytics/Analytics';
import ProtectedRoute from './guards/ProtectedRoute';
import AppLayout from '../components/AppLayout';
// Si usas control por roles:
// import RoleGuard from "./guards/RoleGuard";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Employees />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            {/* ejemplo si quieres filtrar por rol:
            <RoleGuard allow={["MANAGER","ANALYST"]}>
              <AppLayout><Analytics /></AppLayout>
            </RoleGuard>
            */}
            <AppLayout>
              <Analytics />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
