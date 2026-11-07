export type TipoRespuesta = 'ERROR' | 'WARNING' | 'INFO' | 'SUCCESS';

export const TIPO_RESPUESTA_MAP: Record<string, TipoRespuesta> = {
    ERROR: 'ERROR',
    WARNING: 'WARNING',
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
}

export interface RespuestaBasic<T_DATA = unknown, T_ERROR = unknown> {
    codigo: string;
    tipoRespuesta: TipoRespuesta;
    descripcion: string;
    data?: T_DATA;
    obs?: string[];
    error?: string | T_ERROR;
    error_desc?: string;
}