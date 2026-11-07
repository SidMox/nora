import type { Respuesta } from '@mox/shared';
import type { LogLevel } from '../Logger/LoggerControl.ts';

export interface BackendConfiguration {
    port: number;
    environment: 'development' | 'test' | 'production';
    logLevel: LogLevel;
}

export interface EnvironmentControl {
    /** Valida las variables de arranque sin modificar el entorno del proceso. */
    Load(environment: Readonly<Record<string, string | undefined>>): Respuesta<BackendConfiguration>;
}
