import type { ExampleId } from "./ExampleId.ts";

export interface Example extends ExampleId{
    denominacion: string;
    descripcion: string;
    observaciones?: string;
}