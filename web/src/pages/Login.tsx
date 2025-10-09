import { useState } from 'react';
import { TextField, Button, Container, Typography, Stack } from '@mui/material';
import { api } from '../api';
import { saveSession } from '../auth';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';

type LoginResponse = {
  access_token: string;
  role: 'hr' | 'manager' | 'analyst';
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const submit = async () => {
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
      saveSession(data.access_token, data.role);
      nav('/employees');
    } catch (e) {
      let msg = 'Error';
      if (isAxiosError<{ detail?: string }>(e)) {
        msg = e.response?.data?.detail ?? msg;
      }
      setErr(msg);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Iniciar sesión
      </Typography>
      <Stack gap={2}>
        <TextField label="Email" value={email} onChange={(ev) => setEmail(ev.target.value)} />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
        />
        {err && <Typography color="error">{err}</Typography>}
        <Button variant="contained" onClick={submit}>
          Entrar
        </Button>
      </Stack>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Pruebas: hr@example.com/hr123 · manager@example.com/mgr123 · analyst@example.com/ana123
      </Typography>
    </Container>
  );
}
