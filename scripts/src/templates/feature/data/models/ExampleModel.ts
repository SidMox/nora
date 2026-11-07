import type { Example } from "../../business/index.ts";

export class ExampleModel implements Example {
    public id: string;
    public denominacion: string;
    public descripcion: string;
    public observaciones?: string;

    /** Inicializa los datos del modelo. */
    constructor(id: string, denominacion: string, descripcion: string, observaciones?: string) {
        this.id = id;
        this.denominacion = denominacion;
        this.descripcion = descripcion;
        this.observaciones = observaciones;
    }

    /** Convierte el modelo al contrato de entidad. */
    public AEntidad(): Example {
        return {
            id: this.id,
            denominacion: this.denominacion,
            descripcion: this.descripcion,
            observaciones: this.observaciones,
        }
    }

    /** Convierte una entidad en un modelo. */
    static DesdeEntidad(input: Example): ExampleModel {
        return new ExampleModel(
            input.id,
            input.denominacion,
            input.descripcion,
            input.observaciones,
        );
    }
}