import { TextoNoVacio } from '../../src/core/validations/TextoNoVacio.ts';
import { LongitudMaxima } from '../../src/core/validations/LongitudMaxima.ts';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Respuesta } from '@mox/shared';
import { ExampleValidationControl, CreateExampleValidationControl, UpdateExampleValidationControl, DeleteExampleValidationControl } from '../../src/example/utils/validations/ExampleValidations.ts';
import { CreateExampleUseCase } from '../../src/example/business/useCases/CreateExampleUseCase.ts';

/** Conserva observaciones sucesivas y detalles técnicos. */
test('Respuesta conserva mensajes, causa y detalle', () => {
    const causa = new Error('fallo');
    const respuesta = Respuesta.FromError(causa, 'detalle').AddObs('uno').AddMultiObs(['dos', 'tres']);
    assert.deepEqual(respuesta.obs, ['uno', 'dos', 'tres']);
    assert.equal(respuesta.error, causa);
    assert.equal(respuesta.error_desc, 'detalle');
    assert.equal('validationIssues' in respuesta, false);
    assert.equal('fromValidationError' in Respuesta, false);
    assert.deepEqual(Respuesta.FromInfo(['información']).obs, ['información']);
});

/** Acumula campos inválidos y comprueba cada campo por separado. */
test('crear acumula problemas y valida descripción independientemente', () => {
    const validator = new CreateExampleValidationControl();
    const respuesta = validator.MasterValidation({ denominacion: ' ', descripcion: '' });
    assert.equal(respuesta.codigo, 'VALIDATION_ERROR');
    assert.equal(respuesta.data, false);
    assert.deepEqual(respuesta.obs, ['denominacion: No debe estar vacío.', 'descripcion: No debe estar vacío.']);
    assert.deepEqual(validator.ValidarDescripcion({ descripcion: ' ' }), ['descripcion: No debe estar vacío.']);
    assert.equal(validator.MasterValidation({ denominacion: 'válida', descripcion: '' }).data, false);
    assert.equal(validator.MasterValidation({ denominacion: 'válida', descripcion: 'válida' }).data, true);
});

/** Incluye casos especiales: actualización parcial, eliminación y control sin reglas. */
test('operaciones respetan sus reglas y rechazan controles no soportados', () => {
    const update = new UpdateExampleValidationControl();
    assert.equal(update.MasterValidation({ id: '1' }).data, true);
    assert.equal(update.MasterValidation({ id: '1', descripcion: ' ' }).data, false);
    assert.equal(update.MasterValidation({ id: '' }).data, false);
    assert.equal(new DeleteExampleValidationControl().MasterValidation({ id: '' }).data, false);
    assert.equal(new DeleteExampleValidationControl().MasterValidation({ id: '1' }).data, true);
    assert.equal(new ExampleValidationControl('MONITOR').MasterValidation({ id: '1' }).data, false);
});

/** Verifica la integración entre validación, caso de uso y repositorio simulado. */
test('crear no persiste entradas inválidas y devuelve la respuesta del repositorio para entradas válidas', async () => {
    let llamadas = 0;
    const repository = {
        async CreateExample(input) {
            llamadas++;
            return Respuesta.FromSuccess({ ...input, id: '1' });
        },
    };
    const useCase = new CreateExampleUseCase(repository);
    const rechazo = await useCase.Call({ denominacion: '', descripcion: '' });
    assert.equal(llamadas, 0);
    assert.equal(rechazo.obs.length, 2);
    const success = await useCase.Call({ denominacion: 'Ejemplo', descripcion: 'Descripción' });
    assert.equal(llamadas, 1);
    assert.equal(success.data.id, '1');
});

/** Las comprobaciones elementales operan sobre datos simples sin Respuesta. */
test('elementales comprueban tipo, espacios y límites de longitud', () => {
    assert.equal(TextoNoVacio('texto'), undefined);
    assert.equal(typeof TextoNoVacio(undefined), 'string');
    assert.equal(typeof TextoNoVacio('  '), 'string');
    assert.equal(LongitudMaxima('abc', 3), undefined);
    assert.equal(typeof LongitudMaxima('abcd', 3), 'string');
    assert.equal(LongitudMaxima('😀', 1), undefined);
});

/** Verifica cada máximo inclusivo y el primer carácter que lo excede. */
test('campos aceptan su máximo y rechazan el exceso', () => {
    const validator = new CreateExampleValidationControl();
    assert.deepEqual(validator.ValidarDenominacion({ denominacion: 'a'.repeat(100) }), []);
    assert.deepEqual(validator.ValidarDenominacion({ denominacion: 'a'.repeat(101) }), ['denominacion: No debe superar 100 caracteres.']);
    assert.deepEqual(validator.ValidarDescripcion({ descripcion: 'a'.repeat(500) }), []);
    assert.deepEqual(validator.ValidarDescripcion({ descripcion: 'a'.repeat(501) }), ['descripcion: No debe superar 500 caracteres.']);
    assert.deepEqual(validator.ValidarObservaciones({ observaciones: 'a'.repeat(1000) }), []);
    assert.deepEqual(validator.ValidarObservaciones({ observaciones: 'a'.repeat(1001) }), ['observaciones: No debe superar 1000 caracteres.']);
});

/** Acumula problemas independientes incluso cuando el texto solo contiene espacios. */
test('campos requeridos acumulan vacío y exceso, observaciones permite vacío y omisión', () => {
    const validator = new CreateExampleValidationControl();
    assert.equal(validator.ValidarDenominacion({ denominacion: ' '.repeat(101) }).length, 2);
    assert.equal(validator.ValidarDescripcion({ descripcion: ' '.repeat(501) }).length, 2);
    assert.equal(validator.ValidarDenominacion({ denominacion: '' }).length, 1);
    assert.equal(validator.ValidarDescripcion({ descripcion: '' }).length, 1);
    assert.deepEqual(validator.ValidarObservaciones({}), []);
    assert.deepEqual(validator.ValidarObservaciones({ observaciones: '' }), []);
    assert.deepEqual(validator.ValidarObservaciones({ observaciones: '   ' }), []);
    assert.equal(validator.ValidarObservaciones({ observaciones: null }).length, 1);
});

/** Comprueba los límites en el maestro para crear y para actualizar parcialmente. */
test('maestro valida los tres campos y conserva la actualización parcial', () => {
    const create = new CreateExampleValidationControl();
    const input = { denominacion: 'a'.repeat(100), descripcion: 'a'.repeat(500), observaciones: 'a'.repeat(1000) };
    assert.equal(create.MasterValidation(input).data, true);
    const invalid = { denominacion: 'a'.repeat(101), descripcion: 'a'.repeat(501), observaciones: 'a'.repeat(1001) };
    assert.equal(create.MasterValidation(invalid).obs.length, 3);
    const update = new UpdateExampleValidationControl();
    assert.equal(update.MasterValidation({ id: '1', ...invalid }).obs.length, 3);
    assert.equal(update.MasterValidation({ id: '1', observaciones: '' }).data, true);
    assert.equal(update.MasterValidation({ id: '1' }).data, true);
    assert.equal(update.MasterValidation({ id: '1', observaciones: 'a'.repeat(1001) }).data, false);
});
