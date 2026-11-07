import { Health, HttpServerAdapter, type HttpServerOptions } from '@mox/backend';

/** Compone las dependencias de la API REST de auth. */
export function CreateApplication(options: Pick<HttpServerOptions, 'logger' | 'production'> = {}): HttpServerAdapter {
    return new HttpServerAdapter({
        ...options,
        routes: [{ path: '/api/health',
            /** Consulta la disponibilidad de esta aplicación. */
            Execute: function CheckHealth() { return Health('auth'); },
        }],
        specification: {
            openapi: '3.0.3',
            info: { title: 'Auth API', version: '0.1.0' },
            paths: {
                '/api/health': { get: { summary: 'Consulta el estado del servicio', responses: {
                    '200': { description: 'Servicio disponible', content: { 'application/json': { schema: {
                        type: 'object', properties: {
                            codigo: { type: 'string', example: '200' },
                            tipoRespuesta: { type: 'string' },
                            descripcion: { type: 'string' },
                            data: { type: 'object', properties: { service: { type: 'string' }, status: { type: 'string' } } },
                        },
                    } } } },
                } } },
            },
        },
    });
}

