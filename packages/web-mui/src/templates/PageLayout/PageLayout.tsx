import { Container, Stack } from '@mui/material';
import type { ReactNode } from 'react';

/** Ofrece una página centrada con separación vertical consistente. */
export function PageLayout({ children }: { children: ReactNode }) {
    return <Container component="main" maxWidth="sm"><Stack spacing={3} sx={{ py: 8 }}>{children}</Stack></Container>;
}
