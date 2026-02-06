import { HakgyoError } from './HakgyoError';

export class ApiError extends HakgyoError {
  public status?: number;
  public data?: unknown;

  constructor(message: string, status?: number, data?: unknown, code: string = 'API_ERROR', originalError?: unknown) {
    super(message, code, originalError);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}
