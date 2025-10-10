import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

import AppLayout from '../components/AppLayout'; // o '../layout/AppLayout' si lo moviste
import Employees from '../features/employees/Employees';
import Analytics from '../features/analytics/Analytics';
import Login from '../features/auth/Login';

export default function AppRouter() {
  return (
    <Routes>
      {/* default → /employees */}
      <Route path="/" element={<Navigate to="/employees" replace />} />

      {/* login solo si NO hay sesión */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      {/* app protegida */}
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
            <AppLayout>
              <Analytics />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* desconocidas → /employees */}
      <Route path="*" element={<Navigate to="/employees" replace />} />
    </Routes>
  );
}
