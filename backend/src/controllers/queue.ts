import {  } from "song-request-queue-common/types/session";
import { queues } from "../database";
import { Queue } from "song-request-queue-common/types/queue";
import { AppError } from "../middlewares/errorHandler";
import { generateId } from "../util";

export const getQueue: (id: string) => Promise<Queue> = async (id) => {
    await queues.ready;
    var queue = queues.find(queue => queue.id === id);
    if(queue == null) throw new QueueNotFoundError(new Error(`Id '${id}' not in queue database`));
    return queue;
}

export const addToQueue: (id: string, link: string) => Promise<Queue> = async (id, link) => {
    let queue = await getQueue(id);
    queue.songs.push({ id: generateId(), link });
    return queue;
}

export class QueueNotFoundError extends Error implements AppError {
    status = 404;
    name = 'QueueNotFoundError';
    constructor(cause: Error) {
        super("Queue not found", { cause });
    }
}