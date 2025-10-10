import * as React from 'react';
import {
  Container, Paper, Stack, TextField, Button, Typography,
  Autocomplete, Chip, Skeleton, Alert,
} from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listSkills } from '../../api/skills';
import { searchAssignments } from '../../api/assignments';
import { Download, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

type Row = {
  id: number;
  city: string;
  education: string;
  experience: number;
  payment_tier: number;
};

function toCSV(rows: Row[]) {
  const header = ['ID', 'City', 'Education', 'Experience', 'Tier'];
  const body = rows.map(r =>
    [r.id, r.city, r.education, r.experience, r.payment_tier].join(',')
  );
  return [header.join(','), ...body].join('\n');
}

export default function Assignments() {
  const queryClient = useQueryClient();
  const [sp, setSp] = useSearchParams();

  const [expMin, setExpMin] = React.useState<number | undefined>(
    sp.get('expMin') ? Number(sp.get('expMin')) : undefined
  );
  const [expMax, setExpMax] = React.useState<number | undefined>(
    sp.get('expMax') ? Number(sp.get('expMax')) : undefined
  );
  const [city, setCity] = React.useState(sp.get('city') ?? '');
  const [education, setEducation] = React.useState(sp.get('education') ?? '');
  const [skills, setSkills] = React.useState<string[]>(
    sp.get('skills') ? sp.get('skills')!.split(',').filter(Boolean) : []
  );

  // no buscar hasta que el usuario presione “Buscar”
  const [didSearch, setDidSearch] = React.useState(false);

  // opciones de skills
  const { data: skillOptions = [], isLoading: loadingSkills } = useQuery({
    queryKey: ['skills'],
    queryFn: listSkills,
  });

  const params = React.useMemo(
  () => ({
    experience_min: expMin,
    experience_max: expMax,
    city: city || undefined,
    education: education || undefined,
    skills: skills.join(',') || undefined,
    // match eliminado
  }),
  [expMin, expMax, city, education, skills]
);

  const {
    data: rows = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Row[]>({
    queryKey: ['assignments', params],
    queryFn: () => searchAssignments(params),
    enabled: didSearch, // no dispara al montar
  });

  // sincroniza filtros con la URL
  React.useEffect(() => {
    const next = new URLSearchParams();
    if (expMin !== undefined) next.set('expMin', String(expMin));
    if (expMax !== undefined) next.set('expMax', String(expMax));
    if (city) next.set('city', city);
    if (education) next.set('education', education);
    if (skills.length) next.set('skills', skills.join(','));
    
    setSp(next, { replace: true });
  }, [expMin, expMax, city, education, skills, setSp]);

  // chips de filtros
  const activeChips: Array<{ label: string; onDelete: () => void }> = [];
  if (expMin !== undefined) activeChips.push({ label: `Exp ≥ ${expMin}`, onDelete: () => setExpMin(undefined) });
  if (expMax !== undefined) activeChips.push({ label: `Exp ≤ ${expMax}`, onDelete: () => setExpMax(undefined) });
  if (city) activeChips.push({ label: `City: ${city}`, onDelete: () => setCity('') });
  if (education) activeChips.push({ label: `Education: ${education}`, onDelete: () => setEducation('') });
  if (skills.length) activeChips.push({ label: `Skills: ${skills.join(' · ')}`, onDelete: () => setSkills([]) });

  const cols = React.useMemo<GridColDef<Row>[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 90 },
      { field: 'city', headerName: 'City', flex: 1, minWidth: 140 },
      { field: 'education', headerName: 'Education', flex: 1, minWidth: 140 },
      { field: 'experience', headerName: 'Experience', width: 130, type: 'number' },
      { field: 'payment_tier', headerName: 'Tier', width: 90, type: 'number' },
    ],
    []
  );

  const onSearch = () => {
    setDidSearch(true); // empieza a mostrar resultados
    refetch();
  };

  const clearAll = () => {
    setExpMin(undefined);
    setExpMax(undefined);
    setCity('');
    setEducation('');
    setSkills([]);

    // ocultar resultados y limpiar cache de la query
    setDidSearch(false);
    queryClient.removeQueries({ queryKey: ['assignments'] });
  };

  const exportCsv = () => {
    if (!didSearch || !rows.length) return;
    const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'assignments.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Talent Match</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Download size={16} />} onClick={exportCsv} disabled={!didSearch || !rows.length}>
            Exportar CSV
          </Button>
        </Stack>
      </Stack>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Exp. mín"
            type="number"
            value={expMin ?? ''}
            onChange={(e) => setExpMin(e.target.value ? Number(e.target.value) : undefined)}
            inputProps={{ min: 0 }}
            sx={{ minWidth: 140 }}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Exp. máx"
            type="number"
            value={expMax ?? ''}
            onChange={(e) => setExpMax(e.target.value ? Number(e.target.value) : undefined)}
            inputProps={{ min: 0 }}
            sx={{ minWidth: 140 }}
          />
          <TextField
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            sx={{ minWidth: 160 }}
          />
          <TextField
            label="Education"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            sx={{ minWidth: 160 }}
          />
        </Stack>

        <Autocomplete
          multiple
          loading={loadingSkills}
          options={skillOptions.map((s) => s.name)}
          value={skills}
          onChange={(_, v) => setSkills(v)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip variant="outlined" label={option} {...getTagProps({ index })} />)
          }
          renderInput={(params) => <TextField {...params} label="Skills / Dominio" sx={{ mt: 2 }} />}
        />

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="contained" startIcon={<Search size={16} />} onClick={onSearch}>
            Buscar
          </Button>
          <Button variant="text" startIcon={<X size={16} />} onClick={clearAll}>
            Limpiar
          </Button>
        </Stack>

        {!!activeChips.length && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
            {activeChips.map((c, i) => (
              <Chip key={i} label={c.label} onDelete={c.onDelete} />
            ))}
          </Stack>
        )}
      </Paper>

      {/* Resultados */}
      {isError && <Alert severity="error" sx={{ mb: 2 }}>No se pudo cargar el buscador.</Alert>}

      {!didSearch ? (
        <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          Realiza una búsqueda para ver resultados.
        </Paper>
      ) : isLoading ? (
        <Skeleton variant="rounded" height={480} />
      ) : (
        <Paper sx={{ height: 520, p: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ px: 1, pb: 1 }}>
            {rows.length ? `Resultados: ${rows.length}` : 'Sin resultados'}
          </Typography>
          <DataGrid
            rows={rows}
            columns={cols}
            getRowId={(r) => r.id}
            disableRowSelectionOnClick
            density="compact"
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            pageSizeOptions={[10, 25, 50, 100, 250, 500]}
            sx={{ border: 'none' }}
          />
        </Paper>
      )}
    </Container>
  );
}