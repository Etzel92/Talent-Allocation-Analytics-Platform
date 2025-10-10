import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  shape: { borderRadius: 12 },
  palette: {
    mode: 'light',
    primary: { main: '#175CD3' },
    secondary: { main: '#7F56D9' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      '-apple-system',
      'Segoe UI',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h5: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiContainer: {
      defaultProps: { maxWidth: 'lg' },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 6px 20px rgba(2, 6, 23, 0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 18 },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
  },
});

theme = responsiveFontSizes(theme, { factor: 2.2 });

export default theme;
