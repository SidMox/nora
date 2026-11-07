import { ThemeAdapter } from '@mox/web-mui';
import { HomePage } from './pages/HomePage.tsx';

/** Compone el tema y la página inicial de auth. */
export function Application() {
    return <ThemeAdapter><HomePage /></ThemeAdapter>;
}
