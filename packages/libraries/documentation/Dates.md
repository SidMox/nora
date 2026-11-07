# Dates

Controla fechas mediante el contrato DateControl y su implementación DateAdapter,
que encapsula date-fns y devuelve Respuesta en sus operaciones públicas.

Muestra DD/MM/YYYY por defecto. Para MySQL genera YYYY-MM-DD (DATE) o
YYYY-MM-DD HH:mm:ss (DATETIME), sin guardar el formato visual ni convertir zonas
horarias implícitamente: trabaja con calendario local y años 1000–9999.

Incluye parseo estricto, comprobación de validez, fecha actual con reloj inyectable,
suma/resta, comparación, diferencia de días de calendario, intervalos e inicio/fin
del día. No modifica las fechas recibidas.

Fuente: [Dates](../src/Dates). Pruebas: [DateAdapter](../test/Dates/DateAdapter.test.ts).
