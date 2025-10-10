import type { ReactNode } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart2, Users, LogOut } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

const drawerWidth = 240;

export default function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout, role } = useAuth();

  const items = [
    { label: 'Employees', icon: <Users size={20} />, to: '/employees' },
    { label: 'Analytics', icon: <BarChart2 size={20} />, to: '/analytics' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          borderBottom: '1px solid #E2E8F0',
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, cursor: 'pointer' }}
            onClick={() => navigate('/employees')}
            aria-label="Ir a Employees"
          >
            KPMG HR Insights
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
            {role}
          </Typography>
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>{(role ?? 'HR')[0]}</Avatar>
          <IconButton aria-label="Cerrar sesión" onClick={logout}>
            <LogOut size={20} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #E2E8F0',
          },
        }}
      >
        <Toolbar />
        <List sx={{ mt: 1 }}>
          {items.map((it) => (
            <ListItemButton
              key={it.to}
              selected={pathname.startsWith(it.to)}
              onClick={() => navigate(it.to)}
              sx={{ borderRadius: 1, mx: 1 }}
            >
              <ListItemIcon>{it.icon}</ListItemIcon>
              <ListItemText primary={it.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ mt: 'auto' }} />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${drawerWidth}px` }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
