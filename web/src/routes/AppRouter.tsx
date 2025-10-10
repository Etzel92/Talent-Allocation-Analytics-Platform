import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

import AppLayout from '../components/AppLayout';
import Employees from '../features/employees/Employees';
import Analytics from '../features/analytics/Analytics';
import Login from '../features/auth/Login';
import Assignments from '../features/assignments/Assignments'; // 👈 NUEVO

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/employees" replace />} />

      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

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

      <Route
        path="/assignments"                      // 👈 NUEVO
        element={
          <ProtectedRoute>
            <AppLayout>
              <Assignments />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/employees" replace />} />
    </Routes>
  );
}