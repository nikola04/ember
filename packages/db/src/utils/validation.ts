const PG_UNIQUE_VIOLATION = '23505';

interface PostgresError {
    code: string;
    constraint?: string;
    detail?: string;
    table?: string;
    column?: string;
}

function unwrapPgError(err: unknown): PostgresError | null {
    if (typeof err !== 'object' || err === null) return null;
    const candidate = err as Record<string, unknown>;
    if (typeof candidate.code === 'string' && candidate.code.length === 5) {
        return candidate as unknown as PostgresError;
    }
    if ('cause' in candidate) return unwrapPgError(candidate.cause);
    return null;
}

export function isUniqueViolation(err: unknown): boolean {
    return unwrapPgError(err)?.code === PG_UNIQUE_VIOLATION;
}

export function uniqueViolationField(err: unknown, field: string): boolean {
    const pg = unwrapPgError(err);
    if (!pg) return false;
    if ((pg.constraint ?? '').includes(field)) return true;
    if ((pg.detail ?? '').includes(`(${field})`)) return true;
    return false;
}
