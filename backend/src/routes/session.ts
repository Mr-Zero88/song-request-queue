import { json, Router, NextFunction, Request, Response } from 'express';
import * as controllers from '../controllers/session';

const router = Router();
router.use(json());
router.get('/', getSession);
router.post('/', createSession);

export function getSession(req: Request, res: Response, next: NextFunction) {
    controllers.getSession({ id: req.cookies?.sessionId }).then(data => next(data)).catch(error => next(error));
}

export function createSession(req: Request, res: Response, next: NextFunction) {
    controllers.createSession(req.body).then(data => {
        res.cookie('sessionId', data.id, { httpOnly: true });
        next(data);
    }).catch(error => next(error));
}

export default router;