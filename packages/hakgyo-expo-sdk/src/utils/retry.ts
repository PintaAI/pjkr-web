import { logger } from './logger';

interface RetryOptions {
  retries?: number;
  minTimeout?: number;
  maxTimeout?: number;
  factor?: number;
  onRetry?: (error: unknown, attempt: number) => void;
  shouldRetry?: (error: unknown) => boolean;
}

const defaultOptions: Required<Omit<RetryOptions, 'shouldRetry'>> & { shouldRetry?: (error: unknown) => boolean } = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 5000,
  factor: 2,
  onRetry: () => {},
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > opts.retries || (opts.shouldRetry && !opts.shouldRetry(error))) {
        throw error;
      }

      opts.onRetry(error, attempt);

      const delay = Math.min(
        opts.minTimeout * Math.pow(opts.factor, attempt - 1),
        opts.maxTimeout
      );

      logger.debug(`Retrying operation (attempt ${attempt}/${opts.retries}) in ${delay}ms`);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
