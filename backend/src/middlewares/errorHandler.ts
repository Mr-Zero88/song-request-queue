import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status: number;
}

function isAppError(error: unknown): error is AppError {
  return error instanceof Error && 'status' in error;
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isAppError(err)) {
    console.warn(`Not an AppError: ${err instanceof Error ? err.message : String(err)}`);
  } else {
    res.status(err.status || 500).json(formatError(err));
    if(err.status >= 500) {
      console.error(`Server error: `, err);
    }
  }  
};

function formatError(error: AppError): object {
  return {
      name: error.name,
      message: error.message || 'Internal Server Error',
      cause: (error as any).cause ? formatError((error as any).cause) : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
}
