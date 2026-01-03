export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: any,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VAL001', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super('AUTH003', message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ExternalApiError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`EXT_${service.toUpperCase()}`, message, 502, details);
    this.name = 'ExternalApiError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super('CONFLICT', message, 409, details);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super('RATE_LIMIT', message, 429);
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super('DB_ERROR', message, 500, details);
    this.name = 'DatabaseError';
  }
}

export class BusinessLogicError extends AppError {
  constructor(message: string, code: string = 'BUSINESS_ERROR', details?: any) {
    super(code, message, 422, details);
    this.name = 'BusinessLogicError';
  }
}

