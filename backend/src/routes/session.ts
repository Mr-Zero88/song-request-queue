import { Router } from 'express';
import * as controllers from '../controllers/session';
import { handleError, Request } from '../util';
import { Session } from 'song-request-queue-common/types/session';
import { handleSession } from '../middlewares/sessionHandler';
import { ApiError } from '../middlewares/errorHandler';

const router = Router();
router.post('/', createSession);
router.get('/', handleSession, getSession);
router.delete('/', handleSession, deleteSession);

export async function createSession(req: Request<null, Session, {username: string}>) {
    let session = await controllers.createSession(req.body?.username).catch(handleError);
    if(session instanceof Error) return req.next();
    req.res.cookie('sessionId', session.id, { httpOnly: true });
    req.res.status(200).json(session);
}

export async function getSession(req: Request<null, Session | null, null>) {
    req.res.status(200).json(req.session);
}

export async function deleteSession(req: Request<null, null, null>) {
    if(req.session) await controllers.deleteSession(req.session);
    req.res.clearCookie('sessionId', { httpOnly: true })
}

export default router;
