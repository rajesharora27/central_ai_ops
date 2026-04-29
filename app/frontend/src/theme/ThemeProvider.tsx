import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import type { ReactNode } from 'react';

const theme = createTheme({
  palette: {
    primary: { main: '#1565C0' },
    secondary: { main: '#7C3AED' },
    success: { main: '#15803D' },
    warning: { main: '#C2410C' },
    error: { main: '#BE123C' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' },
      },
    },
  },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
