import { createServer, type Server } from 'node:http';
import express from 'express';
import helmet from 'helmet';
import type { RespuestaBasic } from '@mox/shared';
import { LoggerAdapter } from '../Logger/LoggerAdapter.ts';
import swaggerUi from 'swagger-ui-express';
import { Respuesta } from '@mox/shared';
import { HttpResponse } from '../../responses/HttpResponse.ts';
import type { HttpServerControl, HttpServerOptions } from './HttpServerControl.ts';

type HttpRequest = express.Request<Record<string, string>, unknown, unknown, Record<string, unknown>, Record<string, unknown>>;
type HttpResponseWriter = express.Response<RespuestaBasic<unknown>, Record<string, unknown>>;

export class HttpServerAdapter implements HttpServerControl {
    private readonly server: Server;

    /** Configura Express, rutas REST, Swagger y errores sin exponer detalles internos. */
    public constructor(options: HttpServerOptions) {
        const application = express();
        const logger = options.logger ?? new LoggerAdapter();
        application.use(helmet({
            contentSecurityPolicy: { directives: { upgradeInsecureRequests: options.production ? [] : null } },
            strictTransportSecurity: options.production ? undefined : false,
        }));
        /** Registra solo metadatos de la petición al terminar la respuesta. */
        application.use(function LogRequest(request: HttpRequest, response: HttpResponseWriter, next: express.NextFunction): void {
            const startedAt = performance.now();
            /** Comunica el estado final sin registrar query, cuerpo ni cabeceras. */
            response.once('finish', function LogCompletion(): void {
                const logged = logger.Write({ level: 'info', message: 'Petición HTTP', context: {
                    method: request.method, path: request.path, status: response.statusCode,
                    durationMs: performance.now() - startedAt,
                } });
                if (logged.tipoRespuesta === 'ERROR') console.error('No se pudo registrar la petición HTTP');
            });
            next();
        });
        application.disable('x-powered-by');
        application.use(express.json({ limit: '100kb' }));
        /** Publica el contrato OpenAPI del servicio. */
        application.get('/openapi.json', function Specification(_request: HttpRequest, response: express.Response<object, Record<string, unknown>>): void {
            response.json(options.specification);
        });
        application.use('/docs', swaggerUi.serve, swaggerUi.setup(options.specification));
        for (const route of options.routes) {
            /** Ejecuta la ruta y traduce su resultado HTTP. */
            application.get(route.path, async function ExecuteRoute(_request: HttpRequest, response: HttpResponseWriter): Promise<void> {
                const result = await route.Execute();
                const httpResponse = result instanceof Respuesta ? HttpResponse(result) : result;
                response.status(httpResponse.status).json(httpResponse.body);
            });
        }
        /** Responde cuando no existe una ruta coincidente. */
        application.use(function NotFound(_request: HttpRequest, response: HttpResponseWriter): void {
            const result = HttpResponse(Respuesta.FromError(undefined, 'Ruta no encontrada').SetCodigo('404').SetDescripcion('Ruta no encontrada'));
            response.status(result.status).json(result.body);
        });
        /** Registra el error y devuelve un mensaje público seguro. */
        application.use(function HandleError(error: unknown, _request: HttpRequest, response: HttpResponseWriter, _next: express.NextFunction): void {
            const logged = logger.Write({ level: 'error', message: 'Error HTTP', context: { error } });
            if (logged.tipoRespuesta === 'ERROR') console.error('No se pudo registrar el error HTTP');
            if (response.headersSent) { _next(error); return; }
            const malformed = error instanceof SyntaxError && 'type' in error && error.type === 'entity.parse.failed';
            const oversized = typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.too.large';
            const status = malformed ? 400 : oversized ? 413 : 500;
            const message = malformed ? 'JSON inválido' : oversized ? 'Cuerpo demasiado grande' : 'Error interno';
            const result = HttpResponse(Respuesta.FromError(undefined, message).SetCodigo(String(status)).SetDescripcion(message));
            response.status(result.status).json(result.body);
        });
        this.server = createServer(application);
    }

    /** Escucha en el puerto solicitado y comunica errores de arranque. */
    public async Start(port: number): Promise<Respuesta<number>> {
        if (!Number.isInteger(port) || port < 0 || port > 65535) {
            return Respuesta.FromError(undefined, 'Puerto inválido');
        }
        try {
            await new Promise<void>((resolve, reject) => {
                this.server.once('error', reject);
                this.server.listen(port, () => {
                    this.server.removeListener('error', reject);
                    resolve();
                });
            });
            const address = this.server.address();
            if (!address || typeof address === 'string') return Respuesta.FromError(undefined, 'Puerto no disponible');
            return Respuesta.FromSuccess(address.port);
        } catch (error) {
            return Respuesta.FromError(error, 'No se pudo iniciar el servidor');
        }
    }

    /** Cierra el servidor y comunica posibles errores. */
    public async Stop(): Promise<Respuesta<boolean>> {
        return new Promise((resolve) => {
            this.server.close((error) => resolve(error ? Respuesta.FromError(error, 'No se pudo cerrar el servidor') : Respuesta.FromSuccess(true)));
        });
    }
}
