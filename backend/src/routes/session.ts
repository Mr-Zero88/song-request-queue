import { json, Router, NextFunction, Request, Response } from 'express';
import * as controllers from '../controllers/session';

const router = Router();
router.get('/', getSession);
router.post('/', createSession);

export async function getSession(req: Request, res: Response, next: NextFunction) {
    let session = await controllers.getSession(req.cookies.sessionId).catch(handleError);
    if(session instanceof Error) return next(session);
    res.status(200).json(session);
}

export async function createSession(req: Request, res: Response, next: NextFunction) {
    let session = await controllers.createSession(req.body?.username).catch(handleError);
    if(session instanceof Error) return next(session);
    res.cookie('sessionId', session.id, { httpOnly: true });
    res.status(200).json(session);
}

function handleError(error: unknown) {
    if (error instanceof Error) {
        return error;
    }
    if(typeof error === 'string') {
        return new Error(error);
    }
    return new Error('An unknown error occurred');
}

export default router;