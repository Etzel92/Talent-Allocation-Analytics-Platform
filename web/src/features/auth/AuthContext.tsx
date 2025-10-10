import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUnauthorizedHandler } from '../../shared/lib/axios';

type AuthState = { token: string | null; role: string | null };
type Ctx = AuthState & { login: (t: string, r: string) => void; logout: () => void };

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const navigate = useNavigate();

  const logout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    // si el backend responde 401, cerramos sesión automáticamente
    setUnauthorizedHandler(() => logout);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      token,
      role,
      login: (t, r) => {
        setToken(t);
        setRole(r);
        localStorage.setItem('token', t);
        localStorage.setItem('role', r);
        navigate('/employees');
      },
      logout,
    }),
    [token, role, navigate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthContext missing');
  return ctx;
}
