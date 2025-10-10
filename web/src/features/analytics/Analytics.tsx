import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
} from 'recharts';
import { getDistribution, getCorrelation, getLeaveProbability, exportCsv } from '../../api/reports';

type DistItem = { key: string; count: number };
type CorrPoint = { x: number; y: number };

const DIMENSIONS = [
  { key: 'gender', label: 'Gender' },
  { key: 'age', label: 'Age' },
  { key: 'city', label: 'City' },
  { key: 'education', label: 'Education' },
] as const;

export default function Analytics() {
  const [dim, setDim] = React.useState<(typeof DIMENSIONS)[number]['key']>('gender');

  // Distribución (según dimensión seleccionada)
  const dist = useQuery<DistItem[]>({
    queryKey: ['dist', dim],
    queryFn: () => getDistribution(dim),
  });

  // KPIs y gráficos adicionales
  const corr = useQuery<CorrPoint[]>({
    queryKey: ['corr'],
    queryFn: () => getCorrelation(),
  });

  const leaveProb = useQuery<{ probability: number }>({
    queryKey: ['leaveProb'],
    queryFn: () => getLeaveProbability(),
  });

  const leaveDist = useQuery<DistItem[]>({
    queryKey: ['leaveDist'],
    queryFn: () => getDistribution('leave_or_not'),
  });

  const benched = useQuery<DistItem[]>({
    queryKey: ['benched'],
    queryFn: () => getDistribution('ever_benched'),
  });

  const total = React.useMemo(
    () => (dist.data ?? []).reduce((s, d) => s + d.count, 0),
    [dist.data],
  );

  const benchedYes = React.useMemo(() => {
    const list = benched.data ?? [];
    const yes = list.find((d) => (d.key ?? '').toString().toLowerCase() === 'yes');
    return yes?.count ?? 0;
  }, [benched.data]);

  return (
    <Box>
      {/* Encabezado */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Analytics</Typography>
        <Button variant="outlined" onClick={() => exportCsv({})}>
          Exportar CSV
        </Button>
      </Stack>

      {/* Selector de dimensión */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        {DIMENSIONS.map((d) => (
          <Chip
            key={d.key}
            label={d.label}
            color={dim === d.key ? 'primary' : 'default'}
            variant={dim === d.key ? 'filled' : 'outlined'}
            onClick={() => setDim(d.key)}
          />
        ))}
      </Stack>

      {/* Distribución + total */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: '0 0 240px' }}>
          <CardContent>
            <Typography variant="subtitle2">Total</Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {dist.isLoading ? '…' : total}
            </Typography>
            {dist.isError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                No se pudo cargar la distribución.
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Distribución por {DIMENSIONS.find((x) => x.key === dim)?.label}
            </Typography>
            <Box sx={{ height: 280 }}>
              {dist.isLoading ? (
                <Skeleton variant="rounded" height={280} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dist.data ?? []}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="key" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* KPIs: Benched y Leave */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2">Benched (Yes)</Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {benched.isLoading ? '…' : benchedYes}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2">Leave probability</Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {leaveProb.isLoading
                ? '…'
                : `${((leaveProb.data?.probability ?? 0) * 100).toFixed(1)}%`}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2">Leave vs Stay</Typography>
            <Box sx={{ height: 160, mt: 1 }}>
              {leaveDist.isLoading ? (
                <Skeleton variant="rounded" height={140} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(leaveDist.data ?? []).map((d) => ({
                      label: d.key === '1' ? 'Leave' : 'Stay',
                      count: d.count,
                    }))}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* Correlación experiencia vs tier */}
      <Card>
  <CardContent>
    <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
      Correlación: Experiencia (x) vs Payment Tier (y)
    </Typography>
    <Typography variant="caption" sx={{ color: "text.secondary" }}>
      Puntos: {corr.data?.length ?? 0}
    </Typography>

    <Box sx={{ height: 300, mt: 1 }}>
      {corr.isLoading ? (
        <Skeleton variant="rounded" height={300} />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid />
            <XAxis
              type="number"
              dataKey="x"
              name="Experience (yrs)"
              domain={[
                0,
                Math.max(1, Math.ceil(Math.max(...(corr.data ?? []).map(p => p.x || 0))))
              ]}
              allowDecimals={false}
              tickCount={(Math.max(...(corr.data ?? []).map(p => p.x || 0)) || 1) + 1}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Tier"
              domain={[1, 3]}
              ticks={[1, 2, 3]}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(val: any, name: string) =>
                name === "y" ? [`${val}`, "Tier"] : [`${val} yrs`, "Experience"]
              }
            />
            <Scatter
              data={corr.data ?? []}
              shape="circle"
              // tamaño y opacidad suaves
              fillOpacity={0.85}
            />
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </Box>
  </CardContent>
</Card>

    </Box>
  );
}
