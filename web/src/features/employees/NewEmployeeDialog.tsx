import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, FormControlLabel, Switch, Box
} from '@mui/material';
import api from '../../shared/lib/axios';

type NewEmployee = {
  education: 'Bachelors' | 'Masters' | 'PHD';
  joining_year: number;
  city: string;
  payment_tier: 1 | 2 | 3;
  age: number;
  gender: 'Male' | 'Female';
  ever_benched: 'Yes' | 'No';
  experience_in_current_domain: number;
  leave_or_not: 0 | 1;
};

type Props = { open: boolean; onClose: () => void; onCreated: () => void; };

const genders = ['Male', 'Female'] as const;
const educations = ['Bachelors', 'Masters', 'PHD'] as const;
const tiers = [1, 2, 3] as const;

export default function NewEmployeeDialog({ open, onClose, onCreated }: Props) {
  const [form, setForm] = React.useState<NewEmployee>({
    education: 'Bachelors',
    joining_year: 2018,
    city: '',
    payment_tier: 1,
    age: 25,
    gender: 'Male',
    ever_benched: 'No',
    experience_in_current_domain: 0,
    leave_or_not: 0,
  });
  const [saving, setSaving] = React.useState(false);

  const onChange = (k: keyof NewEmployee) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({
      ...f,
      [k]: typeof f[k] === 'number' ? Number(e.target.value) : e.target.value
    }));

  async function submit() {
    try {
      setSaving(true);
      if (!form.city.trim()) throw new Error('City es requerido');
      if (form.age < 18 || form.age > 70) throw new Error('Edad fuera de rango');
      await api.post('/employees', form);
      onCreated();
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.detail || err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo empleado</DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          }}
        >
          <TextField
            select fullWidth label="Education" value={form.education}
            onChange={onChange('education')}
          >
            {educations.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
          </TextField>

          <TextField
            type="number" fullWidth label="Joining Year"
            value={form.joining_year} onChange={onChange('joining_year')}
          />

          <TextField
            fullWidth label="City" value={form.city} onChange={onChange('city')}
          />

          <TextField
            select fullWidth label="Payment Tier" value={form.payment_tier}
            onChange={onChange('payment_tier')}
          >
            {tiers.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>

          <TextField
            type="number" fullWidth label="Age"
            value={form.age} onChange={onChange('age')}
          />

          <TextField
            select fullWidth label="Gender" value={form.gender}
            onChange={onChange('gender')}
          >
            {genders.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </TextField>

          <TextField
            type="number" fullWidth label="Experience (yrs)"
            value={form.experience_in_current_domain}
            onChange={onChange('experience_in_current_domain')}
          />

          <TextField
            select fullWidth label="Benched" value={form.ever_benched}
            onChange={onChange('ever_benched')}
          >
            {['Yes','No'].map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
          </TextField>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.leave_or_not === 1}
                  onChange={(_, v) => setForm(f => ({ ...f, leave_or_not: v ? 1 : 0 }))}
                />
              }
              label="Leave (abandono)"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={submit} variant="contained" disabled={saving}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
