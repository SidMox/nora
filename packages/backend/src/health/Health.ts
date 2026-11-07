import { Respuesta } from '@mox/shared';

export interface HealthOutput {
    service: string;
    status: 'ok';
}

/** Confirma que la aplicación responde sin consultar dependencias externas. */
export function Health(service: string): Respuesta<HealthOutput> {
    return Respuesta.FromSuccess({ service, status: 'ok' });
}
