import { Respuesta } from "@mox/shared";
import type { OperationValidation, ValidationControl } from "../../../core/interfaces/ValidationControl.ts";
import { LongitudMaxima } from "../../../core/validations/LongitudMaxima.ts";
import { TextoNoVacio } from "../../../core/validations/TextoNoVacio.ts";
import type { Example, ExampleId } from "../../business/entities/index.ts";
import type { CreateExampleInput, UpdateExampleInput } from "../params/index.ts";

/** Controla los campos de Example y sus parámetros de creación, actualización y eliminación. */
export class ExampleValidationControl<T_INPUT extends Partial<Example> = Example>
    implements ValidationControl<T_INPUT> {
    public readonly operacion: OperationValidation;

    /** Fija la operación durante toda la vida del validador. */
    constructor(operacion: OperationValidation = 'CREATE') {
        this.operacion = operacion;
    }

    /** Devuelve todas las observaciones aplicables al identificador. */
    ValidarId(input: T_INPUT): string[] {
        const observaciones: string[] = [];
        const requerido = TextoNoVacio(input.id);
        if (requerido !== undefined) observaciones.push(`id: ${requerido}`);
        return observaciones;
    }

    /** Devuelve todas las observaciones aplicables a la denominación. */
    ValidarDenominacion(input: T_INPUT): string[] {
        const observaciones: string[] = [];
        const requerido = TextoNoVacio(input.denominacion);
        if (requerido !== undefined) observaciones.push(`denominacion: ${requerido}`);
        if (typeof input.denominacion === 'string') {
            const longitud = LongitudMaxima(input.denominacion, 100);
            if (longitud !== undefined) observaciones.push(`denominacion: ${longitud}`);
        }
        return observaciones;
    }

    /** Devuelve todas las observaciones aplicables a la descripción. */
    ValidarDescripcion(input: T_INPUT): string[] {
        const observaciones: string[] = [];
        const requerido = TextoNoVacio(input.descripcion);
        if (requerido !== undefined) observaciones.push(`descripcion: ${requerido}`);
        if (typeof input.descripcion === 'string') {
            const longitud = LongitudMaxima(input.descripcion, 500);
            if (longitud !== undefined) observaciones.push(`descripcion: ${longitud}`);
        }
        return observaciones;
    }

    /** Comprueba el máximo de observaciones, permitiendo texto vacío o un campo omitido. */
    ValidarObservaciones(input: T_INPUT): string[] {
        if (input.observaciones === undefined) return [];
        if (typeof input.observaciones !== 'string') return ['observaciones: Debe ser un texto.'];
        const longitud = LongitudMaxima(input.observaciones, 1000);
        return longitud === undefined ? [] : [`observaciones: ${longitud}`];
    }

    /** Acumula los campos de la operación y convierte sus observaciones en una respuesta. */
    MasterValidation(input: T_INPUT): Respuesta<boolean> {
        const observaciones: string[] = [];
        switch (this.operacion) {
            case 'CREATE':
                observaciones.push(...this.ValidarDenominacion(input), ...this.ValidarDescripcion(input), ...this.ValidarObservaciones(input));
                break;
            case 'UPDATE':
                observaciones.push(...this.ValidarId(input));
                if (input.denominacion !== undefined) observaciones.push(...this.ValidarDenominacion(input));
                if (input.descripcion !== undefined) observaciones.push(...this.ValidarDescripcion(input));
                if (input.observaciones !== undefined) observaciones.push(...this.ValidarObservaciones(input));
                break;
            case 'DELETE':
                observaciones.push(...this.ValidarId(input));
                break;
            default:
                observaciones.push(`No hay validaciones definidas para ${this.operacion}.`);
        }
        if (observaciones.length === 0) return Respuesta.FromSuccess(true);
        return Respuesta.FromError('VALIDATION_ERROR', 'La entrada no cumple las validaciones', false)
            .SetCodigo('VALIDATION_ERROR')
            .SetDescripcion('La entrada no cumple las validaciones')
            .AddMultiObs(observaciones);
    }
}

export class CreateExampleValidationControl extends ExampleValidationControl<CreateExampleInput> {
    /** Configura las validaciones de creación. */
    constructor() { super('CREATE'); }
}

export class UpdateExampleValidationControl extends ExampleValidationControl<UpdateExampleInput> {
    /** Configura las validaciones de actualización parcial. */
    constructor() { super('UPDATE'); }
}

export class DeleteExampleValidationControl extends ExampleValidationControl<ExampleId> {
    /** Configura las validaciones de eliminación. */
    constructor() { super('DELETE'); }
}
