import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../shared/lib/axios';
import {
  Container,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Skeleton,
  Stack,
  Box,
  Button,
  Alert,
} from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

type Item = { name: string; value: number };

const normalizeItem = (r: any): Item => ({
  name: r.name ?? r.key ?? r.label ?? String(r?.dimension_value ?? ''),
  value: Number(r.value ?? r.count ?? r.total ?? r.qty ?? 0),
});

export default function Analytics() {
  const [dim, setDim] = useState<'Gender' | 'Education'>('Gender');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['distribution', dim],
    queryFn: async () => {
      const res = await api.get('/reports/distribution', { params: { dimension: dim.toLowerCase() } });
      const raw = res.data;
      const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
      return arr.map(normalizeItem) as Item[];
    },
  });

  const total = useMemo(() => (data ?? []).reduce((a, b) => a + b.value, 0), [data]);

  const handleExport = () => {
    const a = document.createElement('a');
    a.href = `${import.meta.env.VITE_API_URL}/reports/export`;
    a.download = 'employees_export.csv';
    a.click();
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Analytics</Typography>
        <Button variant="outlined" onClick={handleExport} aria-label="Exportar CSV">
          Exportar CSV
        </Button>
      </Stack>

      <ToggleButtonGroup
        color="primary"
        value={dim}
        exclusive
        onChange={(_, v) => v && setDim(v)}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="Gender">Gender</ToggleButton>
        <ToggleButton value="Education">Education</ToggleButton>
      </ToggleButtonGroup>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          No se pudo cargar la distribución.
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems="stretch">
        <Box sx={{ width: { xs: '100%', md: '25%' } }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              Total
            </Typography>
            <Typography variant="h5">{total}</Typography>
          </Paper>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '75%' } }}>
          <Paper sx={{ p: 2, height: 360 }}>
            {isLoading ? (
              <Skeleton variant="rounded" height={320} />
            ) : data && data.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Stack sx={{ height: 320 }} alignItems="center" justifyContent="center">
                <Typography color="text.secondary">Sin datos para la dimensión seleccionada</Typography>
              </Stack>
            )}
          </Paper>
        </Box>
      </Stack>
    </Container>
  );
}
