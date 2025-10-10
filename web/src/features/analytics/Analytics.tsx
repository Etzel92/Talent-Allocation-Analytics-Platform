import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Button, ButtonGroup, Card, CardContent, CardHeader,
  Chip, Stack, Typography, Alert, Skeleton, useMediaQuery
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ScatterChart, Scatter,
} from 'recharts';
import {
  getDistribution, getCorrelation, getLeaveProbability,
  exportCsv, exportPreset,
} from '../../api/reports';

type DistItem = { key: string; count: number };
type CorrPoint = { x: number; y: number };

const DIMENSIONS = [
  { key: 'gender',    label: 'Gender' },
  { key: 'age',       label: 'Age' },
  { key: 'city',      label: 'City' },
  { key: 'education', label: 'Education' },
] as const;

export default function Analytics() {
  const [dim, setDim] = React.useState<(typeof DIMENSIONS)[number]['key']>('gender');
  const isMdUp = useMediaQuery((t: Theme) => t.breakpoints.up('md'));

  const dist = useQuery<DistItem[]>({
    queryKey: ['dist', dim],
    queryFn: () => getDistribution(dim),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (prev) => prev,
  });

  const corr = useQuery<CorrPoint[]>({
    queryKey: ['corr'],
    queryFn: () => getCorrelation(),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (prev) => prev,
  });

  const leaveProb = useQuery<{ probability: number }>({
    queryKey: ['leaveProb'],
    queryFn: () => getLeaveProbability(),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (prev) => prev,
  });

  const leaveDist = useQuery<DistItem[]>({
    queryKey: ['leaveDist'],
    queryFn: () => getDistribution('leave_or_not'),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (prev) => prev,
  });

  const benched = useQuery<DistItem[]>({
    queryKey: ['benched'],
    queryFn: () => getDistribution('ever_benched'),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (prev) => prev,
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

  const maxX = React.useMemo(() => {
    const xs = (corr.data ?? []).map((p) => p.x ?? 0);
    const maxVal = xs.length ? Math.max(...xs) : 0;
    return Math.max(1, Math.ceil(maxVal));
  }, [corr.data]);

  // Alturas adaptativas por breakpoint
  const hDist = isMdUp ? 320 : 220;
  const hKpi  = isMdUp ? 180 : 140;
  const hCorr = isMdUp ? 340 : 240;

  return (
    <Box>
      {/* Encabezado / exportes */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{ mb: 2, gap: 1 }}
      >
        <Typography variant="h5">Analytics</Typography>
        <ButtonGroup size={isMdUp ? 'medium' : 'small'}>
          <Button variant="outlined" onClick={() => exportPreset('diversity')}>Diversity report</Button>
          <Button variant="outlined" onClick={() => exportPreset('attrition')}>Rotation Report</Button>
          <Button variant="outlined" onClick={() => exportPreset('talent')}>Talent report</Button>
          <Button variant="contained" onClick={() => exportCsv({})}>Export to CSV</Button>
        </ButtonGroup>
      </Stack>

      {/* Selector de dimensión */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 2, flexWrap: 'nowrap', overflowX: 'auto', pb: 1 }}
      >
        {DIMENSIONS.map((d) => (
          <Chip
            key={d.key}
            label={d.label}
            color={dim === d.key ? 'primary' : 'default'}
            variant={dim === d.key ? 'filled' : 'outlined'}
            onClick={() => setDim(d.key)}
            sx={{ flexShrink: 0 }}
          />
        ))}
      </Stack>

      {/* Distribución + total */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: '0 0 260px' }}>
          <CardHeader titleTypographyProps={{ variant: 'subtitle2' }} title="Total" />
          <CardContent>
            <Typography variant="h4">{dist.isLoading ? '…' : total}</Typography>
            {dist.isError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                No se pudo cargar la distribución.
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardHeader title={`${DIMENSIONS.find((x) => x.key === dim)?.label} distribution`} />
          <CardContent>
            <Box sx={{ height: hDist }}>
              {dist.isLoading ? (
                <Skeleton variant="rounded" height={hDist} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dist.data ?? []} barGap={4}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="key"
                      interval={0}
                      angle={isMdUp ? 0 : -20}
                      height={isMdUp ? 30 : 50}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* KPIs */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardHeader title="Benched (Yes)" />
          <CardContent>
            <Typography variant="h4">
              {benched.isLoading ? '…' : benchedYes}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardHeader title="Leave probability" />
          <CardContent>
            <Typography variant="h4">
              {leaveProb.isLoading
                ? '…'
                : `${((leaveProb.data?.probability ?? 0) * 100).toFixed(1)}%`}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardHeader title="Leave vs Stay" />
          <CardContent>
            <Box sx={{ height: hKpi }}>
              {leaveDist.isLoading ? (
                <Skeleton variant="rounded" height={hKpi} />
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
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* Correlación experiencia vs tier */}
      <Card>
        <CardHeader
          title="Correlation: Experience(x) vs Payment Tier (y)"
          subheader={`Points: ${corr.data?.length ?? 0}`}
        />
        <CardContent>
          <Box sx={{ height: hCorr }}>
            {corr.isLoading ? (
              <Skeleton variant="rounded" height={hCorr} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Experience (yrs)"
                    domain={[0, maxX]}
                    allowDecimals={false}
                    tickCount={maxX + 1}
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
                      name === 'y'
                        ? [`${val}`, 'Tier']
                        : [`${val} yrs`, 'Experience']
                    }
                  />
                  <Scatter data={corr.data ?? []} shape="circle" fillOpacity={0.9} />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
