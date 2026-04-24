import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status: number;
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 'status' in error;
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isApiError(err)) {
    console.warn(`Not an ApiError: ${err instanceof Error ? err.message : String(err)}`);
    res.status(500).json(formatError(err));
  } else {
    res.status(err.status || 500).json(formatError(err));
    if(err.status >= 500) {
      console.error(`Server error: `, err);
    }
  }  
};

function formatError(error: ApiError): object {
  return {
      status: error.status || 500,
      name: error.name,
      message: error.message || 'Internal Server Error',
      cause: (error as any).cause ? formatError((error as any).cause) : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
}
