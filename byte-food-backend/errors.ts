import { GraphQLError, GraphQLFormattedError } from 'graphql';

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
  
  const gqlError = error as GraphQLError;
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const originalError = gqlError.originalError;

  if (isDevelopment) {
    console.error('GraphQL Error:', {
      message: gqlError.message,
      path: gqlError.path,
      originalError: originalError?.message,
    });
  }

  if (originalError && typeof originalError === 'object' && 'issues' in originalError) {
    const zodError = originalError as { issues: Array<{ message: string; path: (string | number)[] }> };
    const firstIssue = zodError.issues[0];
    
    return {
      ...formattedError,
      message: firstIssue.message,
      extensions: {
        code: 'VALIDATION_ERROR',
        field: firstIssue.path.join('.'),
        ...(isDevelopment && { details: zodError.issues }),
      },
    };
  }

  if (originalError instanceof AppError) {
    return {
      ...formattedError,
      message: originalError.message,
      extensions: {
        code: originalError.code,
        statusCode: originalError.statusCode,
        ...(isDevelopment && { stack: gqlError.stack }),
      },
    };
  }

  return {
    ...formattedError,
    message: isDevelopment || gqlError.message.includes('not found') 
      ? gqlError.message 
      : 'An unexpected error occurred. Please try again later.',
    extensions: {
      ...formattedError.extensions,
      code: formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR',
    },
  };
}