import type { Respuesta } from '@mox/shared';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
    method?: string;
    path?: string;
    status?: number;
    durationMs?: number;
    error?: unknown;
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    context?: LogContext;
}

export interface LoggerControl {
    /** Registra un evento estructurado sin cuerpos, cabeceras ni credenciales HTTP. */
    Write(entry: LogEntry): Respuesta<boolean>;
}
