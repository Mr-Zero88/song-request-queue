import { Router } from 'express';
import * as controllers from '../controllers/queue';
import { handleError, Request } from '../util';
import {Queue, GetQueueRequestParams, AddToQueueRequestParams, AddToQueueRequestBody} from "song-request-queue-common/types/queue";

const router = Router();
router.get('/:id', getQueue);
router.put('/:id', addToQueue);

interface GetQueueRequest extends Request<GetQueueRequestParams, Queue, null> {}

export async function getQueue(req: GetQueueRequest) {
    let queue = await controllers.getQueue(req.params.id).catch(handleError);
    if(queue instanceof Error) return req.next(queue);
    req.res.status(200).json(queue);
}

interface AddToQueueRequest extends Request<AddToQueueRequestParams, Queue, AddToQueueRequestBody> {}

export async function addToQueue(req: AddToQueueRequest) {
    let queue = await controllers.addToQueue(req.params.id, req.body?.link).catch(handleError);
    if(queue instanceof Error) return req.next(queue);
    req.res.status(200).json(queue);
}

export default router;