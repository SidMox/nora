import type { SimpleValidation } from "../interfaces/ValidationControl.ts";

/** Comprueba que el dato sea texto y contenga algún carácter distinto de espacios. */
export const TextoNoVacio: SimpleValidation<unknown> = (input) => {
    if (typeof input !== 'string') return 'Debe ser un texto.';
    return input.trim().length === 0 ? 'No debe estar vacío.' : undefined;
};
