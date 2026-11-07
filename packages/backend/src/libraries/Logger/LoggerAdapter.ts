import type { Writable } from 'node:stream';
import { pino, type Logger } from 'pino';
import { Respuesta } from '@mox/shared';
import type { LogEntry, LoggerControl, LogLevel } from './LoggerControl.ts';

export class LoggerAdapter implements LoggerControl {
    private readonly logger: Logger;

    /** Configura el nivel mínimo y una salida opcional para los eventos JSON. */
    public constructor(level: LogLevel = 'info', destination?: Writable) {
        const options = { level, base: undefined };
        this.logger = destination ? pino(options, destination) : pino(options);
    }

    /** Traduce el evento al proveedor y comunica fallos de escritura síncronos. */
    public Write(entry: LogEntry): Respuesta<boolean> {
        try {
            const { error, ...context } = entry.context ?? {};
            this.logger[entry.level]({ ...context, ...(error !== undefined ? { err: error } : {}) }, entry.message);
            return Respuesta.FromSuccess(true);
        } catch (error) {
            return Respuesta.FromError(error, 'No se pudo registrar el evento');
        }
    }
}
