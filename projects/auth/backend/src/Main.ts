import process from 'node:process';
import { EnvironmentAdapter, LoggerAdapter } from '@mox/backend';
import { CreateApplication } from './Application.ts';

const configuration = new EnvironmentAdapter().Load(process.env);
if (configuration.tipoRespuesta === 'ERROR' || configuration.data === undefined) {
    console.error('Configuración inválida', configuration.obs);
    process.exitCode = 1;
} else {
    const logger = new LoggerAdapter(configuration.data.logLevel);
    const application = CreateApplication({ logger, production: configuration.data.environment === 'production' });
    const result = await application.Start(configuration.data.port);
    if (result.tipoRespuesta === 'ERROR' || result.data === undefined) {
        const logged = logger.Write({ level: 'error', message: 'No se pudo iniciar auth', context: { error: result.error } });
        if (logged.tipoRespuesta === 'ERROR') console.error('No se pudo registrar el fallo de arranque');
        process.exitCode = 1;
    } else {
        const logged = logger.Write({ level: 'info', message: `Auth API disponible en el puerto ${result.data}` });
        if (logged.tipoRespuesta === 'ERROR') console.error('No se pudo registrar el arranque');
        process.once('SIGINT', Shutdown);
        process.once('SIGTERM', Shutdown);
    }

    /** Cierra el servidor cuando termina el proceso y registra fallos de cierre. */
    async function Shutdown(): Promise<void> {
        const response = await application.Stop();
        if (response.tipoRespuesta === 'ERROR') {
            const logged = logger.Write({ level: 'error', message: 'No se pudo cerrar auth', context: { error: response.error } });
            if (logged.tipoRespuesta === 'ERROR') console.error('No se pudo registrar el fallo de cierre');
            process.exitCode = 1;
        }
    }
}
