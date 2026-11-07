import type { Respuesta, RespuestaBasic } from '@mox/shared';

export interface HttpResponseResult<T_DATA = unknown> {
    status: number;
    body: RespuestaBasic<T_DATA>;
}

/** Prepara la respuesta pública y permite elegir un estado HTTP por operación. */
export function HttpResponse<T_DATA>(respuesta: Respuesta<T_DATA>, status?: number): HttpResponseResult<T_DATA> {
    const codigo = /^\d{3}$/.test(respuesta.codigo) ? Number(respuesta.codigo) : undefined;
    const defaultStatus = respuesta.tipoRespuesta === 'ERROR' ? 500 : 200;
    const resolvedStatus = status ?? (codigo !== undefined && codigo >= 200 && codigo <= 599 ? codigo : defaultStatus);
    if (!Number.isInteger(resolvedStatus) || resolvedStatus < 200 || resolvedStatus > 599) {
        throw new RangeError('Estado HTTP inválido');
    }
    return {
        status: resolvedStatus,
        body: {
            codigo: respuesta.codigo,
            tipoRespuesta: respuesta.tipoRespuesta,
            descripcion: respuesta.descripcion,
            ...(respuesta.data !== undefined ? { data: respuesta.data } : {}),
            ...(respuesta.obs !== undefined ? { obs: [...respuesta.obs] } : {}),
        },
    };
}
