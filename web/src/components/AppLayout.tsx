import type { ReactNode } from 'react';
import {
  AppBar, Box, Toolbar, Typography, IconButton, Drawer, List,
  ListItemButton, ListItemIcon, ListItemText, Divider, Avatar,
  useMediaQuery
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart2, Users, LogOut, Briefcase, Menu as MenuIcon } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import * as React from 'react';

const drawerWidth = 240;

type Item = { label: string; icon: React.ReactNode; to: string };

export default function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout, role } = useAuth();

  const isMdUp = useMediaQuery((t: Theme) => t.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const items: Item[] = [
    { label: 'Employees',   icon: <Users size={20} />,     to: '/employees' },
    { label: 'Analytics',   icon: <BarChart2 size={20} />, to: '/analytics' },
    { label: 'Assignments', icon: <Briefcase size={20} />, to: '/assignments' },
  ];

  const DrawerContent = (
    <React.Fragment>
      <Toolbar />
      <List sx={{ mt: 1 }}>
        {items.map((it) => {
          const selected = pathname.startsWith(it.to);
          return (
            <ListItemButton
              key={it.to}
              selected={selected}
              onClick={() => {
                navigate(it.to);
                setMobileOpen(false); // cerrar en móvil
              }}
              sx={{
                borderRadius: 1,
                mx: 1,
                '&.Mui-selected': { bgcolor: 'action.selected' },
              }}
              aria-current={selected ? 'page' : undefined}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{it.icon}</ListItemIcon>
              <ListItemText primary={it.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ mt: 'auto' }} />
    </React.Fragment>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
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
          {!isMdUp && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Abrir menú"
              sx={{ mr: 1 }}
            >
              <MenuIcon size={20} />
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, cursor: 'pointer' }}
            onClick={() => navigate('/employees')}
            aria-label="Ir a Employees"
          >
            KPMG HR Insights
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary', display: { xs: 'none', sm: 'inline' } }}>
            {role}
          </Typography>
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>{(role ?? 'H')[0]}</Avatar>
          <IconButton aria-label="Cerrar sesión" onClick={logout}>
            <LogOut size={20} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer temporal (móvil) */}
      {!isMdUp && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #E2E8F0' },
          }}
        >
          {DrawerContent}
        </Drawer>
      )}

      {/* Drawer permanente (md+) */}
      {isMdUp && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid #E2E8F0',
            },
          }}
          open
        >
          {DrawerContent}
        </Drawer>
      )}

      {/* Contenido */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          ml: { xs: 0, md: `${drawerWidth}px` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
