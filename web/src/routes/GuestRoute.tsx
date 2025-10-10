import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export default function GuestRoute({ children }: { children: JSX.Element }) {
  const { isAuthed } = useAuth();
  if (isAuthed) return <Navigate to="/employees" replace />;
  return children;
}
