import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Application } from './Application.tsx';

const container = document.getElementById('root');
if (!container) throw new Error('No se encontró el contenedor de la aplicación');
createRoot(container).render(<StrictMode><Application /></StrictMode>);
