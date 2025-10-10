import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
export default function RoleGuard({ allow, children }: { allow: string[]; children: JSX.Element }) {
  const { role } = useAuth();
  return allow.includes(role ?? '') ? children : <Navigate to="/employees" replace />;
}
