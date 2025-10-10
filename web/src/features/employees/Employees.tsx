import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../shared/lib/axios';

import {
  Container, Typography, Paper, Button, Alert, Skeleton,
  Stack, Chip, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import {
  DataGrid,
  type GridColDef,
  type GridColumnVisibilityModel,
} from '@mui/x-data-grid';

import FiltersBar, { type Filters } from './Filters';
import NewEmployeeDialog from './NewEmployeeDialog';
import BenchHistoryDialog from './BenchHistoryDialog';

type EmployeeUI = {
  Id: number;
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

const normalizeEmployee = (r: any): EmployeeUI => ({
  Id: r.id ?? r.Id ?? 0,
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
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [filters, setFilters] = useState<Filters>({});
  const queryClient = useQueryClient();

  const [openNew, setOpenNew] = useState(false);
  const [benchOpen, setBenchOpen] = useState(false);
  const [benchEmpId, setBenchEmpId] = useState<number>();

  const role = (localStorage.getItem('role') || '').toUpperCase();
  const canCreate = role === 'HR' || role === 'MANAGER';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      const res = await api.get('/employees', { params: filters });

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

  const cols: GridColDef<EmployeeUI>[] = [
    { field: 'City', headerName: 'City', flex: 1, minWidth: 140 },
    { field: 'Gender', headerName: 'Gender', width: 110 },
    { field: 'Age', headerName: 'Age', width: 90, type: 'number' },
    { field: 'PaymentTier', headerName: 'Tier', width: 90, type: 'number' },
    { field: 'Education', headerName: 'Education', flex: 1, minWidth: 140 },
    { field: 'JoiningYear', headerName: 'Joining', width: 110, type: 'number' },
    { field: 'ExperienceInCurrentDomain', headerName: 'Experience', width: 130, type: 'number' },
    { field: 'EverBenched', headerName: 'Benched', width: 110 },
    { field: 'LeaveOrNot', headerName: 'Leave', width: 90, type: 'number' },
    {
      field: 'actions',
      headerName: 'Accions',
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => {
            setBenchEmpId(params.row.Id);
            setBenchOpen(true);
          }}
        >
          History
        </Button>
      ),
    },
  ];

  // visibilidad de columnas por breakpoint (oculta algunas en mobile)
  const [colVis, setColVis] = useState<GridColumnVisibilityModel>({
    Education: isMdUp,
    JoiningYear: isMdUp,
    ExperienceInCurrentDomain: isMdUp,
  });

  useEffect(() => {
    setColVis({
      Education: isMdUp,
      JoiningYear: isMdUp,
      ExperienceInCurrentDomain: isMdUp,
    });
  }, [isMdUp]);

  const qs = new URLSearchParams(filters as Record<string, string>).toString();

  const handleExport = () => {
    const a = document.createElement('a');
    a.href = `${import.meta.env.VITE_API_URL}/reports/export?${qs}`;
    a.download = 'employees_export.csv';
    a.click();
  };

  const handleCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  return (
    <Container>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        sx={{ mb: 2, gap: 1 }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h5">Employees</Typography>
          <Chip label={`Found: ${total}`} size="small" />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNew(true)}
            >
              New Employee
            </Button>
          )}
          <Button variant="outlined" onClick={handleExport}>
            Export to CSV
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
        <Paper sx={{ p: 1 }}>
          <DataGrid
            rows={rows}
            getRowId={(r) => r.Id}
            columns={cols}
            disableRowSelectionOnClick
            density="compact"
            autoHeight={!isMdUp}
            initialState={{
              pagination: { paginationModel: { pageSize: 50, page: 0 } },
            }}
            pageSizeOptions={[10, 25, 50, 100, 250, 500]}
            columnVisibilityModel={colVis}
            onColumnVisibilityModelChange={setColVis}
            localeText={{ noRowsLabel: 'Sin resultados para los filtros actuales' }}
            sx={{ border: 'none' }}
          />
        </Paper>
      )}

      <NewEmployeeDialog
        open={openNew}
        onClose={() => setOpenNew(false)}
        onCreated={handleCreated}
      />

      {benchEmpId !== undefined && (
        <BenchHistoryDialog
          open={benchOpen}
          onClose={() => setBenchOpen(false)}
          employeeId={benchEmpId}
        />
      )}
    </Container>
  );
}