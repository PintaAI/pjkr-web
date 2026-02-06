import { HakgyoError } from './HakgyoError';

export class AuthError extends HakgyoError {
  constructor(message: string, code: string = 'AUTH_ERROR', originalError?: unknown) {
    super(message, code, originalError);
    this.name = 'AuthError';
  }
}
