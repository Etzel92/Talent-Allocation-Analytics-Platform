import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  saveSession, clearSession, getRole as getRoleLS, isAuthed as isAuthedLS,
  restoreSession, getToken, getTokenExpiryMs
} from './session';
import { setUnauthorizedHandler, setActivityHandler } from '../../shared/lib/axios';

type AuthContextType = {
  role: string | null;
  isAuthed: boolean;
  login: (token: string, role: string) => void;
  logout: () => void;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 👉 contexto para mostrar contador de inactividad (ms restantes)
const InactivityLeftContext = createContext<number>(0);
export function useInactivityLeftMs() {
  return useContext(InactivityLeftContext);
}

const INACTIVITY_MS = 10 * 60 * 1000; // cambia aquí el tiempo de inactividad (10 min)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState<string | null>(getRoleLS());
  const [isAuthed, setIsAuthed] = useState<boolean>(isAuthedLS());
  const [leftMs, setLeftMs] = useState<number>(0);

  // deadline por inactividad
  const inactivityDeadlineRef = useRef<number>(0);

  const doLogout = () => {
    clearSession();
    setRole(null);
    setIsAuthed(false);
    setLeftMs(0);
    navigate('/login', { replace: true });
  };

  const login = (token: string, role: string) => {
    saveSession(token, role); 
    setRole(role);
    setIsAuthed(true);
    // resetea inactividad al entrar
    inactivityDeadlineRef.current = Date.now() + INACTIVITY_MS;
    setLeftMs(INACTIVITY_MS);
    navigate('/employees', { replace: true });
  };

  
  useEffect(() => {
    restoreSession(); 
    setUnauthorizedHandler(() => doLogout); 
    const resetInactivity = () => {
      if (!isAuthed) return;
      inactivityDeadlineRef.current = Date.now() + INACTIVITY_MS;
      setLeftMs(inactivityDeadlineRef.current - Date.now());
    };

    setActivityHandler(() => resetInactivity);

    const activityEvents: (keyof WindowEventMap)[] = [
      'mousemove','mousedown','keydown','scroll','touchstart','focus'
    ];
    activityEvents.forEach(ev => window.addEventListener(ev, resetInactivity, { passive: true }));


    resetInactivity(); 
 

    // loop del contador (1s)
    const id = window.setInterval(() => {
      if (!isAuthed) { setLeftMs(0); return; }

      const token = getToken();
      const expMs = token ? getTokenExpiryMs(token) : null;
      const hardDeadline = (expMs ? (expMs - 2000) : Infinity); // prioridad al exp del JWT
      const softDeadline = inactivityDeadlineRef.current;

      const nextDeadline = Math.min(softDeadline || Infinity, hardDeadline);
      const msLeft = nextDeadline - Date.now();

      setLeftMs(msLeft);

      if (msLeft <= 0) {
        doLogout();
      }
    }, 1000);

    return () => {
      window.clearInterval(id);
      activityEvents.forEach(ev => window.removeEventListener(ev, resetInactivity));
      
    };
    
  }, [isAuthed]); 

  
  useEffect(() => {
    if (isAuthed) {
      inactivityDeadlineRef.current = Date.now() + INACTIVITY_MS;
      setLeftMs(inactivityDeadlineRef.current - Date.now());
    }
   
  }, [location.pathname]);

  const value = useMemo(() => ({ role, isAuthed, login, logout: doLogout }), [role, isAuthed]);

  return (
    <AuthContext.Provider value={value}>
      <InactivityLeftContext.Provider value={Math.max(0, leftMs)}>
        {children}
      </InactivityLeftContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
