import { useEffect, useMemo, useState } from 'react';
import { TextField, MenuItem, Stack, Box } from '@mui/material';

export type Filters = {
  city?: string;
  gender?: string;
  education?: string;
  age_min?: string;
  age_max?: string;
  payment_tier?: string;
  joining_year?: string;
  ever_benched?: string;
  leave_or_not?: string;
};

export default function FiltersBar({ onChange }: { onChange: (f: Filters) => void }) {
  const [f, setF] = useState<Filters>({});
  const set = (k: keyof Filters, v: string) => setF((prev) => ({ ...prev, [k]: v || undefined }));

  const debounced = useMemo(() => f, [f]);
  useEffect(() => {
    const t = setTimeout(() => onChange(debounced), 300);
    return () => clearTimeout(t);
  }, [debounced, onChange]);

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      <Box sx={{ flex: 1, minWidth: 180 }}>
        <TextField fullWidth label="City" onChange={(e) => set('city', e.target.value)} />
      </Box>
      <Box sx={{ width: { xs: '100%', md: 200 } }}>
        <TextField select fullWidth label="Gender" onChange={(e) => set('gender', e.target.value)}>
          <MenuItem value="">(Todos)</MenuItem>
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
        </TextField>
      </Box>
      <Box sx={{ flex: 1, minWidth: 200 }}>
        <TextField fullWidth label="Education" onChange={(e) => set('education', e.target.value)} />
      </Box>
      <Box sx={{ width: { xs: '100%', md: 140 } }}>
        <TextField
          fullWidth
          label="Age Min"
          type="number"
          onChange={(e) => set('age_min', e.target.value)}
        />
      </Box>
      <Box sx={{ width: { xs: '100%', md: 140 } }}>
        <TextField
          fullWidth
          label="Age Max"
          type="number"
          onChange={(e) => set('age_max', e.target.value)}
        />
      </Box>
    </Stack>
  );
}
