import type { Example } from "../../business/entities/index.ts";

export interface CreateExampleInput extends Partial<Example> {
    denominacion: string;
    descripcion: string;
    observaciones?: string;
}

export interface UpdateExampleInput extends Partial<Example>{
    id: string;
}