import { HakgyoError } from './HakgyoError';

export class NetworkError extends HakgyoError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'NETWORK_ERROR', originalError);
    this.name = 'NetworkError';
  }
}
