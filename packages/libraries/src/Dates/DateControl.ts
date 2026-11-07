import type { Respuesta } from '@mox/shared';

export type VisualDateFormat = 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
export type StorageDateType = 'DATE' | 'DATETIME';
export type DateUnit = 'days' | 'months' | 'years' | 'hours' | 'minutes' | 'seconds';
export type DateComparison = -1 | 0 | 1;

export interface DateAdapterOptions {
    visualFormat?: VisualDateFormat;
}

/** Contrato propio de fechas; no expone dependencias ni tipos del proveedor. */
export interface DateControl {
    /** Obtiene una copia de la fecha actual. */
    Ahora(): Respuesta<Date>;
    /** Indica si el valor es un Date válido, sin convertir cadenas implícitamente. */
    EsValida(valor: unknown): Respuesta<boolean>;
    /** Formatea una fecha para presentación; por defecto DD/MM/YYYY. */
    FormatearVisual(fecha: Date, formato?: VisualDateFormat): Respuesta<string>;
    /** Interpreta estrictamente un texto visual como fecha local a medianoche. */
    ParsearVisual(texto: string, formato?: VisualDateFormat): Respuesta<Date>;
    /** Emite DATE o DATETIME de MySQL, sin zona horaria ni milisegundos. */
    FormatearAlmacenamiento(fecha: Date, tipo?: StorageDateType): Respuesta<string>;
    /** Lee estrictamente DATE o DATETIME de MySQL como calendario local. */
    ParsearAlmacenamiento(texto: string, tipo?: StorageDateType): Respuesta<Date>;
    /** Suma o resta unidades enteras sin modificar el Date original. */
    Agregar(fecha: Date, cantidad: number, unidad: DateUnit): Respuesta<Date>;
    /** Compara instantes: -1 si izquierda es anterior, 0 si igual, 1 si posterior. */
    Comparar(izquierda: Date, derecha: Date): Respuesta<DateComparison>;
    /** Cuenta días de calendario local: izquierda menos derecha. */
    DiferenciaDias(izquierda: Date, derecha: Date): Respuesta<number>;
    /** Comprueba un intervalo inclusivo; rechaza inicio posterior a fin. */
    EstaEnRango(fecha: Date, inicio: Date, fin: Date): Respuesta<boolean>;
    /** Obtiene las 00:00:00.000 de la fecha local. */
    InicioDelDia(fecha: Date): Respuesta<Date>;
    /** Obtiene las 23:59:59.999 de la fecha local. */
    FinDelDia(fecha: Date): Respuesta<Date>;
}
