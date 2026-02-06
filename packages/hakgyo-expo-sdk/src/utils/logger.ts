export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  public setLevel(level: LogLevel) {
    this.level = level;
  }

  public debug(...args: unknown[]) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug('[HakgyoSDK]', ...args);
    }
  }

  public info(...args: unknown[]) {
    if (this.level <= LogLevel.INFO) {
      console.info('[HakgyoSDK]', ...args);
    }
  }

  public warn(...args: unknown[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn('[HakgyoSDK]', ...args);
    }
  }

  public error(...args: unknown[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error('[HakgyoSDK]', ...args);
    }
  }
}

export const logger = new Logger();
