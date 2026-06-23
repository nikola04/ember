import { Elysia, ValidationError } from 'elysia';
import { AppError } from '../core/errors';
import { logger } from '../core/logger';

const STATUS_MAP: Record<string, number> = {
    CONFLICT: 409,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    VALIDATION: 422,
};

export const errorPlugin = new Elysia({ name: 'error-handler' }).onError({ as: 'global' }, ({ error, code, set, status }) => {
    if (error instanceof AppError) {
        return status(STATUS_MAP[error.code] ?? 400, {
            error: error.code,
            message: error.message,
        });
    }

    if (error instanceof ValidationError) {
        set.status = 400;
        return { error: 'Validation error', details: error.all.map((i) => ({ field: i.path, message: i.message })) };
    }

    if (code === 'NOT_FOUND') return status(404, { error: 'NOT_FOUND', message: 'Route not found' });

    logger.error({ err: error }, 'unhandled error');
    return status(500, { error: 'INTERNAL', message: 'Something went wrong' });
});
