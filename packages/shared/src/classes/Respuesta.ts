import {
    TIPO_RESPUESTA_MAP,
    type RespuestaBasic,
    type TipoRespuesta,
} from "../interfaces/RespuestaBasic.ts";


/** Comunica resultados genéricos: error, información, advertencia o éxito. */
export class Respuesta<T_DATA = unknown> implements RespuestaBasic<T_DATA> {
    public codigo: string;
    public readonly tipoRespuesta: TipoRespuesta;
    public descripcion: string;
    public readonly data?: T_DATA | undefined;
    public obs?: string[] | undefined;
    public readonly error?: unknown;
    public readonly error_desc?: string | undefined;

    /** Inicializa los campos comunes mediante las fábricas de respuestas. */
    private constructor(parametros: RespuestaBasic<T_DATA>) {
        this.error = parametros.error;
        this.error_desc = parametros.error_desc;
        this.codigo = parametros.codigo;
        this.tipoRespuesta = parametros.tipoRespuesta;
        this.descripcion = parametros.descripcion;

        if (parametros.data !== undefined) {
            this.data = parametros.data;
        }

        if (parametros.obs !== undefined) {
            this.obs = [...parametros.obs];
        }
    }

    /** Crea una respuesta de error conservando su detalle. */
    public static FromError<T_DATA = unknown, T_ERROR = unknown>(
        error: T_ERROR, error_desc: string, data?: T_DATA
    ): Respuesta<T_DATA> {
        return new Respuesta<T_DATA>(
            {
                tipoRespuesta: TIPO_RESPUESTA_MAP.ERROR,
                codigo: '500',
                descripcion: 'Error Externo',
                data,
                error,
                error_desc,
            }
        );
    }

    /** Crea una respuesta de advertencia con su detalle obligatorio. */
    public static FromWarning<T_DATA = unknown>(
        data?: T_DATA, obs?: string[],
    ): Respuesta<T_DATA> {
        return new Respuesta<T_DATA>(
            {
                tipoRespuesta: TIPO_RESPUESTA_MAP.WARNING,
                codigo: 'W202',
                descripcion: 'Algo salio mal',
                data,
                obs
            }
        );
    }

    /** Crea una respuesta informativa con su detalle obligatorio. */
    public static FromInfo<T_DATA = unknown>(
        obs: string[]
    ): Respuesta<T_DATA> {
        return new Respuesta<T_DATA>(
            {
                tipoRespuesta: TIPO_RESPUESTA_MAP.INFO,
                codigo: 'I200',
                descripcion: 'Informacion',
                obs,
            }
        );
    }

    /** Crea una respuesta exitosa con su detalle obligatorio. */
    public static FromSuccess<T_DATA = unknown>(
        data: T_DATA
    ): Respuesta<T_DATA> {
        return new Respuesta<T_DATA>(
            {
                tipoRespuesta: TIPO_RESPUESTA_MAP.SUCCESS,
                codigo: '200',
                descripcion: 'ok',
                data
            }
        );
    }

    /** Transforma los datos conservando el estado y los detalles de la respuesta. */
    public TransformarDatos<T_RESULTADO>(
        transformar: (data: T_DATA) => T_RESULTADO | undefined,
    ): Respuesta<T_RESULTADO> {
        return new Respuesta<T_RESULTADO>({
            codigo: this.codigo,
            tipoRespuesta: this.tipoRespuesta,
            descripcion: this.descripcion,
            data: this.data === undefined ? undefined : transformar(this.data),
            obs: this.obs,
            error: this.error,
            error_desc: this.error_desc,
        });
    }

    /** Actualiza el código conservando el tipo de la respuesta. */
    public SetCodigo(codigo: string): this {
        this.codigo = codigo;
        return this;
    }

    /** Actualiza la descripción conservando el tipo de la respuesta. */
    public SetDescripcion(descripcion: string): this {
        this.descripcion = descripcion;
        return this;
    }

    /** Agrega una observación conservando el tipo de la respuesta. */
    public AddObs(observacion: string): this {
        this.obs ??= [];
        this.obs.push(observacion);
        return this;
    }

    /** Agrega una observación conservando el tipo de la respuesta. */
    public AddMultiObs(observaciones: string[]): this {
        this.obs ??= [];
        this.obs.push(...observaciones);
        return this;
    }
}
