/* eslint-disable no-console */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      if (data) {
        console.debug(this.formatMessage('debug', message), data);
      } else {
        console.debug(this.formatMessage('debug', message));
      }
    }
  }

  info(message: string, data?: any) {
    if (this.isDevelopment) {
      if (data) {
        console.info(this.formatMessage('info', message), data);
      } else {
        console.info(this.formatMessage('info', message));
      }
    }
  }

  warn(message: string, data?: any) {
    if (data) {
      console.warn(this.formatMessage('warn', message), data);
    } else {
      console.warn(this.formatMessage('warn', message));
    }
  }

  error(message: string, error?: any) {
    if (error) {
      console.error(this.formatMessage('error', message), error);
    } else {
      console.error(this.formatMessage('error', message));
    }
  }
}

export const logger = new Logger();
