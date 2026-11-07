import { EnvironmentAdapter } from '../../../src/libraries/Environment/EnvironmentAdapter.ts';

test('aplica valores por defecto y convierte un puerto válido sin mutar entradas', () => {
    const adapter = new EnvironmentAdapter();
    expect(adapter.Load({}).data).toEqual({ port: 3001, environment: 'development', logLevel: 'info' });
    const environment = Object.freeze({ PORT: '0', NODE_ENV: 'production', LOG_LEVEL: 'warn' });
    expect(adapter.Load(environment).data).toEqual({ port: 0, environment: 'production', logLevel: 'warn' });
    expect(environment.PORT).toBe('0');
});

test.each(['', ' ', '-1', '65536', '3.5', 'NaN', 'Infinity'])('rechaza PORT=%s', (port) => {
    const result = new EnvironmentAdapter().Load({ PORT: port });
    expect(result.tipoRespuesta).toBe('ERROR');
    expect(result.data).toBeUndefined();
});

test('acumula errores sin incluir valores sensibles', () => {
    const result = new EnvironmentAdapter().Load({ PORT: 'secreto', NODE_ENV: 'incorrecto', LOG_LEVEL: 'incorrecto' });
    expect(result.obs).toHaveLength(3);
    expect(JSON.stringify(result)).not.toContain('secreto');
});
