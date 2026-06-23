export abstract class AppError extends Error {
    abstract readonly code: string;
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ConflictError extends AppError {
    readonly code = 'CONFLICT';
}
export class NotFoundError extends AppError {
    readonly code = 'NOT_FOUND';
}
export class UnauthorizedError extends AppError {
    readonly code = 'UNAUTHORIZED';
}
export class ForbiddenError extends AppError {
    readonly code = 'FORBIDDEN';
}
export class ValidationError extends AppError {
    readonly code = 'VALIDATION';
    constructor(
        message: string,
        public readonly fields?: Record<string, string>
    ) {
        super(message);
    }
}
