import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Container, Typography } from '@mui/material';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Analytics() {
  const { data } = useQuery({
    queryKey: ['gender-distribution'],
    queryFn: async () => (await api.get('/analytics/gender-distribution')).data,
  });

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Distribución por género
      </Typography>
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data || []} dataKey="count" nameKey="gender" label />
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Container>
  );
}
