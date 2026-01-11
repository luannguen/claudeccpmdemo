export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface Failure {
  success: false;
  error: {
    message: string;
    code: ErrorCode;
    details?: any;
  };
}

export interface Success<T> {
  success: true;
  data: T;
}

export type Result<T> = Success<T> | Failure;

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR' as ErrorCode,
  NOT_FOUND: 'NOT_FOUND' as ErrorCode,
  UNAUTHORIZED: 'UNAUTHORIZED' as ErrorCode,
  FORBIDDEN: 'FORBIDDEN' as ErrorCode,
  NETWORK_ERROR: 'NETWORK_ERROR' as ErrorCode,
  SERVER_ERROR: 'SERVER_ERROR' as ErrorCode,
  UNKNOWN_ERROR: 'UNKNOWN_ERROR' as ErrorCode,
};

export function success<T>(data: T): Success<T> {
  return { success: true, data };
}

export function failure(message: string, code: ErrorCode = 'UNKNOWN_ERROR', details?: any): Failure {
  return {
    success: false,
    error: { message, code, details },
  };
}
