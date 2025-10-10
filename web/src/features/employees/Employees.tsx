import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../shared/lib/axios';
import {
  Container, Typography, Paper, Button, Alert, Skeleton, Stack, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import FiltersBar, { type Filters } from './Filters';
import NewEmployeeDialog from './NewEmployeeDialog';

type EmployeeUI = {
  Education: string;
  JoiningYear: number;
  City: string;
  PaymentTier: number;
  Age: number;
  Gender: string;
  EverBenched: string;
  ExperienceInCurrentDomain: number;
  LeaveOrNot: number;
};

// 🔧 normaliza cualquier esquema que devuelva el backend
const normalizeEmployee = (r: any): EmployeeUI => ({
  Education: r.Education ?? r.education ?? '',
  JoiningYear: r.JoiningYear ?? r.joining_year ?? r.joiningYear ?? 0,
  City: r.City ?? r.city ?? '',
  PaymentTier: r.PaymentTier ?? r.payment_tier ?? r.paymentTier ?? 0,
  Age: r.Age ?? r.age ?? 0,
  Gender: r.Gender ?? r.gender ?? '',
  EverBenched: r.EverBenched ?? r.ever_benched ?? r.everBenched ?? '',
  ExperienceInCurrentDomain:
    r.ExperienceInCurrentDomain ??
    r.experience_in_current_domain ??
    r.experienceInCurrentDomain ??
    0,
  LeaveOrNot: r.LeaveOrNot ?? r.leave_or_not ?? r.leaveOrNot ?? 0,
});

export default function Employees() {
  const [filters, setFilters] = useState<Filters>({});
  const qs = new URLSearchParams(filters as Record<string, string>).toString();

  const queryClient = useQueryClient();
  const [openNew, setOpenNew] = useState(false);

  // Control por rol (HR / MANAGER pueden crear)
  const role = (localStorage.getItem('role') || '').toUpperCase();
  const canCreate = role === 'HR' || role === 'MANAGER';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      const res = await api.get('/employees', { params: filters });

      // Soporta:
      // 1) body = []                     (sin total)
      // 2) body = { items: [], total }   (total en body)
      // 3) header: x-total-count         (total en header)
      const raw = Array.isArray(res.data?.items) ? res.data.items : res.data;
      const rows: EmployeeUI[] = (raw ?? []).map(normalizeEmployee);
      const total =
        (typeof res.data?.total === 'number' ? res.data.total : undefined) ??
        (res.headers?.['x-total-count'] ? Number(res.headers['x-total-count']) : undefined) ??
        rows.length;

      return { rows, total };
    },
  });

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;

  const cols = useMemo<GridColDef<EmployeeUI>[]>(
    () => [
      { field: 'Education', headerName: 'Education', flex: 1 },
      { field: 'JoiningYear', headerName: 'Joining', width: 110, type: 'number' },
      { field: 'City', headerName: 'City', flex: 1 },
      { field: 'PaymentTier', headerName: 'Tier', width: 90, type: 'number' },
      { field: 'Age', headerName: 'Age', width: 90, type: 'number' },
      { field: 'Gender', headerName: 'Gender', width: 110 },
      { field: 'EverBenched', headerName: 'Benched', width: 110 },
      {
        field: 'ExperienceInCurrentDomain',
        headerName: 'Experience',
        width: 130,
        type: 'number',
      },
      { field: 'LeaveOrNot', headerName: 'Leave', width: 90, type: 'number' },
    ],
    [],
  );

  const handleExport = () => {
    const a = document.createElement('a');
    a.href = `${import.meta.env.VITE_API_URL}/reports/export?${qs}`;
    a.download = 'employees_export.csv';
    a.click();
  };

  // Se llama después de guardar un nuevo empleado
  const handleCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  return (
    <Container>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h5">Employees</Typography>
          <Chip label={`Encontrados: ${total}`} size="small" />
        </Stack>
        <Stack direction="row" spacing={1}>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNew(true)}
            >
              Nuevo empleado
            </Button>
          )}
          <Button variant="contained" onClick={handleExport}>
            Exportar CSV
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <FiltersBar onChange={setFilters} />
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          No se pudo cargar la información.
        </Alert>
      )}
      {isLoading ? (
        <Skeleton variant="rounded" height={520} />
      ) : (
        <Paper sx={{ height: 520 }}>
          <DataGrid
            rows={rows.map((r, i) => ({ id: i, ...r }))}
            columns={cols}
            disableRowSelectionOnClick
            density="compact"
            initialState={{
              pagination: { paginationModel: { pageSize: 50, page: 0 } },
            }}
            pageSizeOptions={[10, 25, 50, 100, 250, 500]}
            localeText={{ noRowsLabel: 'Sin resultados para los filtros actuales' }}
          />
        </Paper>
      )}

      {/* Diálogo de alta */}
      <NewEmployeeDialog
        open={openNew}
        onClose={() => setOpenNew(false)}
        onCreated={handleCreated}
      />
    </Container>
  );
}
