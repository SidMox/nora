import { Respuesta } from '@mox/shared';
import { Health, HttpResponse, HttpServerAdapter } from '../../../src/index.ts';

test('publica health, respuestas asíncronas y errores con sus estados HTTP', async () => {
    const entries: import('../../../src/index.ts').LogEntry[] = [];
    const logger: import('../../../src/index.ts').LoggerControl = {
        /** Captura eventos a través del contrato propio. */
        Write(entry) { entries.push(entry); return Respuesta.FromSuccess(true); },
    };
    const server = new HttpServerAdapter({ logger, specification: {}, routes: [
        { path: '/health', Execute: function CheckHealth() { return Health('prueba'); } },
        { path: '/created', Execute: async function Create() { return HttpResponse(Respuesta.FromSuccess(true), 201); } },
        { path: '/missing', Execute: function Missing() { return Respuesta.FromError(undefined, 'ausente').SetCodigo('404'); } },
        { path: '/failure', Execute: async function Failure() { throw new Error('detalle privado'); } },
    ] });
    const started = await server.Start(0);
    expect(started.tipoRespuesta).toBe('SUCCESS');
    try {
        const base = `http://127.0.0.1:${started.data}`;
        const health = await fetch(`${base}/health`);
        expect(health.status).toBe(200);
        expect(await health.json()).toMatchObject({ data: { service: 'prueba', status: 'ok' } });
        expect((await fetch(`${base}/created`)).status).toBe(201);
        expect((await fetch(`${base}/missing`)).status).toBe(404);
        expect((await fetch(`${base}/unknown`)).status).toBe(404);
        const failure = await fetch(`${base}/failure`);
        expect(failure.status).toBe(500);
        expect(await failure.json()).toEqual({ codigo: '500', tipoRespuesta: 'ERROR', descripcion: 'Error interno' });
        expect(entries.some((entry) => entry.level === 'error')).toBe(true);
        expect(health.headers.get('x-content-type-options')).toBe('nosniff');
        expect(health.headers.get('x-powered-by')).toBeNull();
        expect(health.headers.get('strict-transport-security')).toBeNull();
        const docs = await fetch(`${base}/docs/`);
        expect(docs.status).toBe(200);
        expect(await docs.text()).toContain('swagger-ui');
        const malformed = await fetch(`${base}/health`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
        expect(malformed.status).toBe(400);
        const oversized = await fetch(`${base}/health`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify('a'.repeat(110000)) });
        expect(oversized.status).toBe(413);
    } finally { expect((await server.Stop()).tipoRespuesta).toBe('SUCCESS'); }
});
