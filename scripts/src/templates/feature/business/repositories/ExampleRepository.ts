import type { Respuesta } from "@mox/shared";
import type { CreateExampleInput, UpdateExampleInput } from "../../utils/params/index.ts";
import type { Example, ExampleId } from "../entities/index.ts";

export interface ExampleRepository<T_ENTIDAD extends Example> {
    /** Obtiene todos los ejemplos. */
    GetAllExample(): Promise<Respuesta<T_ENTIDAD[]>>;
    /** Crea un ejemplo con identificador opcional. */
    CreateExample(input: CreateExampleInput): Promise<Respuesta<T_ENTIDAD>>;
    /** Actualiza los campos proporcionados de un ejemplo. */
    UpdateExample(input: UpdateExampleInput): Promise<Respuesta<T_ENTIDAD>>;
    /** Crea varios ejemplos y devuelve sus identificadores. */
    CreateMultiExample(input: CreateExampleInput[]): Promise<Respuesta<ExampleId[]>>;
    /** Actualiza varios ejemplos y devuelve sus identificadores. */
    UpdateMultiExample(input: UpdateExampleInput[]): Promise<Respuesta<ExampleId[]>>;
    /** Elimina un ejemplo y devuelve su identificador. */
    DeleteExample(input: ExampleId): Promise<Respuesta<ExampleId>>;
    /** Elimina varios ejemplos y devuelve sus identificadores. */
    DeleteMultiExample(input: ExampleId[]): Promise<Respuesta<ExampleId[]>>;
}