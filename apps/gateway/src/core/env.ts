import { z } from '@ember/protocol';

const EnvSchema = z.object({
    // --- runtime ---
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    VERSION: z.string().default(process.env.npm_package_version ?? '0.0.0'),
    PORT: z.coerce.number().int().positive().default(3000),
    HOSTNAME: z.string().default('0.0.0.0'),
    // --- jwt ---
    JWT_SECRET: z.string().min(24).max(512),
    JWT_ACCESS_TTL: z.coerce.number().positive(),
    JWT_REFRESH_TTL: z.coerce.number().positive(),
    // --- database ---
    DATABASE_URL: z.url(),
    // --- logging ---
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

function loadEnv() {
    const parsed = EnvSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error('❌ Invalid environment:');
        for (const issue of parsed.error.issues) {
            console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
        }
        process.exit(1);
    }

    return parsed.data;
}

export const env = loadEnv();
export type Env = z.infer<typeof EnvSchema>;
