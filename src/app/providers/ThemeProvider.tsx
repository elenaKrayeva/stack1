import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import type { ReactNode } from 'react';

const theme = createTheme({
  palette: { mode: 'light' },
});

export const MuiThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
