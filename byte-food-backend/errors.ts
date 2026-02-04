import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { z } from 'zod';

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_EXISTS = 'USER_EXISTS',
  GOOGLE_AUTH_FAILED = 'GOOGLE_AUTH_FAILED',

  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  NOT_FOUND = 'NOT_FOUND',

  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export class AppError extends Error {
  public code: ErrorCode;
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 400,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.VALIDATION_ERROR, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, ErrorCode.UNAUTHORIZED, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.NOT_FOUND, 404);
  }
}

export class UserExistsError extends AppError {
  constructor(message: string = 'User with this email already exists') {
    super(message, ErrorCode.USER_EXISTS, 409);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string = 'Invalid email or password') {
    super(message, ErrorCode.INVALID_CREDENTIALS, 401);
  }
}

export function formatError(
  formattedError: GraphQLFormattedError,
  error: unknown
): GraphQLFormattedError {
  if (!(error instanceof GraphQLError)) {
    return formattedError;
  }

  const isDevelopment = process.env.NODE_ENV !== 'production';
  const { originalError } = error;

  if (isDevelopment) {
    console.error('GraphQL Error:', {
      message: error.message,
      path: error.path,
      originalMessage: originalError instanceof Error ? originalError.message : 'No original error',
    });
  }

  if (originalError instanceof z.ZodError) {
    const firstIssue = originalError.issues[0];
    const message = firstIssue?.message || 'Validation failed';
    const fieldPath = firstIssue?.path.join('.') || 'unknown';

    return {
      ...formattedError,
      message,
      extensions: {
        ...formattedError.extensions,
        code: 'VALIDATION_ERROR',
        field: fieldPath,
        ...(isDevelopment && { details: originalError.issues }),
      },
    };
  }

  if (originalError instanceof AppError) {
    return {
      ...formattedError,
      message: originalError.message,
      extensions: {
        ...formattedError.extensions,
        code: originalError.code,
        statusCode: originalError.statusCode,
        ...(isDevelopment && { stack: error.stack }),
      },
    };
  }

  const isNotFoundError = error.message.toLowerCase().includes('not found');

  return {
    ...formattedError,
    message:
      isDevelopment || isNotFoundError
        ? error.message
        : 'An unexpected error occurred. Please try again later.',
    extensions: {
      ...formattedError.extensions,
      code: formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR',
    },
  };
}
