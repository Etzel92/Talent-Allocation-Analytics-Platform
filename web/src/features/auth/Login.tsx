import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../shared/lib/axios';
import { useAuth } from './AuthContext';
import { Container, TextField, Button, Box, Typography } from '@mui/material';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/auth/login', data);
      // backend: { access_token, role }
      login(res.data.access_token, res.data.role);
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'No se pudo iniciar sesión');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h5" gutterBottom>Iniciar sesión</Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth label="Email" margin="normal"
          {...register('email')} error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          fullWidth label="Password" type="password" margin="normal"
          {...register('password')} error={!!errors.password}
          helperText={errors.password?.message}
        />
        <Button fullWidth type="submit" variant="contained" disabled={isSubmitting} sx={{ mt: 2 }}>
          Entrar
        </Button>
      </Box>
    </Container>
  );
}
