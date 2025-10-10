import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../shared/lib/axios';
import { useAuth } from './AuthContext';
import {
  Container, TextField, Button, Box, Typography, Paper, Alert, IconButton, InputAdornment
} from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(3, 'Mínimo 3 caracteres'),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const [err, setErr] = React.useState<string | null>(null);
  const [showPwd, setShowPwd] = React.useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      setErr(null);
      const res = await api.post('/auth/login', data);
      login(res.data.access_token, res.data.role);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'No se pudo iniciar sesión');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'grid', placeItems: 'center', minHeight: '70dvh' }}>
      <Paper sx={{ p: { xs: 3, md: 4 }, width: '100%' }} elevation={3}>
        <Typography variant="h5" gutterBottom>Iniciar sesión</Typography>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            autoComplete="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPwd ? 'text' : 'password'}
            margin="normal"
            autoComplete="current-password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPwd ? 'Ocultar password' : 'Mostrar password'}
                    edge="end"
                    onClick={() => setShowPwd(v => !v)}
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ mt: 2 }}
          >
            Entrar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
