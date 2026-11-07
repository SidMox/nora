import { Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface TextProperties {
    children: ReactNode;
    variant?: 'h1' | 'h2' | 'body1';
}

/** Presenta texto mediante el adaptador de tipografía MUI. */
export function Text({ children, variant = 'body1' }: TextProperties) {
    return <Typography variant={variant}>{children}</Typography>;
}
