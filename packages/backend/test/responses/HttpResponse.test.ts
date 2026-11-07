import { Respuesta } from '@mox/shared';
import { HttpResponse } from '../../src/responses/HttpResponse.ts';

describe('HttpResponse', () => {
    test('deriva estados y permite seleccionar uno explícito', () => {
        expect(HttpResponse(Respuesta.FromSuccess(true)).status).toBe(200);
        expect(HttpResponse(Respuesta.FromError(undefined, 'fallo')).status).toBe(500);
        expect(HttpResponse(Respuesta.FromError(undefined, 'ausente').SetCodigo('404')).status).toBe(404);
        expect(HttpResponse(Respuesta.FromWarning(false)).status).toBe(200);
        expect(HttpResponse(Respuesta.FromSuccess(true), 201).status).toBe(201);
        expect(() => HttpResponse(Respuesta.FromSuccess(true), 600)).toThrow(RangeError);
    });

    test('conserva datos públicos sin exponer errores internos ni modificar el original', () => {
        const respuesta = Respuesta.FromError(new Error('secreto'), 'detalle interno', false).AddObs('Observación');
        const result = HttpResponse(respuesta, 400);
        expect(result.body).toEqual({ codigo: '500', tipoRespuesta: 'ERROR', descripcion: 'Error Externo', data: false, obs: ['Observación'] });
        result.body.obs?.push('Otra');
        expect(respuesta.obs).toEqual(['Observación']);
        expect(respuesta.error_desc).toBe('detalle interno');
    });
});
