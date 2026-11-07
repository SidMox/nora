import { z } from 'zod';
import { Respuesta } from '@mox/shared';
import type { BackendConfiguration, EnvironmentControl } from './EnvironmentControl.ts';

const ENVIRONMENT_SCHEMA = z.object({
    PORT: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0).max(65535)).default(3001),
    NODE_ENV: z.union([z.literal('development'), z.literal('test'), z.literal('production')]).default('development'),
    LOG_LEVEL: z.union([z.literal('debug'), z.literal('info'), z.literal('warn'), z.literal('error')]).default('info'),
});

export class EnvironmentAdapter implements EnvironmentControl {
    /** Devuelve configuración tipada o todas las observaciones sin incluir valores recibidos. */
    public Load(environment: Readonly<Record<string, string | undefined>>): Respuesta<BackendConfiguration> {
        const result = ENVIRONMENT_SCHEMA.safeParse(environment);
        if (!result.success) {
            return Respuesta.FromError<BackendConfiguration>(undefined, 'Configuración inválida')
                .AddMultiObs(result.error.issues.map(function DescribeIssue(issue) {
                    return `${issue.path.join('.')}: ${issue.message}`;
                }));
        }
        return Respuesta.FromSuccess({
            port: result.data.PORT,
            environment: result.data.NODE_ENV,
            logLevel: result.data.LOG_LEVEL,
        });
    }
}
