type LogLevel = 'info' | 'error' | 'warn' | 'debug';

interface LogContext {
  requestId?: string;
  [key: string]: any;
}

class Logger {
  private format(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...(context || {}),
    });
  }

  info(message: string, context?: LogContext) {
    console.info(this.format('info', message, context));
  }

  error(message: string, context?: LogContext) {
    console.error(this.format('error', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.format('warn', message, context));
  }

  debug(message: string, context?: LogContext) {
    console.debug(this.format('debug', message, context));
  }
}

export const logger = new Logger();
