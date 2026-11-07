import type { Respuesta } from "@mox/shared";

export interface UseCaseControl<T_PARAMS = unknown, T_RESPONSE = unknown> {
    /** Ejecuta la acción del caso de uso. */
    Call(input: T_PARAMS): Promise<Respuesta<T_RESPONSE>>;
}