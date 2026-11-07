import { Respuesta } from '@mox/shared';
import { add, compareAsc, differenceInCalendarDays, endOfDay, format, getYear, isDate, isValid, isWithinInterval, parse, startOfDay } from 'date-fns';
import type { DateAdapterOptions, DateComparison, DateControl, DateUnit, StorageDateType, VisualDateFormat } from './DateControl.ts';

const VISUAL_FORMATS: Record<VisualDateFormat, string> = {
    'DD/MM/YYYY': 'dd/MM/yyyy',
    'YYYY-MM-DD': 'yyyy-MM-dd',
    'MM/DD/YYYY': 'MM/dd/yyyy',
};
const STORAGE_FORMATS: Record<StorageDateType, string> = { DATE: 'yyyy-MM-dd', DATETIME: 'yyyy-MM-dd HH:mm:ss' };
const DATE_UNITS: readonly DateUnit[] = ['days', 'months', 'years', 'hours', 'minutes', 'seconds'];

/** Encapsula date-fns con operaciones inmutables y errores comunicados mediante Respuesta. */
export class DateAdapter implements DateControl {
    private readonly visualFormat: VisualDateFormat;
    private readonly clock: () => Date;

    /** Configura presentación y un reloj sustituible; no cambia el formato de almacenamiento. */
    constructor(options: DateAdapterOptions = {}, clock: () => Date = () => new Date()) {
        this.visualFormat = options.visualFormat ?? 'DD/MM/YYYY';
        this.clock = clock;
    }

    /** Obtiene una copia de la fecha actual proporcionada por el reloj. */
    Ahora(): Respuesta<Date> {
        return this.Ejecutar(() => new Date(this.ValidarFecha(this.clock()).getTime()));
    }

    /** Valida el objeto sin interpretar números ni cadenas como fechas. */
    EsValida(valor: unknown): Respuesta<boolean> {
        return this.Ejecutar(() => isDate(valor) && isValid(valor));
    }

    /** Emite el formato visual seleccionado sin convertirlo en metadato de persistencia. */
    FormatearVisual(fecha: Date, formato: VisualDateFormat = this.visualFormat): Respuesta<string> {
        return this.Ejecutar(() => format(this.ValidarFecha(fecha), this.FormatoVisual(formato)));
    }

    /** Lee el texto completo y rechaza fechas inexistentes o formatos no canónicos. */
    ParsearVisual(texto: string, formato: VisualDateFormat = this.visualFormat): Respuesta<Date> {
        return this.Ejecutar(() => this.ParsearEstricto(texto, this.FormatoVisual(formato)));
    }

    /** Emite un valor DATE o DATETIME dentro del rango MySQL 1000–9999. */
    FormatearAlmacenamiento(fecha: Date, tipo: StorageDateType = 'DATETIME'): Respuesta<string> {
        return this.Ejecutar(() => format(this.ValidarRangoMySql(fecha), this.FormatoAlmacenamiento(tipo)));
    }

    /** Lee un calendario local de MySQL sin asumir que representa UTC. */
    ParsearAlmacenamiento(texto: string, tipo: StorageDateType = 'DATETIME'): Respuesta<Date> {
        return this.Ejecutar(() => this.ValidarRangoMySql(this.ParsearEstricto(texto, this.FormatoAlmacenamiento(tipo))));
    }

    /** Aplica unidades enteras; meses y años se ajustan al último día disponible. */
    Agregar(fecha: Date, cantidad: number, unidad: DateUnit): Respuesta<Date> {
        return this.Ejecutar(() => {
            this.ValidarFecha(fecha);
            if (!Number.isSafeInteger(cantidad) || !DATE_UNITS.includes(unidad)) throw new Error('Cantidad o unidad de fecha inválida.');
            return this.ValidarFecha(add(fecha, { [unidad]: cantidad }));
        });
    }

    /** Compara el valor temporal de dos fechas válidas. */
    Comparar(izquierda: Date, derecha: Date): Respuesta<DateComparison> {
        return this.Ejecutar(() => compareAsc(this.ValidarFecha(izquierda), this.ValidarFecha(derecha)) as DateComparison);
    }

    /** Calcula diferencia de días de calendario, no bloques de 24 horas. */
    DiferenciaDias(izquierda: Date, derecha: Date): Respuesta<number> {
        return this.Ejecutar(() => differenceInCalendarDays(this.ValidarFecha(izquierda), this.ValidarFecha(derecha)));
    }

    /** Comprueba límites inclusivos y rechaza intervalos invertidos. */
    EstaEnRango(fecha: Date, inicio: Date, fin: Date): Respuesta<boolean> {
        return this.Ejecutar(() => {
            this.ValidarFecha(fecha);
            this.ValidarFecha(inicio);
            this.ValidarFecha(fin);
            if (inicio.getTime() > fin.getTime()) throw new Error('El inicio debe ser anterior o igual al fin.');
            return isWithinInterval(fecha, { start: inicio, end: fin });
        });
    }

    /** Obtiene el inicio local del día sin modificar la entrada. */
    InicioDelDia(fecha: Date): Respuesta<Date> {
        return this.Ejecutar(() => startOfDay(this.ValidarFecha(fecha)));
    }

    /** Obtiene el fin local del día sin modificar la entrada. */
    FinDelDia(fecha: Date): Respuesta<Date> {
        return this.Ejecutar(() => endOfDay(this.ValidarFecha(fecha)));
    }

    /** Rechaza entradas que no sean objetos Date válidos. */
    private ValidarFecha(fecha: Date): Date {
        if (!isDate(fecha) || !isValid(fecha)) throw new Error('Se requiere un objeto Date válido.');
        return fecha;
    }

    /** Comprueba el rango común de DATE y DATETIME de MySQL. */
    private ValidarRangoMySql(fecha: Date): Date {
        this.ValidarFecha(fecha);
        if (getYear(fecha) < 1000 || getYear(fecha) > 9999) throw new Error('MySQL requiere un año entre 1000 y 9999.');
        return fecha;
    }

    /** Traduce formatos del contrato a tokens internos del proveedor. */
    private FormatoVisual(formato: VisualDateFormat): string {
        if (!Object.hasOwn(VISUAL_FORMATS, formato)) throw new Error('Formato visual no soportado.');
        return VISUAL_FORMATS[formato];
    }

    /** Selecciona el formato de persistencia sin aceptar patrones visuales. */
    private FormatoAlmacenamiento(tipo: StorageDateType): string {
        if (!Object.hasOwn(STORAGE_FORMATS, tipo)) throw new Error('Tipo de almacenamiento no soportado.');
        return STORAGE_FORMATS[tipo];
    }

    /** Exige coincidencia exacta y rechaza normalizaciones silenciosas. */
    private ParsearEstricto(texto: string, patron: string): Date {
        if (typeof texto !== 'string') throw new Error('Se requiere un texto de fecha.');
        const fecha = parse(texto, patron, new Date(2000, 0, 1));
        if (!isValid(fecha) || format(fecha, patron) !== texto) throw new Error('La fecha no existe o no cumple el formato esperado.');
        return fecha;
    }

    /** Convierte fallos del proveedor o de entrada en errores genéricos del sistema. */
    private Ejecutar<T_RESULTADO>(operacion: () => T_RESULTADO): Respuesta<T_RESULTADO> {
        try {
            return Respuesta.FromSuccess(operacion());
        } catch (error: unknown) {
            return Respuesta.FromError<T_RESULTADO>(error, error instanceof Error ? error.message : 'No se pudo procesar la fecha.')
                .SetCodigo('DATE_ERROR').SetDescripcion('Error al procesar la fecha');
        }
    }
}
