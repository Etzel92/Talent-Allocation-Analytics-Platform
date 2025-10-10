import { Chip } from '@mui/material';
import { useInactivityLeftMs } from './AuthContext';

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function SessionInfo() {
  const leftMs = useInactivityLeftMs(); // ⬅️ solo baja si no hay actividad
  if (leftMs <= 0) return null;
  return <Chip size="small" label={`Sesión inactiva en ${fmt(leftMs)}`} sx={{ ml: 1 }} />;
}
