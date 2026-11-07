import { PageLayout, Text } from '@mox/web-mui';

/** Presenta la entrada del proyecto auth mientras se definen sus funcionalidades. */
export function HomePage() {
    return <PageLayout><Text variant="h1">Auth</Text><Text>Base del proyecto de autenticación.</Text><a href="/docs">Documentación de la API</a></PageLayout>;
}
