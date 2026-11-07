import { DateAdapter } from '../../src/Dates/DateAdapter.ts';
import type { DateControl, VisualDateFormat } from '../../src/Dates/DateControl.ts';

/** Construye un calendario local sin depender del huso horario del equipo. */
function FechaLocal(year = 2024, month = 2, day = 29): Date {
    return new Date(year, month - 1, day, 13, 4, 5, 678);
}

/** Comprueba la comunicación de errores sin excepciones públicas. */
function EsperarError(respuesta: { tipoRespuesta: string; codigo: string; error?: unknown }): void {
    expect(respuesta.tipoRespuesta).toBe('ERROR');
    expect(respuesta.codigo).toBe('DATE_ERROR');
    expect(respuesta.error).toBeInstanceOf(Error);
}

describe('DateAdapter cumple DateControl', () => {
    const adapter: DateControl = new DateAdapter();

    test('presentación por defecto independiente de persistencia', () => {
        expect(adapter.FormatearVisual(FechaLocal()).data).toBe('29/02/2024');
        expect(adapter.FormatearAlmacenamiento(FechaLocal()).data).toBe('2024-02-29 13:04:05');
        expect(adapter.FormatearAlmacenamiento(FechaLocal(), 'DATE').data).toBe('2024-02-29');
        const customized = new DateAdapter({ visualFormat: 'MM/DD/YYYY' });
        expect(customized.FormatearVisual(FechaLocal()).data).toBe('02/29/2024');
        expect(customized.FormatearAlmacenamiento(FechaLocal(), 'DATE').data).toBe('2024-02-29');
        expect(customized.FormatearVisual(FechaLocal(), 'YYYY-MM-DD').data).toBe('2024-02-29');
    });

    test.each([
        ['29/02/2024', 'DD/MM/YYYY'], ['2024-02-29', 'YYYY-MM-DD'], ['02/29/2024', 'MM/DD/YYYY'],
    ] as const)('parseo visual estricto de %s', (texto, formato) => {
        const fecha = adapter.ParsearVisual(texto, formato).data!;
        expect([fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), fecha.getHours()]).toEqual([2024, 1, 29, 0]);
        expect(adapter.FormatearVisual(fecha, formato).data).toBe(texto);
    });

    test.each(['29/02/2023', '31/04/2024', '1/02/2024', '01/2/2024', '01/01/24', ' 01/01/2024', '01/01/2024x', ''])('rechaza fecha visual inválida: %s', texto => {
        EsperarError(adapter.ParsearVisual(texto));
    });

    test('parsea MySQL y no introduce conversiones UTC ni fracciones implícitas', () => {
        const fecha = adapter.ParsearAlmacenamiento('2024-02-29 13:04:05').data!;
        expect([fecha.getHours(), fecha.getMinutes(), fecha.getSeconds(), fecha.getMilliseconds()]).toEqual([13, 4, 5, 0]);
        expect(adapter.FormatearAlmacenamiento(fecha).data).toBe('2024-02-29 13:04:05');
        const soloFecha = adapter.ParsearAlmacenamiento('2024-02-29', 'DATE').data!;
        expect(soloFecha.getHours()).toBe(0);
    });

    test.each(['0000-00-00', '0999-12-31', '10000-01-01', '2023-02-29', '2024-2-01'])('rechaza DATE MySQL inválida: %s', texto => {
        EsperarError(adapter.ParsearAlmacenamiento(texto, 'DATE'));
    });

    test.each(['2024-02-29 24:00:00', '2024-02-29 13:60:00', '2024-02-29 13:04:60', '2024-02-29T13:04:05Z', '2024-02-29 13:04:05.123'])('rechaza DATETIME no canónico: %s', texto => {
        EsperarError(adapter.ParsearAlmacenamiento(texto));
    });

    test('acepta límites MySQL y rechaza años fuera del rango', () => {
        for (const value of ['1000-01-01', '9999-12-31']) {
            expect(adapter.ParsearAlmacenamiento(value, 'DATE').tipoRespuesta).toBe('SUCCESS');
        }
        expect(adapter.ParsearAlmacenamiento('9999-12-31 23:59:59').tipoRespuesta).toBe('SUCCESS');
        EsperarError(adapter.FormatearAlmacenamiento(new Date(999, 0, 1)));
        EsperarError(adapter.FormatearAlmacenamiento(new Date(10000, 0, 1)));
    });

    test('validez no convierte valores externos implícitamente', () => {
        expect(adapter.EsValida(FechaLocal()).data).toBe(true);
        for (const value of [new Date(NaN), '2024-02-29', 0, null, undefined]) {
            expect(adapter.EsValida(value).data).toBe(false);
        }
    });

    test('el reloj es inyectable y devuelve una copia', () => {
        const clock = FechaLocal();
        const adapter = new DateAdapter({}, () => clock);
        const ahora = adapter.Ahora().data!;
        expect(ahora.getTime()).toBe(clock.getTime());
        ahora.setFullYear(2030);
        expect(clock.getFullYear()).toBe(2024);
        EsperarError(new DateAdapter({}, () => new Date(NaN)).Ahora());
        EsperarError(new DateAdapter({}, () => { throw new Error('Reloj no disponible'); }).Ahora());
    });

    test('agrega y resta unidades sin modificar el original, ajustando fin de mes y año bisiesto', () => {
        const fecha = new Date(2024, 0, 31, 12);
        const original = fecha.getTime();
        expect(adapter.Agregar(fecha, 1, 'months').data!.getDate()).toBe(29);
        expect(adapter.Agregar(fecha, -1, 'days').data!.getDate()).toBe(30);
        expect(adapter.Agregar(FechaLocal(), 1, 'years').data!.getDate()).toBe(28);
        expect(adapter.Agregar(fecha, 1, 'hours').data!.getHours()).toBe(13);
        expect(adapter.Agregar(fecha, 1, 'minutes').data!.getMinutes()).toBe(1);
        expect(adapter.Agregar(fecha, 1, 'seconds').data!.getSeconds()).toBe(1);
        expect(adapter.Agregar(fecha, 0, 'days').data).not.toBe(fecha);
        expect(fecha.getTime()).toBe(original);
        EsperarError(adapter.Agregar(fecha, 1.5, 'days'));
        EsperarError(adapter.Agregar(fecha, Infinity, 'days'));
        EsperarError(adapter.Agregar(new Date(8640000000000000), 1, 'years'));
    });

    test('compara y calcula días de calendario a través de cambios de mes y horario', () => {
        const antes = new Date(2024, 2, 9, 23);
        const despues = new Date(2024, 2, 11, 1);
        expect(adapter.Comparar(antes, despues).data).toBe(-1);
        expect(adapter.Comparar(despues, antes).data).toBe(1);
        expect(adapter.Comparar(antes, new Date(antes)).data).toBe(0);
        expect(adapter.DiferenciaDias(despues, antes).data).toBe(2);
        expect(adapter.DiferenciaDias(antes, despues).data).toBe(-2);
    });

    test('comprueba rango inclusivo y rechaza límites invertidos', () => {
        const inicio = new Date(2024, 0, 1);
        const fin = new Date(2024, 0, 31);
        expect(adapter.EstaEnRango(inicio, inicio, fin).data).toBe(true);
        expect(adapter.EstaEnRango(fin, inicio, fin).data).toBe(true);
        expect(adapter.EstaEnRango(new Date(2023, 11, 31), inicio, fin).data).toBe(false);
        EsperarError(adapter.EstaEnRango(inicio, fin, inicio));
    });

    test('inicio y fin del día son locales e inmutables', () => {
        const fecha = FechaLocal();
        const inicio = adapter.InicioDelDia(fecha).data!;
        const fin = adapter.FinDelDia(fecha).data!;
        expect([inicio.getHours(), inicio.getMinutes(), inicio.getSeconds(), inicio.getMilliseconds()]).toEqual([0, 0, 0, 0]);
        expect([fin.getHours(), fin.getMinutes(), fin.getSeconds(), fin.getMilliseconds()]).toEqual([23, 59, 59, 999]);
        expect(fecha.getHours()).toBe(13);
    });

    test('todas las operaciones que requieren fechas comunican entradas inválidas', () => {
        const invalid = new Date(NaN);
        for (const respuesta of [adapter.FormatearVisual(invalid), adapter.FormatearAlmacenamiento(invalid), adapter.Agregar(invalid, 1, 'days'), adapter.Comparar(invalid, FechaLocal()), adapter.DiferenciaDias(FechaLocal(), invalid), adapter.EstaEnRango(invalid, FechaLocal(), FechaLocal()), adapter.InicioDelDia(invalid), adapter.FinDelDia(invalid)]) {
            EsperarError(respuesta);
        }
        EsperarError(adapter.FormatearVisual(FechaLocal(), 'INVALID' as VisualDateFormat));
    });
});
