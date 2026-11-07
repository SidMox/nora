import { Respuesta } from "@mox/shared";
import type { ExampleDataSource, ExampleId, ExampleRepository } from "../../business/index.ts";
import type { CreateExampleInput, UpdateExampleInput } from "../../utils/params/index.ts";
import { ExampleModel } from "../models/ExampleModel.ts";

export class ExampleRepositoryImpl implements ExampleRepository<ExampleModel> {
    private readonly dataSource: ExampleDataSource;

    /** Recibe la fuente de datos elegida por el consumidor. */
    constructor(dataSource: ExampleDataSource) {
        this.dataSource = dataSource;
    }

    /** Obtiene los ejemplos conservando los errores de la fuente de datos. */
    async GetAllExample(): Promise<Respuesta<ExampleModel[]>> {
        return this.Ejecutar(() => this.dataSource.GetAllExample(),
            ejemplos => ejemplos.map(ExampleModel.DesdeEntidad));
    }

    /** Crea un ejemplo y convierte el resultado en modelo. */
    async CreateExample(input: CreateExampleInput): Promise<Respuesta<ExampleModel>> {
        return this.Ejecutar(() => this.dataSource.CreateExample(input), ExampleModel.DesdeEntidad);
    }

    /** Actualiza un ejemplo y convierte el resultado en modelo. */
    async UpdateExample(input: UpdateExampleInput): Promise<Respuesta<ExampleModel>> {
        return this.Ejecutar(() => this.dataSource.UpdateExample(input), ExampleModel.DesdeEntidad);
    }

    /** Crea varios ejemplos y conserva sus identificadores. */
    async CreateMultiExample(input: CreateExampleInput[]): Promise<Respuesta<ExampleId[]>> {
        return this.Ejecutar(() => this.dataSource.CreateMultiExample(input), identificadores => identificadores);
    }

    /** Actualiza varios ejemplos y conserva sus identificadores. */
    async UpdateMultiExample(input: UpdateExampleInput[]): Promise<Respuesta<ExampleId[]>> {
        return this.Ejecutar(() => this.dataSource.UpdateMultiExample(input), identificadores => identificadores);
    }

    /** Elimina un ejemplo y conserva su identificador. */
    async DeleteExample(input: ExampleId): Promise<Respuesta<ExampleId>> {
        return this.Ejecutar(() => this.dataSource.DeleteExample(input), identificador => identificador);
    }

    /** Elimina varios ejemplos y conserva sus identificadores. */
    async DeleteMultiExample(input: ExampleId[]): Promise<Respuesta<ExampleId[]>> {
        return this.Ejecutar(() => this.dataSource.DeleteMultiExample(input), identificadores => identificadores);
    }

    /** Propaga estados no exitosos, comprueba datos requeridos y controla excepciones. */
    private async Ejecutar<T_ORIGEN, T_RESULTADO>(
        operacion: () => Promise<Respuesta<T_ORIGEN>>,
        transformar: (data: T_ORIGEN) => T_RESULTADO,
    ): Promise<Respuesta<T_RESULTADO>> {
        try {
            const respuesta = await operacion();
            if (respuesta.tipoRespuesta !== 'SUCCESS') {
                return respuesta.TransformarDatos<T_RESULTADO>(() => undefined);
            }
            if (respuesta.data === undefined) {
                return Respuesta.FromError<T_RESULTADO>(
                    'DATOS_REQUERIDOS', 'La fuente de datos devolvió éxito sin los datos requeridos.',
                ).SetCodigo('INVALID_DATA_SOURCE_RESPONSE').AddMultiObs(respuesta.obs ?? []);
            }
            return respuesta.TransformarDatos(transformar);
        } catch (error: unknown) {
            return Respuesta.FromError<T_RESULTADO>(error, 'No se pudo completar la operación del repositorio.');
        }
    }
}
