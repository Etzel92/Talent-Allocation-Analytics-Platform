import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSession, clearSession, getRole as getRoleLS, isAuthed as isAuthedLS } from './session';
import { setUnauthorizedHandler } from '../../shared/lib/axios';

type AuthContextType = {
  role: string | null;
  isAuthed: boolean;
  login: (token: string, role: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(getRoleLS());
  const [isAuthed, setIsAuthed] = useState<boolean>(isAuthedLS());

  const login = (token: string, role: string) => {
    saveSession(token, role);
    setRole(role);
    setIsAuthed(true);
    navigate('/employees', { replace: true });
  };

  const logout = () => {
    clearSession();
    setRole(null);
    setIsAuthed(false);
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    // si la API responde 401, cerramos sesión
    setUnauthorizedHandler(() => logout);
  }, []); // eslint-disable-line

  const value = useMemo(() => ({ role, isAuthed, login, logout }), [role, isAuthed]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
