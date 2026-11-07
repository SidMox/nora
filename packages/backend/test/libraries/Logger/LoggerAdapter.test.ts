import { Writable } from 'node:stream';
import { LoggerAdapter } from '../../../src/libraries/Logger/LoggerAdapter.ts';

test('escribe JSON real con nivel mínimo y serializa errores', () => {
    const lines: string[] = [];
    const destination = new Writable({
        /** Captura la salida real del proveedor. */
        write(chunk: Buffer, _encoding, callback): void { lines.push(chunk.toString()); callback(); },
    });
    const logger = new LoggerAdapter('warn', destination);
    expect(logger.Write({ level: 'info', message: 'omitido' }).tipoRespuesta).toBe('SUCCESS');
    expect(logger.Write({ level: 'error', message: 'fallo', context: { error: new Error('detalle'), status: 500 } }).data).toBe(true);
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0])).toMatchObject({ level: 50, msg: 'fallo', status: 500, err: { message: 'detalle' } });
});
