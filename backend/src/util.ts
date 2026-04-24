import * as express from "express";
import { ApiError } from "./middlewares/errorHandler";


export function handleError(error: unknown) {
    if (error instanceof Error) {
        return error;
    }
    if(typeof error === 'string') {
        return new Error(error);
    }
    return new Error('An unknown error occurred');
}

export interface Request<ReqParams, ResBody, ReqBody> extends express.Request<ReqParams, ResBody, ReqBody> {
    res: express.Response<ResBody>;
    next: express.NextFunction;
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 2 + 9);
}