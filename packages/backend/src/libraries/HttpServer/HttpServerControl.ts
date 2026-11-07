import type { LoggerControl } from '../Logger/LoggerControl.ts';
import type { Respuesta } from '@mox/shared';
import type { HttpResponseResult } from '../../responses/HttpResponse.ts';
export type HttpRouteResult = Respuesta<unknown> | HttpResponseResult;
export interface HttpRoute {
    path: string;
    /** Ejecuta la ruta con estado automático o una respuesta HTTP explícita. */
    Execute: () => HttpRouteResult | Promise<HttpRouteResult>;
}
export interface HttpServerOptions {
    routes: HttpRoute[];
    specification: object;
    logger?: LoggerControl;
    production?: boolean;
}
export interface HttpServerControl {
    /** Inicia el servidor y devuelve el puerto asignado. */
    Start(port: number): Promise<Respuesta<number>>;
    /** Cierra el servidor liberando sus conexiones. */
    Stop(): Promise<Respuesta<boolean>>;
}
