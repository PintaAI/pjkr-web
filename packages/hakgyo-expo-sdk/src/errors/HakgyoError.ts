export class HakgyoError extends Error {
  public code: string;
  public originalError?: unknown;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', originalError?: unknown) {
    super(message);
    this.name = 'HakgyoError';
    this.code = code;
    this.originalError = originalError;
  }
}
