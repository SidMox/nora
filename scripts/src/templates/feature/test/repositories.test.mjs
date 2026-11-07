import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Respuesta } from '@mox/shared';
import { ExampleRepositoryImpl } from '../../src/example/data/repositories/ExampleRepositoryImpl.ts';
import { ExampleModel } from '../../src/example/data/models/index.ts';
import { CreateExampleUseCase } from '../../src/example/business/useCases/index.ts';

const OPERACIONES = ['GetAllExample', 'CreateExample', 'UpdateExample', 'CreateMultiExample', 'UpdateMultiExample', 'DeleteExample', 'DeleteMultiExample'];

/** Comprueba que ningún método transforme estados no exitosos en éxitos. */
test('repositorio propaga error, advertencia e información en todas las operaciones', async () => {
    const causa = new Error('sin conexión');
    for (const respuesta of [
        Respuesta.FromError(causa, 'detalle').SetCodigo('OFFLINE').AddObs('intentar después'),
        Respuesta.FromWarning(undefined, ['pendiente']),
        Respuesta.FromInfo(['sin novedades']),
    ]) {
        const dataSource = Object.fromEntries(OPERACIONES.map(nombre => [nombre, async () => respuesta]));
        const repository = new ExampleRepositoryImpl(dataSource);
        for (const nombre of OPERACIONES) {
            const resultado = await repository[nombre]({ id: '1' });
            assert.equal(resultado.tipoRespuesta, respuesta.tipoRespuesta);
            assert.equal(resultado.codigo, respuesta.codigo);
            assert.equal(resultado.descripcion, respuesta.descripcion);
            assert.equal(resultado.error, respuesta.error);
            assert.equal(resultado.error_desc, respuesta.error_desc);
            assert.deepEqual(resultado.obs, respuesta.obs);
        }
    }
});

/** Comprueba los datos requeridos y las excepciones de la fuente en cada método. */
test('repositorio rechaza éxito sin datos y controla excepciones', async () => {
    for (const nombre of OPERACIONES) {
        const vacio = new ExampleRepositoryImpl({ [nombre]: async () => Respuesta.FromSuccess(undefined) });
        assert.equal((await vacio[nombre]({ id: '1' })).codigo, 'INVALID_DATA_SOURCE_RESPONSE');
        const causa = new Error('fallo');
        const falla = new ExampleRepositoryImpl({ [nombre]: async () => { throw causa; } });
        const resultado = await falla[nombre]({ id: '1' });
        assert.equal(resultado.tipoRespuesta, 'ERROR');
        assert.equal(resultado.error, causa);
    }
});

/** Comprueba listas vacías válidas, conversiones y exportaciones públicas. */
test('repositorio transforma modelos conservando metadatos de éxito', async () => {
    const entidad = { id: '1', denominacion: 'Ejemplo', descripcion: 'Descripción' };
    const repository = new ExampleRepositoryImpl({
        GetAllExample: async () => Respuesta.FromSuccess([]),
        CreateExample: async () => Respuesta.FromSuccess(entidad).SetCodigo('CREATED').SetDescripcion('Creado').AddObs('nota'),
    });
    assert.deepEqual((await repository.GetAllExample()).data, []);
    const creado = await repository.CreateExample(entidad);
    assert.ok(creado.data instanceof ExampleModel);
    assert.deepEqual(creado.data.AEntidad(), { ...entidad, observaciones: undefined });
    assert.equal(creado.codigo, 'CREATED');
    assert.equal(creado.descripcion, 'Creado');
    assert.deepEqual(creado.obs, ['nota']);
    assert.equal(typeof CreateExampleUseCase, 'function');
});
