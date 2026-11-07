import type { ReactNode } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
const DEFAULT_THEME = createTheme({ palette: { primary: { main: '#2456a6' } } });

/** Aplica el tema compartido y normaliza los estilos del navegador. */
export function ThemeAdapter({ children }: { children: ReactNode }) {
    return <ThemeProvider theme={DEFAULT_THEME}><CssBaseline />{children}</ThemeProvider>;
}
