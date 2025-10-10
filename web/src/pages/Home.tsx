import { Button, Container, Paper, Stack, Typography } from '@mui/material';
import { useAuth } from '../features/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { token } = useAuth();
  const nav = useNavigate();

  return (
    <Container sx={{ mt: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          KPMG HR Insights
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Demo: login → listado con filtros → analytics → export.
        </Typography>
        <Stack direction="row" spacing={2}>
          {!token && (
            <Button variant="contained" onClick={() => nav('/login')}>
              Iniciar sesión
            </Button>
          )}
          {token && (
            <Button variant="outlined" onClick={() => nav('/employees')}>
              Ir a Employees
            </Button>
          )}
          {token && (
            <Button variant="outlined" onClick={() => nav('/analytics')}>
              Ir a Analytics
            </Button>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
