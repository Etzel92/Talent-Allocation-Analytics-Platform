import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthed } = useAuth();
  const location = useLocation();
  if (!isAuthed) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
