import type { SimpleValidation } from "../interfaces/ValidationControl.ts";

/** Comprueba el máximo de puntos de código Unicode, incluidos los espacios. */
export const LongitudMaxima: SimpleValidation<string, number> = (input, maximo) => {
    return Array.from(input).length > maximo
        ? `No debe superar ${maximo} caracteres.`
        : undefined;
};
