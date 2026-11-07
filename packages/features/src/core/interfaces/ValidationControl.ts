import type { Respuesta } from "@mox/shared";

export const MAP_OPERACION_VALIDATION = {
    DELETE: 'DELETE',
    UPDATE: 'UPDATE',
    CREATE: 'CREATE',
    MONITOR: 'MONITOR',
    TERCEROS: 'TERCEROS',
    OTROS: 'OTROS',
} as const;

export type OperationValidation = typeof MAP_OPERACION_VALIDATION[keyof typeof MAP_OPERACION_VALIDATION];

/** Comprueba un dato simple; undefined indica que cumple la condición. */
export type SimpleValidation<T_INPUT, T_CONFIG = void> = (
    input: T_INPUT, config: T_CONFIG,
) => string | undefined;

/** Acumula todas las observaciones aplicables a un campo de la entrada. */
export type EntityValidation<T_ENTIDAD, T_ENTORNO> = (
    input: T_ENTIDAD, entorno?: T_ENTORNO,
) => string[];

/** Valida la entrada completa y comunica el resultado con Respuesta. */
export type Validation<T_INPUT, T_ENTORNO = unknown> = (
    input: T_INPUT, entorno?: T_ENTORNO,
) => Respuesta<boolean>;

/** Los métodos de campo cumplen EntityValidation por convención documentada. */
export interface ValidationControl<T_INPUT, T_ENTORNO = unknown> {
    readonly operacion: OperationValidation;
    /** Ejecuta los campos aplicables a la operación y acumula sus observaciones. */
    MasterValidation: Validation<T_INPUT, T_ENTORNO>;
}
