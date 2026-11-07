import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const FEATURES = join(ROOT, 'packages/features');
const TEMPLATE = join(ROOT, 'scripts/src/templates/feature');

/** Sustituye el nombre de referencia en archivos y contenido de la plantilla. */
function Renombrar(texto: string, nombre: string, nombreClase: string): string {
    return texto.replaceAll('Example', nombreClase).replaceAll('example', nombre);
}

/** Detecta también enlaces rotos para impedir sobrescrituras accidentales. */
function Existe(ruta: string): boolean {
    try {
        lstatSync(ruta);
        return true;
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') return false;
        throw error;
    }
}

/** Rechaza enlaces simbólicos en los directorios que utilizará el comando. */
function ValidarRuta(ruta: string): void {
    let actual = ruta;
    while (actual !== dirname(actual)) {
        if (Existe(actual) && lstatSync(actual).isSymbolicLink()) throw new Error(`No se permiten enlaces simbólicos: ${actual}`);
        actual = dirname(actual);
    }
}

/** Copia las fuentes de la plantilla feature sin generar reglas o campos de negocio nuevos. */
function CopiarPlantilla(origen: string, destino: string, nombre: string, nombreClase: string): void {
    for (const elemento of readdirSync(origen, { withFileTypes: true })) {
        if (['test', 'node_modules', 'dist'].includes(elemento.name)) continue;
        if (elemento.isSymbolicLink()) throw new Error('La plantilla no puede contener enlaces simbólicos.');
        const entrada = join(origen, elemento.name);
        const salida = join(destino, Renombrar(elemento.name, nombre, nombreClase));
        if (elemento.isDirectory()) {
            mkdirSync(salida);
            CopiarPlantilla(entrada, salida, nombre, nombreClase);
        } else if (elemento.isFile() && elemento.name.endsWith('.ts')) {
            writeFileSync(salida, Renombrar(readFileSync(entrada, 'utf8'), nombre, nombreClase), { flag: 'wx' });
        }
    }
}

/** Crea la característica y su resumen usando la plantilla feature. */
function CrearCaracteristica(nombre: string): void {
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(nombre)) {
        throw new Error('Usa un nombre en minúsculas y guiones, por ejemplo producto u orden-compra.');
    }
    if (['example', 'core', 'shared', 'index'].includes(nombre)) throw new Error('Ese nombre está reservado.');
    const nombreClase = nombre.split('-').map(parte => parte[0].toUpperCase() + parte.slice(1)).join('');
    const destino = join(FEATURES, 'src', nombre);
    const documento = join(FEATURES, 'documentation', `${nombreClase}.md`);
    ValidarRuta(TEMPLATE);
    ValidarRuta(destino);
    ValidarRuta(documento);
    if (Existe(destino) || Existe(documento)) throw new Error('La característica o su documentación ya existe; no se sobrescribe.');
    // Evita nombres de tipos duplicados por distintas combinaciones de guiones y números.
    for (const elemento of readdirSync(join(FEATURES, 'src'), { withFileTypes: true })) {
        if (elemento.isDirectory()) {
            const existente = elemento.name.split('-').map(parte => parte[0]?.toUpperCase() + parte.slice(1)).join('');
            if (existente === nombreClase) throw new Error('El nombre generaría tipos que ya existen en otra característica.');
        }
    }
    const resumen = Renombrar(readFileSync(join(TEMPLATE, 'documentation.md.template'), 'utf8'), nombre, nombreClase);
    const temporal = mkdtempSync(join(FEATURES, 'src', '.crear-caracteristica-'));
    let documentoCreado = false;
    try {
        CopiarPlantilla(TEMPLATE, temporal, nombre, nombreClase);
        if (Existe(destino)) throw new Error('El destino apareció durante la creación; operación cancelada.');
        mkdirSync(dirname(documento), { recursive: true });
        writeFileSync(documento, resumen, { flag: 'wx' });
        documentoCreado = true;
        renameSync(temporal, destino);
    } catch (error: unknown) {
        if (documentoCreado) unlinkSync(documento);
        throw error;
    } finally {
        if (existsSync(temporal)) rmSync(temporal, { recursive: true });
    }
    console.log(`Característica creada: packages/features/src/${nombre}`);
    console.log(`Resumen: packages/features/documentation/${nombreClase}.md`);
    console.log('Adapta los campos y las validaciones heredados de la plantilla a tu dominio.');
}

try {
    const argumentos = process.argv.slice(2);
    if (argumentos.length === 1 && argumentos[0] === '--help') {
        console.log('Uso: pnpm feature:create <nombre>\nEjemplo: pnpm feature:create orden-compra');
    } else {
        if (argumentos.length !== 1) throw new Error('Uso: pnpm feature:create <nombre>');
        CrearCaracteristica(argumentos[0]);
    }
} catch (error: unknown) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
}
