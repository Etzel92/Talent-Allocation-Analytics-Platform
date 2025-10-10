import * as React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Stack, TextField } from "@mui/material";
import { listBenchEvents, startBench, endBench } from "../../api/bench";

export default function BenchHistoryDialog({ open, onClose, employeeId }:{ open:boolean; onClose:()=>void; employeeId:number; }) {
  const [events, setEvents] = React.useState<any[]>([]);
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  const [reason, setReason] = React.useState<string>("");

  React.useEffect(() => { if (open) listBenchEvents(employeeId).then(setEvents); }, [open, employeeId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Historial de bench</DialogTitle>
      <DialogContent dividers>
        <List dense>
          {events.map(ev => (
            <ListItem key={ev.id} secondaryAction={ev.end_date ? null : (
              <Button size="small" onClick={async () => { if (!endDate) return; await endBench(ev.id, endDate); setEndDate(""); const e=await listBenchEvents(employeeId); setEvents(e); }}>
                Cerrar con fecha
              </Button>
            )}>
              <ListItemText primary={`${ev.start_date} — ${ev.end_date ?? "Activo"}`} secondary={ev.reason || ""} />
            </ListItem>
          ))}
        </List>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <TextField label="Inicio" type="date" InputLabelProps={{ shrink: true }} value={startDate} onChange={e=>setStartDate(e.target.value)} />
          <TextField label="Motivo" value={reason} onChange={e=>setReason(e.target.value)} />
          <Button variant="contained" onClick={async ()=>{
            if (!startDate) return;
            await startBench(employeeId, startDate, reason || undefined);
            setStartDate(""); setReason("");
            const e = await listBenchEvents(employeeId); setEvents(e);
          }}>Agregar</Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <TextField label="Fin" type="date" InputLabelProps={{ shrink: true }} value={endDate} onChange={e=>setEndDate(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Cerrar</Button></DialogActions>
    </Dialog>
  );
}
