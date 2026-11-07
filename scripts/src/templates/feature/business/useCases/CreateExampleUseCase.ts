import type { ValidationControl } from "../../../core/interfaces/ValidationControl.ts";
import { CreateExampleValidationControl } from "../../utils/validations/ExampleValidations.ts";
import { Respuesta } from "@mox/shared";
import type { UseCaseControl } from "../../../core/interfaces/UseCaseControl.ts";
import type { CreateExampleInput } from "../../utils/params/index.ts";
import type { Example } from "../entities/index.ts";
import type { ExampleRepository } from "../repositories/index.ts";

export class CreateExampleUseCase<T_ENTIDAD extends Example> implements UseCaseControl<CreateExampleInput, T_ENTIDAD> {
    private readonly repository: ExampleRepository<T_ENTIDAD>;
    private readonly validations: ValidationControl<CreateExampleInput>;

    /** Inyecta el repositorio y las validaciones de creación. */
    constructor(
        repository: ExampleRepository<T_ENTIDAD>,
        validations: ValidationControl<CreateExampleInput> = new CreateExampleValidationControl(),
    ) {
        this.repository = repository;
        this.validations = validations;
    }
    /** Valida la entrada antes de persistir el ejemplo. */
    async Call(input: CreateExampleInput): Promise<Respuesta<T_ENTIDAD>> {
        const validation = this.validations.MasterValidation(input);
        if (validation.tipoRespuesta !== 'SUCCESS' || validation.data !== true) {
            return Respuesta.FromError<T_ENTIDAD>(validation.error, validation.error_desc ?? validation.descripcion)
                .SetCodigo(validation.codigo)
                .SetDescripcion(validation.descripcion)
                .AddMultiObs(validation.obs ?? []);
        }
        return await this.repository.CreateExample(input);
    }
}