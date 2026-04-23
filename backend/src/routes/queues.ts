import { Router } from 'express';
import * as controllers from '../controllers/queue';
import { handleError, Request } from '../util';
import {Queue, GetQueueRequestParams, AddToQueueRequestParams, AddToQueueRequestBody} from "song-request-queue-common/types/queue";

const router = Router();
router.get('/', getQueues);

interface GetQueueRequest extends Request<null, Queue[], null> {}

export async function getQueues(req: GetQueueRequest) {
    let queues = await controllers.getQueues().catch(handleError);
    if(queues instanceof Error) return req.next(queues);
    req.res.status(200).json(queues);
}

export default router;