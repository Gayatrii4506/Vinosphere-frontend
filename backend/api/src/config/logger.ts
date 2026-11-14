import { env } from './env';

/**
 * A simple application logger wrapper.
 * In production, this can be swapped out for a robust logger like Winston or Pino 
 * without having to change `console.log` statements throughout the codebase.
 */
class Logger {
  info(message: string, meta?: any) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
  }

  warn(message: string, meta?: any) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
  }

  error(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      console.error(error);
    }
  }

  debug(message: string, meta?: any) {
    // Only log debug messages in development
    if (env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta || '');
    }
  }
}

export const logger = new Logger();
