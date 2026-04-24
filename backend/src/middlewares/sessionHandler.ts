import { Router, NextFunction, Request, Response } from 'express';
import * as controllers from '../controllers/session';
import { handleError } from '../util';
import { Session } from 'song-request-queue-common/types/session';

declare global {
    namespace Express {
        interface Request {
            session: Session | null;
        }
    }
}

export async function handleSession(req: Request, res: Response, next: NextFunction) {
    if(!req.cookies.sessionId) {
        req.session = null;
        return next();
    }
    let session = await controllers.getSession(req.cookies.sessionId).catch(handleError);
    if(session instanceof Error)
        return next(session);
    else
        req.session = session;
    return next();
}