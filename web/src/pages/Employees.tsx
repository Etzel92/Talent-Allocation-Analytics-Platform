import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { useState } from 'react';
import { Container, TextField, Stack, Button, Typography } from '@mui/material';

export default function Employees() {
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('');
  const [q, setQ] = useState('');
  const { data, refetch, isLoading } = useQuery({
    queryKey: ['employees', city, gender, q],
    queryFn: async () => {
      const { data } = await api.get('/employees', { params: { city, gender, q, limit: 50 } });
      return data;
    },
  });

  const exportCsv = () => {
    const params = new URLSearchParams({ city, gender, q });
    window.location.href = `http://localhost:8000/export/Employee.csv?${params.toString()}`;
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Empleados
      </Typography>
      <Stack direction="row" gap={2} sx={{ mb: 2 }}>
        <TextField label="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} />
        <TextField label="Género" value={gender} onChange={(e) => setGender(e.target.value)} />
        <TextField label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button variant="contained" onClick={() => refetch()}>
          Filtrar
        </Button>
        <Button onClick={exportCsv}>Exportar CSV</Button>
      </Stack>
      {isLoading ? (
        'Cargando...'
      ) : (
        <pre style={{ maxHeight: 400, overflow: 'auto', background: '#1111', padding: 12 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </Container>
  );
}
