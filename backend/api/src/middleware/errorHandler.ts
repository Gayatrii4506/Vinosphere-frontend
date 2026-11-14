import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';
import { logger } from '../config/logger';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.name === 'MulterError') {
    err.statusCode = 400;
    err.isOperational = true;
    if (err.code === 'LIMIT_FILE_SIZE') {
      err.message = 'File is too large. Maximum size allowed is 25MB.';
    }
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error for our own debugging
  logger.error(`${err.statusCode} - ${err.message}`, err);

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production Mode: don't leak stack traces to the client
    if (err.isOperational) {
      // Operational, trusted error: send message to client
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // Programming or other unknown error: don't leak error details
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
};
